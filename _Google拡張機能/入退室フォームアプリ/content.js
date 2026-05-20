(() => {
  const DETAIL_URL = "https://www.hug-ayumu.link/hug/wm/attendance.php?mode=detail";

  /** ajax 等とパスを揃える基準URL（末尾スラッシュあり） */
  const WM_BASE_URL = new URL(".", DETAIL_URL).href;

  /*
    HUG用の共通オブジェクトを作成
    他のJSファイルから window.HugAttendance.xxx で使う
  */
  window.HugAttendance = window.HugAttendance || {};
  window.HugAttendance.WM_BASE_URL = WM_BASE_URL;

  /*
    セル内から HH:MM の時間だけ取得
  */
  const normalizePersonName = (raw) =>
    String(raw ?? "")
      .replace(/\s+/g, " ")
      .trim();

  /** 児童名セルから span.furigana / rt.furigana の読みのみ取得 */
  const extractFuriganaName = (realnameRoot) => {
    if (!realnameRoot) return "";

    const furiganaEl =
      realnameRoot.querySelector(".nameBox span.furigana") ||
      realnameRoot.querySelector("span.furigana") ||
      realnameRoot.querySelector("rt.furigana");

    return normalizePersonName(furiganaEl?.textContent);
  };

  const extractTime = (cell) => {
    if (!cell) return "";

    const text = cell.innerText.trim();
    const match = text.match(/\b\d{1,2}:\d{2}\b/);

    return match ? match[0] : "";
  };

  /**
   * 入室セルが「欠席」表示のみ（入室POST用の sendEnterMail ボタンなし）か
   * 例: 欠席(欠席時対応加算を取らない)、欠席確定後の文面など
   * ※「入室」「欠席」の2ボタンがある行は入室可能なため欠席確定扱いにしない
   */
  const RE_SEND_LEAVE_IS_MAIL =
    /sendLeaveMail\s*\(\s*['"]?[^'",)]+['"]?\s*,\s*([^,]+)/;

  const RE_SEND_ENTER_IS_MAIL =
    /sendEnterMail\s*\(\s*['"]?([^'",)]+)['"]?\s*,\s*([^,]+)/;

  /** onclick 第2引数 = is_mail */
  const parseEnterIsMailFromOnclick = (enterOnclick) => {
    const m = String(enterOnclick || "").match(RE_SEND_ENTER_IS_MAIL);
    if (!m) return null;
    const n = Number(String(m[2]).trim());
    return Number.isNaN(n) ? null : n;
  };

  /** onclick 優先、なければ data-cidsetting[0] */
  const resolveEnterIsMail = (enterTd, enterOnclick) => {
    const fromOnclick = parseEnterIsMailFromOnclick(enterOnclick);
    if (fromOnclick != null) return fromOnclick;
    return parseEnterIsMailFromCidSetting(enterTd);
  };

  /** data-cidsetting の先頭要素 = sendEnterMail の is_mail（ボタン未表示時のフォールバック） */
  const parseEnterIsMailFromCidSetting = (enterTd) => {
    const raw = enterTd?.getAttribute?.("data-cidsetting");
    if (!raw) return null;

    try {
      const normalized = raw.replace(/&quot;/g, '"');
      const arr = JSON.parse(normalized);
      if (!Array.isArray(arr) || arr[0] == null || arr[0] === "") return null;
      return Number(String(arr[0]).trim());
    } catch {
      return null;
    }
  };

  const parseLeaveIsMailFromOnclick = (leaveOnclick) => {
    const m = String(leaveOnclick || "").match(RE_SEND_LEAVE_IS_MAIL);
    if (!m) return null;
    const n = Number(String(m[1]).trim());
    return Number.isNaN(n) ? null : n;
  };

  const extractAbsenceFromEnterCell = (enterTd) => {
    if (!enterTd) {
      return { isAbsenceStatus: false, absenceLabel: "" };
    }

    const enterMailBtn = enterTd.querySelector(
      "button[onclick*='sendEnterMail']"
    );
    const enterTextNorm = enterTd.innerText.replace(/\s+/g, " ").trim();
    const mentionsAbsence = enterTextNorm.includes("欠席");
    const isAbsenceStatus = mentionsAbsence && !enterMailBtn;

    return {
      isAbsenceStatus,
      absenceLabel: isAbsenceStatus ? enterTextNorm : ""
    };
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

    const detailPageDate =
      doc.querySelector('input[name="date"]')?.value ||
      doc.querySelector('[name="date"]')?.value ||
      "";

    const attendanceList = [];

    listTable.querySelectorAll("tbody tr").forEach((tr, rowIndex) => {
      const link = tr.querySelector(
        ".realname a[href*='profile_children.php']"
      );

      const match = link?.getAttribute("href")?.match(/id=(\d+)/);
      const c_id = match ? match[1] : "";

      const realnameTd = tr.querySelector("td.realname");
      const name = extractFuriganaName(realnameTd);

      const ridMatch = tr.className.match(/children(\d+)/);
      const r_id = ridMatch ? ridMatch[1] : "";

      const enterTd = tr.querySelector("td.enter");
      const leaveTd = tr.querySelector("td.leave");

      const enterTime = extractTime(enterTd);
      const leaveTime = extractTime(leaveTd);

      const enterBtn = enterTd?.querySelector(
        "button[onclick*='sendEnterMail']"
      );
      const enterOnclick = enterBtn?.getAttribute("onclick") ?? "";

      const leaveBtn = leaveTd?.querySelector(
        "button[onclick*='sendLeaveMail']"
      );
      const leaveOnclick = leaveBtn?.getAttribute("onclick") ?? "";

      const { isAbsenceStatus, absenceLabel } =
        extractAbsenceFromEnterCell(enterTd);

      const enterIsMail = parseEnterIsMailFromCidSetting(enterTd);
      const enterIsMailOnclick = parseEnterIsMailFromOnclick(enterOnclick);
      const enterIsMailResolved = resolveEnterIsMail(enterTd, enterOnclick);
      const isEnterMailEnabled = enterIsMailResolved === 1;
      const leaveIsMail = parseLeaveIsMailFromOnclick(leaveOnclick);

      attendanceList.push({
        rowIndex,
        r_id,
        c_id,
        name,
        enterTime,
        leaveTime,
        enterOnclick,
        leaveOnclick,
        enterIsMail,
        enterIsMailOnclick,
        enterIsMailResolved,
        isEnterMailEnabled,
        leaveIsMail,
        detailPageDate,
        isAbsenceStatus,
        absenceLabel
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
  window.HugAttendance.parseEnterIsMailFromOnclick = parseEnterIsMailFromOnclick;
  window.HugAttendance.resolveEnterIsMail = resolveEnterIsMail;
})();