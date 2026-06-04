const HUG_WM_CONTACT_BOOK_URL = "https://www.hug-ayumu.link/hug/wm/contact_book.php";

const CONTACT_BOOK_TABLE_SELECTOR =
  'table.table.lh1_5[data-api-url="contact_book.php"][data-concurrent-edit-target="ContactBook"]';

const PAGINATION_UL_SELECTOR =
  "body > div.contents > div.ibox > div:nth-child(7) > div > ul";

/** 現在ページのクエリ、またはテスト用フォールバックで一覧URLを組み立てる */
function buildListUrl(page) {
  const url = new URL(HUG_WM_CONTACT_BOOK_URL);

  if (/contact_book\.php$/i.test(location.pathname)) {
    for (const [key, value] of new URLSearchParams(location.search)) {
      url.searchParams.set(key, value);
    }
  } else {
    url.searchParams.set("f_id", "3");
    url.searchParams.set("date", "2025-06-04");
    url.searchParams.set("date_end", "2026-06-04");
  }

  if (page != null) {
    url.searchParams.set("page", String(page));
  }

  return url.href;
}

function getContactBookPageNumbers(doc) {
  const targetUl = doc.querySelector(PAGINATION_UL_SELECTOR);
  if (!targetUl) {
    return [1];
  }

  const pages = new Set([1]);
  for (const anchor of targetUl.querySelectorAll("a[href]")) {
    const match = anchor.getAttribute("href")?.match(/[?&]page=(\d+)/);
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
    throw new Error("対象テーブルが見つかりません（ログイン・URLパラメータを確認してください）");
  }

  const byChildId = new Map();

  for (const row of table.querySelectorAll("tbody tr")) {
    const cells = row.querySelectorAll("td");
    const nameCell = cells[1]?.textContent.trim().replace(/\s+/g, " ") ?? "";
    const name = nameCell.replace(/さん$/, "").trim();

    const editOnclick = cells[7]?.querySelector("button.edit")?.getAttribute("onclick");
    const previewHref = cells[8]?.querySelector("a[href]")?.getAttribute("href");
    const cIdMatch =
      editOnclick?.match(/c_id=(\d+)/) ?? previewHref?.match(/c_id=(\d+)/);

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

async function fetchContactBookDoc(listUrl) {
  const response = await fetch(listUrl, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`);
  }

  return new DOMParser().parseFromString(await response.text(), "text/html");
}

async function fetchChildrenByUrlParams() {
  const firstUrl = buildListUrl();
  const firstDoc = await fetchContactBookDoc(firstUrl);
  const pages = getContactBookPageNumbers(firstDoc);

  const byChildId = new Map();

  for (const page of pages) {
    const listUrl = buildListUrl(page);
    const doc =
      page === pages[0] && listUrl === firstUrl
        ? firstDoc
        : await fetchContactBookDoc(listUrl);

    for (const child of extractChildrenFromContactBookTable(doc)) {
      byChildId.set(child.child_id, child);
    }
  }

  return {
    listUrl: firstUrl,
    pages,
    children: [...byChildId.values()],
  };
}

function run() {
  (async () => {
    try {
      console.log("[HUG WM] パラメータ絞り込み児童一覧の取得開始");
      const result = await fetchChildrenByUrlParams();
      console.log("[HUG WM] 一覧URL:", result.listUrl);
      console.log("[HUG WM] 取得ページ:", result.pages);
      console.log("[HUG WM] 児童数:", result.children.length);
      console.log("[HUG WM] 児童一覧（URL条件に一致する一覧テーブルから）:", result.children);
    } catch (error) {
      console.error("[HUG WM] 児童一覧取得エラー:", error);
    }
  })();
}

if (document.readyState === "loading") {
  window.addEventListener("load", run);
} else {
  run();
}
