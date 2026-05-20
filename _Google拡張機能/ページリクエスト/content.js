(() => {
  const DETAIL_URL = "https://www.hug-ayumu.link/hug/wm/attendance.php?mode=detail";

  /*
    HUG用の共通オブジェクトを作成
    他のJSファイルから window.HugAttendance.xxx で使う
  */
  window.HugAttendance = window.HugAttendance || {};

  /*
    セル内から HH:MM の時間だけ取得
  */
  const extractTime = (cell) => {
    if (!cell) return "";

    const text = cell.innerText.trim();
    const match = text.match(/\b\d{1,2}:\d{2}\b/);

    return match ? match[0] : "";
  };

  /*
    HTML文字列から入退室データを抽出
  */
  const extractAttendanceDataFromHtml = (html) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    const listTable = doc.querySelector(
      "table.sortTable01:not(.sortTableAdding):not(.js_adding_table)"
    );

    if (!listTable) {
      console.warn("[HUG WM] listTable が見つかりませんでした");
      return [];
    }

    const attendanceList = [];

    listTable.querySelectorAll("tbody tr").forEach((tr, rowIndex) => {
      const link = tr.querySelector(
        ".realname a[href*='profile_children.php']"
      );

      const match = link?.getAttribute("href")?.match(/id=(\d+)/);
      const c_id = match ? match[1] : "";

      const name = link ? link.innerText.trim() : "";

      const enterTd = tr.querySelector("td.enter");
      const leaveTd = tr.querySelector("td.leave");

      const enterTime = extractTime(enterTd);
      const leaveTime = extractTime(leaveTd);

      attendanceList.push({
        rowIndex,
        c_id,
        name,
        enterTime,
        leaveTime
      });
    });

    return attendanceList;
  };

  /*
    入退室データを取得
  */
  const fetchAttendanceData = async () => {
    console.log("[HUG WM] fetch開始:", DETAIL_URL);

    const response = await fetch(DETAIL_URL, {
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

    const attendanceList = extractAttendanceDataFromHtml(html);

    console.log("[HUG WM] 入室・退室時間一覧:");
    console.table(attendanceList);

    return attendanceList;
  };

  /*
    外部ファイルから使えるように登録
  */
  window.HugAttendance.fetchAttendanceData = fetchAttendanceData;
  window.HugAttendance.extractAttendanceDataFromHtml = extractAttendanceDataFromHtml;
})();