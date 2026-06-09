const HUG_WM_BASE_URL = 'https://www.hug-ayumu.link/hug/wm/';
const HUG_WM_CONTACT_BOOK_LIST_URL = `${HUG_WM_BASE_URL}contact_book.php`;
const HUG_WM_CHILD_AGREEMENT_FILTER_URL = `${HUG_WM_BASE_URL}ajax/ajax_child_agreement_filter.php`;

const PAGINATION_UL_SELECTOR =
  'body > div.contents > div.ibox > div:nth-child(7) > div > ul';

const CONTACT_BOOK_TABLE_SELECTOR =
  'table.table.lh1_5[data-api-url="contact_book.php"][data-concurrent-edit-target="ContactBook"]';

export type HugChild = { child_id: number; name: string };
export type HugPersonalRecord = {
  date: string;
  childName: string;
  attendance: string;
  note: string;
  user_id: number | null;
  staffName: string;
};

async function hugWmFetch(url: string, options: RequestInit = {}): Promise<string> {
  if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
    const response = await chrome.runtime.sendMessage({
      type: 'api-fetch',
      url,
      options,
    });
    if (!response?.ok) {
      const err =
        response?.error ||
        (typeof response?.body === 'string' ? response.body : `HTTP ${response?.status}`);
      throw new Error(err);
    }
    return typeof response.body === 'string' ? response.body : JSON.stringify(response.body);
  }

  const res = await fetch(url, options);
  if (!res.ok) {
    throw new Error(`HTTP取得エラー: ${res.status}`);
  }
  return res.text();
}

async function hugWmFetchText(url: string): Promise<string> {
  return hugWmFetch(url, { method: 'GET', credentials: 'include' });
}

function buildChildAgreementFilterParams(facilityId: number, targetDate: string) {
  const params = new URLSearchParams();
  params.set(`f_ary[${facilityId}]`, String(facilityId));
  params.set('furigana', '0');
  params.set('parent_flg', 'false');
  params.set('target_date', targetDate);
  return params;
}

function parseChildrenFromAgreementFilterResponse(text: string): HugChild[] {
  const trimmed = text.trim();

  if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
    try {
      const data = JSON.parse(trimmed) as
        | HugChild[]
        | { children?: HugChild[]; child_list?: HugChild[]; list?: HugChild[] };
      const list = Array.isArray(data)
        ? data
        : data.children || data.child_list || data.list || [];

      return list
        .map((item) => ({
          child_id: Number(
            (item as { child_id?: number; id?: number; c_id?: number; value?: number }).child_id ??
              (item as { id?: number }).id ??
              (item as { c_id?: number }).c_id ??
              (item as { value?: number }).value,
          ),
          name: String(
            (item as { name?: string; child_name?: string; text?: string }).name ??
              (item as { child_name?: string }).child_name ??
              (item as { text?: string }).text ??
              '',
          ).trim(),
        }))
        .filter((c) => Number.isFinite(c.child_id) && c.child_id > 0);
    } catch {
      // HTML として続行
    }
  }

  const parseOptions = (doc: Document) =>
    [...doc.querySelectorAll('option')]
      .map((opt) => ({
        child_id: Number((opt as HTMLOptionElement).value),
        name: opt.textContent?.trim() ?? '',
      }))
      .filter((c) => Number.isFinite(c.child_id) && c.child_id > 0);

  const htmlDoc = new DOMParser().parseFromString(trimmed, 'text/html');
  const fromHtml = parseOptions(htmlDoc);
  if (fromHtml.length > 0) {
    return fromHtml;
  }

  const wrappedDoc = new DOMParser().parseFromString(
    `<select>${trimmed}</select>`,
    'text/html',
  );
  return parseOptions(wrappedDoc);
}

  async function fetchContactBookNote(pathAndQuery: string): Promise<{
    note: string;
    user_id: number | null;
    staffName: string;
  } | null> {
    const listUrl = new URL(pathAndQuery, HUG_WM_BASE_URL).href;

    try {
      const html = await hugWmFetchText(listUrl);
      const editDoc = new DOMParser().parseFromString(html, 'text/html');

      const staffSelect = editDoc.querySelector<HTMLSelectElement>(
        'select[name="record_staff"]',
      );

      if (!staffSelect) {
        throw new Error('記録者 select が見つかりませんでした');
      }

      const staffSelectValue = staffSelect.value;
      const staffName = staffSelect.selectedOptions[0]?.textContent?.trim() ?? '';

      console.log('記録者:', staffSelectValue, staffName);

      const textarea = editDoc.querySelector<HTMLTextAreaElement>(
        'textarea[name="note"][data-field-key="note"]',
      );

      if (!textarea) {
        throw new Error('note の textarea が見つかりませんでした');
      }

      return {
        note: textarea.value.trim(),
        user_id: Number.isFinite(Number(staffSelectValue))
          ? Number(staffSelectValue)
          : null,
        staffName,
      };
    } catch (error) {
      console.error('[HUG WM] note取得エラー:', error);
      return null;
    }
  }

function buildContactBookListUrl(params: {
  facilityId: number;
  date: string;
  dateEnd: string;
  childId?: number;
  page?: number;
}) {
  const url = new URL(HUG_WM_CONTACT_BOOK_LIST_URL);
  url.searchParams.set('f_id', String(params.facilityId));
  url.searchParams.set('date', params.date);
  url.searchParams.set('date_end', params.dateEnd);
  if (params.childId != null && params.childId > 0) {
    url.searchParams.set('id', String(params.childId));
  }
  if (params.page != null) {
    url.searchParams.set('page', String(params.page));
  }
  return url.href;
}

function getContactBookPageNumbers(doc: Document) {
  const targetUl = doc.querySelector(PAGINATION_UL_SELECTOR);

  if (!targetUl) {
    return [1];
  }

  const pages = new Set([1]);
  for (const anchor of targetUl.querySelectorAll('a[href]')) {
    const match = anchor.getAttribute('href')?.match(/[?&]page=(\d+)/);
    if (match) {
      pages.add(Number(match[1]));
    }
  }

  return [...pages].sort((a, b) => a - b);
}

async function fetchContactBookListDoc(listUrl: string) {
  const listHtml = await hugWmFetchText(listUrl);
  return new DOMParser().parseFromString(listHtml, 'text/html');
}

/** ajax_child_agreement_filter.php に POST して児童一覧を取得 */
export async function fetchChildrenFromHugWm(params: {
  facilityId: number;
  date: string;
  dateEnd?: string;
  childId?: number;
}): Promise<HugChild[]> {
  const today = new Date().toISOString().split('T')[0];
  const facilityId = params.facilityId;
  const targetDate = params.date || today;

  if (!Number.isFinite(facilityId) || facilityId <= 0) {
    throw new Error('facilityId が不正です');
  }

  const body = buildChildAgreementFilterParams(facilityId, targetDate);
  console.log('[HUG WM] ajax_child_agreement_filter POST:', Object.fromEntries(body));

  const text = await hugWmFetch(HUG_WM_CHILD_AGREEMENT_FILTER_URL, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'X-Requested-With': 'XMLHttpRequest',
    },
    body: body.toString(),
  });

  return parseChildrenFromAgreementFilterResponse(text);
}

function findContactBookTable(doc: Document) {
  const table = doc.querySelector(CONTACT_BOOK_TABLE_SELECTOR);
  if (!table) {
    throw new Error('対象テーブルが見つかりませんでした（HUGにログイン済みか、条件を確認してください）');
  }
  return table;
}

function getAttendanceEditOnclicks(table: Element) {
  const rows = [...table.querySelectorAll('tbody tr')];

  return rows
    .map((row) => {
      const cells = row.querySelectorAll('td');
      const dateText = cells[0]?.textContent?.trim() ?? '';
      const childName = cells[1]?.textContent?.trim().replace(/\s+/g, ' ') ?? '';
      const attendanceText = cells[4]?.textContent?.trim() ?? '';

      if (attendanceText !== '出席') return null;

      const editButton = cells[7]?.querySelector('button.edit');
      const onclick = editButton?.getAttribute('onclick');
      if (!onclick) return null;

      return { date: dateText, childName, attendance: attendanceText, onclick };
    })
    .filter(Boolean) as { date: string; childName: string; attendance: string; onclick: string }[];
}

async function fetchNotesForAttendanceEdits(
  editOnclicks: { date: string; childName: string; attendance: string; onclick: string }[],
) {
  const records: HugPersonalRecord[] = [];

  for (const item of editOnclicks) {
    const editPath = item.onclick.match(/location\.href='([^']+)'/)?.[1];

    if (editPath) {
      const result = await fetchContactBookNote(editPath);

      records.push({
        date: item.date,
        childName: item.childName,
        attendance: item.attendance,
        note: result?.note ?? '',
        user_id: result?.user_id ?? null,
        staffName: result?.staffName ?? '',
      });
    }
  }

  return records;
}

async function processContactBookTableFromDoc(listDoc: Document) {
  const table = findContactBookTable(listDoc);
  const editOnclicks = getAttendanceEditOnclicks(table);
  return fetchNotesForAttendanceEdits(editOnclicks);
}

export async function fetchHugPersonalRecordsFromWm(params: {
  facilityId: number;
  date: string;
  dateEnd: string;
  childId: number;
  onProgress?: (msg: string) => void;
}): Promise<HugPersonalRecord[]> {
  const { facilityId, date, dateEnd, childId, onProgress } = params;
  const listParams = { facilityId, date, dateEnd, childId };
  const allRecords: HugPersonalRecord[] = [];

  const probeUrl = buildContactBookListUrl(listParams);
  onProgress?.('一覧ページを取得しています…');
  const probeDoc = await fetchContactBookListDoc(probeUrl);
  const pages = getContactBookPageNumbers(probeDoc);

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    onProgress?.(`ページ ${page}/${pages.length} を処理中…`);

    const listUrl = buildContactBookListUrl({ ...listParams, page });
    const listDoc = i === 0 ? probeDoc : await fetchContactBookListDoc(listUrl);
    const pageRecords = await processContactBookTableFromDoc(listDoc);
    allRecords.push(...pageRecords);
  }

  return allRecords;
}
