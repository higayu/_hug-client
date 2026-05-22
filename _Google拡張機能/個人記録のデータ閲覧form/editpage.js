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
  resolveContactBookUrl,
  fetchContactBookEditHtml,
  extractNoteFromEditHtml,
  fetchContactBookNote
};
