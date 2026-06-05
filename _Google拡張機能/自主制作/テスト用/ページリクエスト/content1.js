window.addEventListener("load", () => {
  (async () => {
    const url = "https://www.hug-ayumu.link/hug/wm/attendance.php?mode=detail";

    /*
      セル内から HH:MM の時間だけ取得
      例: "入室 09:30" → "09:30"
    */
    const extractTime = (cell) => {
      if (!cell) return "";

      const text = cell.innerText.trim();
      const match = text.match(/\b\d{1,2}:\d{2}\b/);

      return match ? match[0] : "";
    };

    try {
      console.log("[HUG WM] fetch開始:", url);

      const response = await fetch(url, {
        method: "GET",
        credentials: "include"
      });

      console.log("[HUG WM] status:", response.status);
      console.log("[HUG WM] ok:", response.ok);
      console.log("[HUG WM] response URL:", response.url);

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const html = await response.text();

      console.log("[HUG WM] HTMLデータ:");
      console.log(html);

      /*
        取得したHTML文字列をHTML文書として解析
      */
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      /*
        attendance detail 内の一覧テーブルを取得
      */
      const listTable = doc.querySelector(
        "table.sortTable01:not(.sortTableAdding):not(.js_adding_table)"
      );

      if (!listTable) {
        console.warn("[HUG WM] listTable が見つかりませんでした");
        return;
      }

      console.log("[HUG WM] listTable取得OK:", listTable);

      const attendanceList = [];

      listTable.querySelectorAll("tbody tr").forEach((tr, rowIndex) => {
        /*
          子どもID取得
        */
        const link = tr.querySelector(
          ".realname a[href*='profile_children.php']"
        );

        const match = link?.getAttribute("href")?.match(/id=(\d+)/);
        const c_id = match ? match[1] : "";

        /*
          氏名取得
        */
        const name = link ? link.innerText.trim() : "";

        /*
          入室・退室セル取得
        */
        const enterTd = tr.querySelector("td.enter");
        const leaveTd = tr.querySelector("td.leave");

        /*
          入室・退室時間取得
        */
        const enterTime = extractTime(enterTd);
        const leaveTime = extractTime(leaveTd);

        const data = {
          rowIndex,
          c_id,
          name,
          enterTime,
          leaveTime
        };

        attendanceList.push(data);

        console.log(`[HUG WM] row[${rowIndex}]`, data);
      });

      console.log("[HUG WM] 入室・退室時間一覧:");
      console.table(attendanceList);

    } catch (error) {
      console.error("[HUG WM] HTML取得エラー:", error);
    }
  })();
});