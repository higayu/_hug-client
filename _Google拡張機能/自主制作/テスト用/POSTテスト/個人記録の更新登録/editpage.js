// editpage.js — 個人記録 一覧・編集ページの GET

const HUG_WM_BASE_URL = "https://www.hug-ayumu.link/hug/wm/";

/**
 * 相対パス（例: contact_book.php?mode=edit&...）または絶対URLを解決する
 */
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

/**
 * 編集ページ HTML を取得
 * @param {string} pathOrUrl location.href='...' 内の文字列でも可
 */
async function fetchContactBookEditHtml(pathOrUrl) {
  const url = resolveContactBookUrl(pathOrUrl);

  console.log("[HUG CB] 編集HTML fetch:", url);

  const response = await fetch(url, {
    method: "GET",
    credentials: "include"
  });

  if (!response.ok) {
    throw new Error(`編集HTML取得エラー: ${response.status}`);
  }

  return response.text();
}

/**
 * 編集HTML文字列から note（活動内容）を取り出す
 */
function extractNoteFromEditHtml(html) {
  const editDoc = new DOMParser().parseFromString(html, "text/html");
  const textarea = editDoc.querySelector(
    'textarea[name="note"][data-field-key="note"]'
  );
  if (!textarea) {
    return null;
  }
  return textarea.value.trim();
}

window.HugContactBookFetch = {
  HUG_WM_BASE_URL,
  resolveContactBookUrl,
  fetchContactBookEditHtml,
  extractNoteFromEditHtml
};
