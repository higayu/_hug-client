/**
 * 全児童取得テスト（#name_list のサーバー埋め込み＝施設契約の全件）
 * パラメータ絞り込みは content.js を使用
 */
const HUG_WM_CONTACT_BOOK_URL = "https://www.hug-ayumu.link/hug/wm/contact_book.php";

function buildListUrl() {
  const url = new URL(HUG_WM_CONTACT_BOOK_URL);
  url.searchParams.set("f_id", "3");
  return url.href;
}

async function fetchAllChildrenFromNameList() {
  const listUrl = buildListUrl();
  console.log("[HUG WM] 全件 fetch開始:", listUrl);

  const response = await fetch(listUrl, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`);
  }

  const doc = new DOMParser().parseFromString(await response.text(), "text/html");
  const nameList = doc.querySelector("#name_list");

  if (!nameList) {
    throw new Error("#name_list が見つかりません");
  }

  return [...nameList.options]
    .map((opt) => ({
      child_id: Number(opt.value),
      name: opt.textContent.trim(),
    }))
    .filter((c) => Number.isFinite(c.child_id) && c.child_id > 0);
}

function run() {
  (async () => {
    try {
      const children = await fetchAllChildrenFromNameList();
      console.log("[HUG WM] 全児童数（#name_list）:", children.length);
      console.log("[HUG WM] 全児童一覧:", children);
    } catch (error) {
      console.error("[HUG WM] 全件取得エラー:", error);
    }
  })();
}

if (document.readyState === "loading") {
  window.addEventListener("load", run);
} else {
  run();
}
