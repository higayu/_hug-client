// editpage.js — 個人記録 編集ページの GET

const HUG_WM_BASE_URL = "https://www.hug-ayumu.link/hug/wm/";

function resolveContactBookUrl(pathOrUrl) {
  const s = String(pathOrUrl || "").trim();
  if (!s) {
    throw new Error("URL またはパスが空です");
  }
  try {
    return new URL(s).href;
  } catch {
    const rel = s.replace(/^\.\//, "");
    return new URL(rel, HUG_WM_BASE_URL).href;
  }
}

async function fetchContactBookEditHtml(pathOrUrl) {
  const url = resolveContactBookUrl(pathOrUrl);

  console.log("[HUG WM] 編集HTML fetch:", url);

  const response = await fetch(url, {
    method: "GET",
    credentials: "include"
  });

  if (!response.ok) {
    throw new Error(`編集HTML取得エラー: ${response.status}`);
  }

  return response.text();
}

const RECORD_STAFF_CELL_SELECTOR =
  "#form_id > div:nth-child(19) > div.ebox-content.careContent > table.mb10 > tbody > tr > td";
const RECORD_STAFF_SELECT_SELECTOR = 'select[name="record_staff"]';

function extractRecordStaffSelectFromEditDoc(editDoc) {
  const cell = editDoc.querySelector(RECORD_STAFF_CELL_SELECTOR);
  const select =
    cell?.querySelector(RECORD_STAFF_SELECT_SELECTOR) ||
    editDoc.querySelector(RECORD_STAFF_SELECT_SELECTOR);

  if (!select) {
    console.warn(
      "[HUG WM] 記録者 select が見つかりません:",
      RECORD_STAFF_SELECT_SELECTOR,
      cell ? "(cell は取得済み)" : `(cell も未取得: ${RECORD_STAFF_CELL_SELECTOR})`
    );
    return null;
  }

  const options = [...select.options].map((option) => ({
    value: option.value,
    text: option.text.trim(),
    selected: option.selected
  }));
  const selectedOption = select.selectedOptions[0];

  console.log("[HUG WM] 記録者 select:", select);
  console.log("[HUG WM] 記録者 name:", select.name);
  console.log("[HUG WM] 記録者 value:", select.value);
  console.log(
    "[HUG WM] 記録者 text:",
    selectedOption ? selectedOption.text.trim() : ""
  );
  console.log("[HUG WM] 記録者 options:", options);

  return select;
}

function extractRecordStaffSelectFromEditHtml(html) {
  const editDoc = new DOMParser().parseFromString(html, "text/html");
  return extractRecordStaffSelectFromEditDoc(editDoc);
}

function extractNoteFromEditHtml(html) {
  const editDoc = new DOMParser().parseFromString(html, "text/html");
  console.log("編集ページのHTML", editDoc);
  extractRecordStaffSelectFromEditDoc(editDoc);

  const textarea = editDoc.querySelector(
    'textarea[name="note"][data-field-key="note"]'
  );

  if (!textarea) {
    return null;
  }

  return textarea.value.trim();
}

async function fetchContactBookNote(pathOrUrl) {
  const html = await fetchContactBookEditHtml(pathOrUrl);
  const note = extractNoteFromEditHtml(html);

  if (note === null) {
    throw new Error("note の textarea が見つかりませんでした");
  }

  return note;
}

window.HugEditPage = {
  HUG_WM_BASE_URL,
  RECORD_STAFF_CELL_SELECTOR,
  RECORD_STAFF_SELECT_SELECTOR,
  resolveContactBookUrl,
  fetchContactBookEditHtml,
  extractRecordStaffSelectFromEditDoc,
  extractRecordStaffSelectFromEditHtml,
  extractNoteFromEditHtml,
  fetchContactBookNote
};
