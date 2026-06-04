/* HUG WM 連絡帳一覧・編集ページから活動内容 (note) を取得（拡張機能 test_個人記録のデータ取得 と同等） */

const HUG_WM_BASE_URL = 'https://www.hug-ayumu.link/hug/wm/';
const HUG_WM_CONTACT_BOOK_LIST_URL = `${HUG_WM_BASE_URL}contact_book.php`;

const PAGINATION_UL_SELECTOR =
  'body > div.contents > div.ibox > div:nth-child(7) > div > ul';

const CONTACT_BOOK_TABLE_SELECTOR =
  'table.table.lh1_5[data-api-url="contact_book.php"][data-concurrent-edit-target="ContactBook"]';

async function hugWmFetchText(url) {
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

/** URLパラメータで絞り込まれた一覧テーブルから児童を抽出（#name_list は使わない） */
function extractChildrenFromContactBookTable(doc) {
  const table = doc.querySelector(CONTACT_BOOK_TABLE_SELECTOR);
  if (!table) {
    throw new Error(
      '対象テーブルが見つかりません（HUGにログイン済みか、日付・施設パラメータを確認してください）'
    );
  }

  const byChildId = new Map();

  for (const row of table.querySelectorAll('tbody tr')) {
    const cells = row.querySelectorAll('td');
    const nameCell = cells[1]?.textContent.trim().replace(/\s+/g, ' ') ?? '';
    const name = nameCell.replace(/さん$/, '').trim();

    const editOnclick = cells[7]?.querySelector('button.edit')?.getAttribute('onclick');
    const previewHref = cells[8]?.querySelector('a[href]')?.getAttribute('href');
    const cIdMatch = editOnclick?.match(/c_id=(\d+)/) ?? previewHref?.match(/c_id=(\d+)/);

    if (!cIdMatch) {
      continue;
    }

    const childId = Number(cIdMatch[1]);
    if (!Number.isFinite(childId) || childId <= 0) {
      continue;
    }

    if (!byChildId.has(childId)) {
      byChildId.set(childId, { child_id: childId, name });
    }
  }

  return [...byChildId.values()];
}

async function fetchContactBookListDoc(listUrl) {
  const listHtml = await hugWmFetchText(listUrl);
  return new DOMParser().parseFromString(listHtml, 'text/html');
}

/**
 * 連絡帳一覧テーブルから児童一覧を取得（URLパラメータで絞り込まれた結果）
 * @param {{ facilityId: number, date: string, dateEnd: string, childId?: number }} params
 * @returns {Promise<Array<{ child_id: number, name: string }>>}
 */
async function fetchChildrenFromHugWm(params) {
  const today = new Date().toISOString().split('T')[0];
  const normalized =
    typeof params === 'number'
      ? { facilityId: params, date: today, dateEnd: today }
      : params;

  const facilityId = normalized.facilityId;
  const date = normalized.date || today;
  const dateEnd = normalized.dateEnd || date;
  const childId = normalized.childId;
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
  const byChildId = new Map();

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
