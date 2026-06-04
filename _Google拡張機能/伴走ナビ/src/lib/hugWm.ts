const HUG_WM_BASE_URL = 'https://www.hug-ayumu.link/hug/wm/';
const HUG_WM_CONTACT_BOOK_LIST_URL = `${HUG_WM_BASE_URL}contact_book.php`;

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
};

async function hugWmFetchText(url: string): Promise<string> {
  if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
    const response = await chrome.runtime.sendMessage({
      type: 'api-fetch',
      url,
      options: { method: 'GET', credentials: 'include' },
    });
    if (!response?.ok) {
      const err =
        response?.error ||
        (typeof response?.body === 'string' ? response.body : `HTTP ${response?.status}`);
      throw new Error(err);
    }
    return typeof response.body === 'string' ? response.body : JSON.stringify(response.body);
  }

  const res = await fetch(url, { method: 'GET', credentials: 'include' });
  if (!res.ok) {
    throw new Error(`HTML取得エラー: ${res.status}`);
  }
  return res.text();
}

async function fetchContactBookNote(pathAndQuery: string): Promise<string | null> {
  const listUrl = new URL(pathAndQuery, HUG_WM_BASE_URL).href;

  try {
    const html = await hugWmFetchText(listUrl);
    const editDoc = new DOMParser().parseFromString(html, 'text/html');
    const textarea = editDoc.querySelector('textarea[name="note"][data-field-key="note"]');

    if (!textarea) {
      throw new Error('note の textarea が見つかりませんでした');
    }

    return (textarea as HTMLTextAreaElement).value.trim();
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

function extractChildrenFromContactBookTable(doc: Document): HugChild[] {
  const table = doc.querySelector(CONTACT_BOOK_TABLE_SELECTOR);
  if (!table) {
    throw new Error(
      '対象テーブルが見つかりません（HUGにログイン済みか、日付・施設パラメータを確認してください）',
    );
  }

  const byChildId = new Map<number, HugChild>();

  for (const row of table.querySelectorAll('tbody tr')) {
    const cells = row.querySelectorAll('td');
    const nameCell = cells[1]?.textContent?.trim().replace(/\s+/g, ' ') ?? '';
    const name = nameCell.replace(/さん$/, '').trim();

    const editOnclick = cells[7]?.querySelector('button.edit')?.getAttribute('onclick');
    const previewHref = cells[8]?.querySelector('a[href]')?.getAttribute('href');
    const cIdMatch = editOnclick?.match(/c_id=(\d+)/) ?? previewHref?.match(/c_id=(\d+)/);

    if (!cIdMatch) continue;

    const childId = Number(cIdMatch[1]);
    if (!Number.isFinite(childId) || childId <= 0) continue;

    if (!byChildId.has(childId)) {
      byChildId.set(childId, { child_id: childId, name });
    }
  }

  return [...byChildId.values()];
}

async function fetchContactBookListDoc(listUrl: string) {
  const listHtml = await hugWmFetchText(listUrl);
  return new DOMParser().parseFromString(listHtml, 'text/html');
}

export async function fetchChildrenFromHugWm(params: {
  facilityId: number;
  date: string;
  dateEnd: string;
  childId?: number;
}): Promise<HugChild[]> {
  const today = new Date().toISOString().split('T')[0];
  const facilityId = params.facilityId;
  const date = params.date || today;
  const dateEnd = params.dateEnd || date;
  const childId = params.childId;

  if (!Number.isFinite(facilityId) || facilityId <= 0) {
    throw new Error('facilityId が不正です');
  }

  const listParams = {
    facilityId,
    date,
    dateEnd,
    childId: childId != null && childId > 0 ? childId : undefined,
  };

  const probeUrl = buildContactBookListUrl(listParams);
  const probeDoc = await fetchContactBookListDoc(probeUrl);
  const pages = getContactBookPageNumbers(probeDoc);
  const byChildId = new Map<number, HugChild>();

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    const listUrl = buildContactBookListUrl({ ...listParams, page });
    const listDoc = i === 0 ? probeDoc : await fetchContactBookListDoc(listUrl);

    for (const child of extractChildrenFromContactBookTable(listDoc)) {
      byChildId.set(child.child_id, child);
    }
  }

  return [...byChildId.values()];
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
      const note = await fetchContactBookNote(editPath);
      records.push({
        date: item.date,
        childName: item.childName,
        attendance: item.attendance,
        note: note ?? '',
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
