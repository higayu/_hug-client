/* HUG WM 連絡帳一覧・編集ページから活動内容 (note) を取得（拡張機能 test_個人記録のデータ取得 と同等） */

const HUG_WM_BASE_URL = 'https://www.hug-ayumu.link/hug/wm/';
const HUG_WM_CONTACT_BOOK_LIST_URL = `${HUG_WM_BASE_URL}contact_book.php`;
const HUG_WM_CHILD_AGREEMENT_FILTER_URL = `${HUG_WM_BASE_URL}ajax/ajax_child_agreement_filter.php`;

const PAGINATION_UL_SELECTOR =
  'body > div.contents > div.ibox > div:nth-child(7) > div > ul';

const CONTACT_BOOK_TABLE_SELECTOR =
  'table.table.lh1_5[data-api-url="contact_book.php"][data-concurrent-edit-target="ContactBook"]';

async function hugWmFetch(url, options = {}) {
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

async function hugWmFetchText(url) {
  return hugWmFetch(url, { method: 'GET', credentials: 'include' });
}

function buildChildAgreementFilterParams({ facilityId, targetDate }) {
  const params = new URLSearchParams();
  params.set(`f_ary[${facilityId}]`, String(facilityId));
  params.set('furigana', '0');
  params.set('parent_flg', 'false');
  params.set('target_date', targetDate);
  return params;
}

function parseChildrenFromAgreementFilterResponse(text) {
  const trimmed = String(text).trim();

  if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
    try {
      const data = JSON.parse(trimmed);
      const list = Array.isArray(data)
        ? data
        : data.children || data.child_list || data.list || [];

      return list
        .map((item) => ({
          child_id: Number(item.child_id ?? item.id ?? item.c_id ?? item.value),
          name: String(item.name ?? item.child_name ?? item.text ?? '').trim(),
        }))
        .filter((c) => Number.isFinite(c.child_id) && c.child_id > 0);
    } catch {
      // HTML として続行
    }
  }

  const parseOptions = (doc) =>
    [...doc.querySelectorAll('option')]
      .map((opt) => ({
        child_id: Number(opt.value),
        name: opt.textContent.trim(),
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

async function fetchContactBookNote(pathAndQuery) {
  const listUrl = new URL(pathAndQuery, HUG_WM_BASE_URL).href;

  try {
    const html = await hugWmFetchText(listUrl);
    const editDoc = new DOMParser().parseFromString(html, 'text/html');
    const textarea = editDoc.querySelector('textarea[name="note"][data-field-key="note"]');

    if (!textarea) {
      throw new Error('note の textarea が見つかりませんでした');
    }

    return textarea.value.trim();
  } catch (error) {
    console.error('[HUG WM] note取得エラー:', error);
    return null;
  }
}

function buildContactBookListUrl({ facilityId, date, dateEnd, childId, page }) {
  const url = new URL(HUG_WM_CONTACT_BOOK_LIST_URL);
  url.searchParams.set('f_id', String(facilityId));
  url.searchParams.set('date', date);
  url.searchParams.set('date_end', dateEnd);
  if (childId != null && childId !== '' && Number(childId) > 0) {
    url.searchParams.set('id', String(childId));
  }
  if (page != null) {
    url.searchParams.set('page', String(page));
  }
  return url.href;
}

function getContactBookPageNumbers(doc) {
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

async function fetchContactBookListDoc(listUrl) {
  const listHtml = await hugWmFetchText(listUrl);
  return new DOMParser().parseFromString(listHtml, 'text/html');
}

/**
 * ajax_child_agreement_filter.php に POST して児童一覧を取得
 * @param {{ facilityId: number, date?: string, dateEnd?: string, childId?: number }} params
 * @returns {Promise<Array<{ child_id: number, name: string }>>}
 */
async function fetchChildrenFromHugWm(params) {
  const today = new Date().toISOString().split('T')[0];
  const normalized =
    typeof params === 'number'
      ? { facilityId: params, date: today, dateEnd: today }
      : params;

  const facilityId = normalized.facilityId;
  const targetDate = normalized.date || today;
  if (!Number.isFinite(facilityId) || facilityId <= 0) {
    throw new Error('facilityId が不正です');
  }

  const body = buildChildAgreementFilterParams({ facilityId, targetDate });
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

function findContactBookTable(doc) {
  const table = doc.querySelector(CONTACT_BOOK_TABLE_SELECTOR);
  if (!table) {
    throw new Error('対象テーブルが見つかりませんでした（HUGにログイン済みか、条件を確認してください）');
  }
  return table;
}

function getAttendanceEditOnclicks(table) {
  const rows = [...table.querySelectorAll('tbody tr')];

  return rows
    .map((row) => {
      const cells = row.querySelectorAll('td');
      const dateText = cells[0]?.textContent.trim();
      const childName = cells[1]?.textContent.trim().replace(/\s+/g, ' ');
      const attendanceText = cells[4]?.textContent.trim();

      if (attendanceText !== '出席') {
        return null;
      }

      const editButton = cells[7]?.querySelector('button.edit');
      const onclick = editButton?.getAttribute('onclick');

      if (!onclick) {
        return null;
      }

      return {
        date: dateText,
        childName,
        attendance: attendanceText,
        onclick,
      };
    })
    .filter(Boolean);
}

async function fetchNotesForAttendanceEdits(editOnclicks) {
  const records = [];

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

async function processContactBookTableFromDoc(listDoc) {
  const table = findContactBookTable(listDoc);
  const editOnclicks = getAttendanceEditOnclicks(table);
  return fetchNotesForAttendanceEdits(editOnclicks);
}

/**
 * @param {{ facilityId: number, date: string, dateEnd: string, childId: number, onProgress?: (msg: string) => void }} params
 * @returns {Promise<Array<{ date: string, childName: string, attendance: string, note: string }>>}
 */
async function fetchHugPersonalRecordsFromWm(params) {
  const { facilityId, date, dateEnd, childId, onProgress } = params;
  const listParams = { facilityId, date, dateEnd, childId };
  const allRecords = [];

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

window.HugWm = {
  fetchHugPersonalRecordsFromWm,
  buildContactBookListUrl,
  fetchChildrenFromHugWm,
};
