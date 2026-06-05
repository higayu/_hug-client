// editpage.js

const HUG_WM_BASE_URL = "https://www.hug-ayumu.link/hug/wm/";

async function fetchContactBookNote(pathAndQuery) {
  const listUrl = new URL(pathAndQuery, HUG_WM_BASE_URL).href;

  try {
   // console.log("[HUG WM] 編集HTML fetch開始:", listUrl);

    const response = await fetch(listUrl, {
      method: "GET",
      credentials: "include"
    });

    console.log("[HUG WM] 編集 status:", response.status);
    console.log("[HUG WM] 編集 ok:", response.ok);

    if (!response.ok) {
      throw new Error(`編集HTML取得エラー: ${response.status}`);
    }

    const html = await response.text();

    const parser = new DOMParser();
    const editDoc = parser.parseFromString(html, "text/html");

    const textarea = editDoc.querySelector(
      'textarea[name="note"][data-field-key="note"]'
    );

    if (!textarea) {
      throw new Error("note の textarea が見つかりませんでした");
    }

    const noteText = textarea.value.trim();

    //console.log("[HUG WM] note取得成功:", noteText);

    return noteText;

  } catch (error) {
    console.error("[HUG WM] note取得エラー:", error);
    return null;
  }
}