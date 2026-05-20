(async () => {
  const SELECT_CHILLED = 99; // 92;

  const DATE = "2026-04-01";
  const DATE_END = "2026-05-30";
  const FACILITY_ID = 3;

  const listUrl =
    `https://www.hug-ayumu.link/hug/wm/contact_book.php?f_id=${FACILITY_ID}&date=${DATE}&date_end=${DATE_END}&id=${SELECT_CHILLED}`;

  try {
    console.log("[HUG WM] 一覧HTML fetch開始:", listUrl);

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
    const parser = new DOMParser();
    const listDoc = parser.parseFromString(listHtml, "text/html");

    const table = listDoc.querySelector(
      'table.table.lh1_5[data-api-url="contact_book.php"][data-concurrent-edit-target="ContactBook"]'
    );

    if (!table) {
      throw new Error("対象テーブルが見つかりませんでした");
    }

    console.log("[HUG WM] 対象テーブル取得成功:", table);

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

    editOnclicks.forEach(async (item) => {
      console.log(
        `[HUG WM] ${item.date} ${item.childName} ${item.attendance}: ${item.onclick}`
      );

        const editPath = item.onclick.match(/location\.href='([^']+)'/)?.[1];

        if (editPath) {
          const note = await fetchContactBookNote(editPath);
          console.log("[HUG WM] 活動内容 note:", {date: item.date, childName: item.childName, note: note});
        }
    });

  } catch (error) {
    console.error("[HUG WM] エラー:", error);
  }
})();