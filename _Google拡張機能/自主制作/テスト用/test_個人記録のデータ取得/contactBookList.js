// contactBookList.js — 一覧HTMLから連絡帳テーブルを抽出し編集ページの note を取得

const HUG_WM_CONTACT_BOOK_LIST_URL =
  "https://www.hug-ayumu.link/hug/wm/contact_book.php";

const PAGINATION_UL_SELECTOR =
  "body > div.contents > div.ibox > div:nth-child(7) > div > ul";

const CONTACT_BOOK_TABLE_SELECTOR =
  'table.table.lh1_5[data-api-url="contact_book.php"][data-concurrent-edit-target="ContactBook"]';

function findContactBookTable(doc) {
  const table = doc.querySelector(CONTACT_BOOK_TABLE_SELECTOR);

  if (!table) {
    throw new Error("対象テーブルが見つかりませんでした");
  }

  console.log("[HUG WM] 対象テーブル取得成功:", table);
  return table;
}

function getAttendanceEditOnclicks(table) {
  const rows = [...table.querySelectorAll("tbody tr")];

  const editOnclicks = rows
    .map((row) => {
      const cells = row.querySelectorAll("td");

      const dateText = cells[0]?.textContent.trim();
      const childName = cells[1]?.textContent.trim().replace(/\s+/g, " ");
      const attendanceText = cells[4]?.textContent.trim();

      if (attendanceText !== "出席") {
        return null;
      }

      const editButton = cells[7]?.querySelector("button.edit");
      const onclick = editButton?.getAttribute("onclick");

      if (!onclick) {
        return null;
      }

      return {
        date: dateText,
        childName,
        attendance: attendanceText,
        onclick
      };
    })
    .filter(Boolean);

  console.log("[HUG WM] 出席レコードの編集onclick:", editOnclicks);
  return editOnclicks;
}

async function fetchNotesForAttendanceEdits(editOnclicks) {
  for (const item of editOnclicks) {
    console.log(
      `[HUG WM] ${item.date} ${item.childName} ${item.attendance}: ${item.onclick}`
    );

    const editPath = item.onclick.match(/location\.href='([^']+)'/)?.[1];

    if (editPath) {
      const note = await fetchContactBookNote(editPath);
      console.log("[HUG WM] 活動内容 note:", {
        date: item.date,
        childName: item.childName,
        note
      });
    }
  }
}

async function processContactBookTableFromDoc(listDoc) {
  const table = findContactBookTable(listDoc);
  const editOnclicks = getAttendanceEditOnclicks(table);
  await fetchNotesForAttendanceEdits(editOnclicks);
}

function buildContactBookListUrl({ facilityId, date, dateEnd, childId, page }) {
  const url = new URL(HUG_WM_CONTACT_BOOK_LIST_URL);
  url.searchParams.set("f_id", String(facilityId));
  url.searchParams.set("date", date);
  url.searchParams.set("date_end", dateEnd);
  url.searchParams.set("id", String(childId));
  if (page != null) {
    url.searchParams.set("page", String(page));
  }
  return url.href;
}

function getContactBookPageNumbers(doc) {
  const targetUl = doc.querySelector(PAGINATION_UL_SELECTOR);

  if (!targetUl) {
    console.warn("[HUG WM] 対象 ul が見つかりませんでした。page=1 のみ処理します");
    return [1];
  }

  console.log("[HUG WM] 対象 ul が見つかりました", targetUl);

  const pages = new Set();
  for (const anchor of targetUl.querySelectorAll("a[href]")) {
    const match = anchor.getAttribute("href")?.match(/[?&]page=(\d+)/);
    if (match) {
      pages.add(Number(match[1]));
    }
  }

  const sorted = [...pages].sort((a, b) => a - b);
  console.log("[HUG WM] 抽出した page 一覧:", sorted);
  return sorted.length ? sorted : [1];
}

async function fetchContactBookListDoc(listUrl) {
  console.log("🔴[HUG WM] 一覧HTML fetch開始:", listUrl);

  const listResponse = await fetch(listUrl, {
    method: "GET",
    credentials: "include"
  });

  console.log("[HUG WM] 一覧 status:", listResponse.status);
  console.log("[HUG WM] 一覧 ok:", listResponse.ok);

  if (!listResponse.ok) {
    throw new Error(`一覧HTML取得エラー: ${listResponse.status}`);
  }

  const listHtml = await listResponse.text();
  return new DOMParser().parseFromString(listHtml, "text/html");
}
