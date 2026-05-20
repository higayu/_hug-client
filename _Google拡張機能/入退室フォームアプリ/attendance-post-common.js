/**
 * ajax_attendance.php への共通 POST（入室・退室どちらの data_list も同一形式で送信）
 * 先に読み込むこと。window.HugAttendance.WM_BASE_URL は content.js 推奨。
 */
(() => {
  window.HugAttendance = window.HugAttendance || {};

  const getAjaxAttendanceUrl = () => {
    const base =
      window.HugAttendance?.WM_BASE_URL ||
      new URL("./", "https://www.hug-ayumu.link/hug/wm/").href;
    return new URL("ajax/ajax_attendance.php", base).href;
  };

  /**
   * @param {Record<string, unknown>} dataList AttendanceSave 相当のフラットなオブジェクト
   * @returns {Promise<object>} パース済み JSON
   */
  const postAttendanceDataList = async (dataList) => {
    const body = new URLSearchParams();
    for (const [key, value] of Object.entries(dataList)) {
      if (value === undefined || value === null) continue;
      body.append(`data_list[${key}]`, String(value));
    }

    const url = getAjaxAttendanceUrl();
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "X-Requested-With": "XMLHttpRequest"
      },
      body: body.toString(),
      credentials: "include"
    });

    const text = await res.text();
    let json;

    try {
      json = JSON.parse(text);
    } catch {
      throw new Error(
        `サーバー応答がJSONでありません (${res.status}): ${text.slice(0, 200)}`
      );
    }

    if (!res.ok) {
      throw new Error(
        `ajax_attendance POSTが失敗しました (${res.status}): ${JSON.stringify(json)}`
      );
    }

    return json;
  };

  window.HugAttendance.getAjaxAttendanceUrl = getAjaxAttendanceUrl;
  window.HugAttendance.postAttendanceDataList = postAttendanceDataList;

  /*
    曜日(0=日〜6=土)＋児童IDをキーに、アラート種別・経過しきい値(分)・午前午後(0/1)を localStorage に保存
    （ハーフタイム境界・退室済み表示は別キー）
  */
  const ALERT_PREFS_STORAGE_KEY = "hugAttendanceAlertPrefs";
  const HALF_TIME_STORAGE_KEY = "hugAttendanceHalfTime";
  const SHOW_LEFT_RECORDS_STORAGE_KEY = "hugAttendanceShowLeftRecords";
  const DEFAULT_ALERT_TYPE = 1;
  const DEFAULT_ALERT_AFTER_MINUTES = 120;
  /** 0=午前、1=午後 */
  const DEFAULT_AM_PM_FLAG = 0;
  /** 午前・午後の境界時刻（HH:MM）。曜日×児童のキャッシュとは独立 */
  const DEFAULT_HALF_TIME = "12:00";
  /** 1=退室済み・欠席行を表示、0=退室済み・欠席行を非表示 */
  const DEFAULT_SHOW_LEFT_RECORDS = 1;

  const HALF_TIME_RE = /^\d{1,2}:\d{2}$/;

  const normalizeHalfTime = (value) => {
    const s = String(value ?? "").trim();
    if (!HALF_TIME_RE.test(s)) return null;
    const [hRaw, mRaw] = s.split(":");
    const h = Math.min(23, Math.max(0, Number(hRaw)));
    const mi = Math.min(59, Math.max(0, Number(mRaw)));
    if (Number.isNaN(h) || Number.isNaN(mi)) return null;
    return `${String(h).padStart(2, "0")}:${String(mi).padStart(2, "0")}`;
  };

  const getHalfTime = () => {
    try {
      const raw = localStorage.getItem(HALF_TIME_STORAGE_KEY);
      const n = normalizeHalfTime(raw);
      return n || DEFAULT_HALF_TIME;
    } catch {
      return DEFAULT_HALF_TIME;
    }
  };

  const setHalfTime = (value) => {
    const n = normalizeHalfTime(value);
    if (!n) return;
    try {
      localStorage.setItem(HALF_TIME_STORAGE_KEY, n);
    } catch {
      /* ignore */
    }
  };

  const normalizeShowLeftRecords = (value) => {
    if (value === 0 || value === "0" || value === false) return 0;
    if (value === 1 || value === "1" || value === true) return 1;
    const n = Number(value);
    if (!Number.isNaN(n)) return n >= 1 ? 1 : 0;
    return null;
  };

  const getShowLeftRecords = () => {
    try {
      const raw = localStorage.getItem(SHOW_LEFT_RECORDS_STORAGE_KEY);
      if (raw == null || raw === "") return DEFAULT_SHOW_LEFT_RECORDS;
      const n = normalizeShowLeftRecords(raw);
      return n == null ? DEFAULT_SHOW_LEFT_RECORDS : n;
    } catch {
      return DEFAULT_SHOW_LEFT_RECORDS;
    }
  };

  const setShowLeftRecords = (value) => {
    const n = normalizeShowLeftRecords(value);
    if (n == null) return;
    try {
      localStorage.setItem(SHOW_LEFT_RECORDS_STORAGE_KEY, String(n));
    } catch {
      /* ignore */
    }
  };

  const parseDetailPageDate = (detailPageDate) => {
    const s = String(detailPageDate || "").trim();
    if (!s) return null;
    const m = s.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
    if (m) {
      const y = Number(m[1]);
      const mo = Number(m[2]) - 1;
      const d = Number(m[3]);
      const dt = new Date(y, mo, d);
      return Number.isNaN(dt.getTime()) ? null : dt;
    }
    const dt = new Date(s.replace(/\//g, "-"));
    return Number.isNaN(dt.getTime()) ? null : dt;
  };

  /** 出席表明細の日付（name=date）から曜日 index（Date#getDay） */
  const getWeekdayIndexFromDetailDate = (detailPageDate) => {
    const dt = parseDetailPageDate(detailPageDate);
    if (dt) return dt.getDay();
    return new Date().getDay();
  };

  const buildAlertPrefStorageKey = (weekdayIndex, c_id) =>
    `${Number(weekdayIndex)}-${String(c_id || "").trim()}`;

  const loadRawAlertPrefs = () => {
    try {
      const raw = localStorage.getItem(ALERT_PREFS_STORAGE_KEY);
      if (!raw) return {};
      const o = JSON.parse(raw);
      return o && typeof o === "object" ? o : {};
    } catch {
      return {};
    }
  };

  const getAlertPref = (weekdayIndex, c_id) => {
    const key = buildAlertPrefStorageKey(weekdayIndex, c_id);
    const all = loadRawAlertPrefs();
    const row = all[key];
    if (!row || typeof row !== "object") {
      return {
        alertType: DEFAULT_ALERT_TYPE,
        alertAfterMinutes: DEFAULT_ALERT_AFTER_MINUTES,
        amPmFlag: DEFAULT_AM_PM_FLAG
      };
    }
    const alertType =
      typeof row.alertType === "number" && !Number.isNaN(row.alertType)
        ? Math.max(0, Math.floor(row.alertType))
        : DEFAULT_ALERT_TYPE;
    const alertAfterMinutes =
      typeof row.alertAfterMinutes === "number" &&
      !Number.isNaN(row.alertAfterMinutes)
        ? Math.max(0, Math.floor(row.alertAfterMinutes))
        : DEFAULT_ALERT_AFTER_MINUTES;
    const amPmFlag =
      typeof row.amPmFlag === "number" && !Number.isNaN(row.amPmFlag)
        ? row.amPmFlag >= 1
          ? 1
          : 0
        : DEFAULT_AM_PM_FLAG;
    return { alertType, alertAfterMinutes, amPmFlag };
  };

  /**
   * @param {number} weekdayIndex Date#getDay と同じ（0=日…6=土）
   * @param {string} c_id 児童ID
   * @param {{ alertType?: number, alertAfterMinutes?: number, amPmFlag?: number }} patch
   */
  const setAlertPref = (weekdayIndex, c_id, patch) => {
    if (!String(c_id || "").trim()) return;

    const key = buildAlertPrefStorageKey(weekdayIndex, c_id);
    const all = loadRawAlertPrefs();
    const prev =
      all[key] && typeof all[key] === "object" ? all[key] : {};
    const merged = { ...prev, ...patch };

    const alertType =
      typeof merged.alertType === "number" && !Number.isNaN(merged.alertType)
        ? Math.max(0, Math.floor(merged.alertType))
        : typeof prev.alertType === "number" && !Number.isNaN(prev.alertType)
          ? Math.max(0, Math.floor(prev.alertType))
          : DEFAULT_ALERT_TYPE;
    const alertAfterMinutes =
      typeof merged.alertAfterMinutes === "number" &&
      !Number.isNaN(merged.alertAfterMinutes)
        ? Math.max(0, Math.floor(merged.alertAfterMinutes))
        : typeof prev.alertAfterMinutes === "number" &&
            !Number.isNaN(prev.alertAfterMinutes)
          ? Math.max(0, Math.floor(prev.alertAfterMinutes))
          : DEFAULT_ALERT_AFTER_MINUTES;

    const amPmFlag =
      typeof merged.amPmFlag === "number" && !Number.isNaN(merged.amPmFlag)
        ? merged.amPmFlag >= 1
          ? 1
          : 0
        : typeof prev.amPmFlag === "number" && !Number.isNaN(prev.amPmFlag)
          ? prev.amPmFlag >= 1
            ? 1
            : 0
          : DEFAULT_AM_PM_FLAG;

    all[key] = { alertType, alertAfterMinutes, amPmFlag };
    localStorage.setItem(ALERT_PREFS_STORAGE_KEY, JSON.stringify(all));
  };

  window.HugAttendance.getWeekdayIndexFromDetailDate =
    getWeekdayIndexFromDetailDate;
  window.HugAttendance.getAlertPref = getAlertPref;
  window.HugAttendance.setAlertPref = setAlertPref;
  window.HugAttendance.getHalfTime = getHalfTime;
  window.HugAttendance.setHalfTime = setHalfTime;
  window.HugAttendance.getShowLeftRecords = getShowLeftRecords;
  window.HugAttendance.setShowLeftRecords = setShowLeftRecords;
})();
