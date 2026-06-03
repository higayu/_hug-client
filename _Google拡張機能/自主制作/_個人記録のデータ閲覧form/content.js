(() => {
  const ATTENDANCE_URL =
    "https://www.hug-ayumu.link/hug/wm/attendance.php";

  /**
   * 入退室フォーム（hugAttendanceFacilityFilter）とは別キー。
   * 出席表 POST 用 f_ary の選択状態を保持する。
   */
  const PR_FACILITY_FILTER_STORAGE_KEY = "hugPersonalRecordFacilityFilter";
  /** 入退室フォームアプリ attendance-post-common.js と同じ */
  const ATTENDANCE_WM_FACILITY_STORAGE_KEY = "hugAttendanceFacilityFilter";

  /** 出席表 search_detail の f_ary（表示名）。contact_book の f_id とは別体系 */
  const PR_FACILITY_FILTER_OPTIONS = [
    { id: 3, value: "PD吉島", defaultChecked: true },
    { id: 6, value: "PD光", defaultChecked: false },
    { id: 7, value: "PD横川", defaultChecked: false },
    { id: 8, value: "PD五日市駅前", defaultChecked: false }
  ];

  const SERVICE_FILTER_PARAMS = [
    { id: 1, value: "放課後等デイサービス" },
    { id: 2, value: "児童発達支援" }
  ];

  window.HugPersonalRecord = window.HugPersonalRecord || {};
  window.HugAttendance = window.HugAttendance || {};

  const loadRawFacilityFilter = () => {
    try {
      const raw = localStorage.getItem(PR_FACILITY_FILTER_STORAGE_KEY);
      if (!raw) return null;
      const o = JSON.parse(raw);
      return o && typeof o === "object" ? o : null;
    } catch {
      return null;
    }
  };

  const saveRawFacilityFilter = (map) => {
    try {
      localStorage.setItem(PR_FACILITY_FILTER_STORAGE_KEY, JSON.stringify(map));
    } catch {
      /* ignore */
    }
  };

  const buildDefaultFacilityFilterMap = () => {
    const map = {};
    PR_FACILITY_FILTER_OPTIONS.forEach((opt) => {
      map[String(opt.id)] = Boolean(opt.defaultChecked);
    });
    return map;
  };

  const isFacilityFilterChecked = (map, id, defaultChecked) => {
    const key = String(id);
    if (Object.prototype.hasOwnProperty.call(map, key)) {
      return Boolean(map[key]);
    }
    return Boolean(defaultChecked);
  };

  const getFacilityFilterChecked = () => {
    const stored = loadRawFacilityFilter();
    if (stored) return stored;
    return buildDefaultFacilityFilterMap();
  };

  /** 個人記録フォームの施設セレクトと連動（1施設のみオン） */
  const setFacilityFilterSingle = (facilityId) => {
    const target = String(facilityId ?? "").trim();
    const map = {};
    PR_FACILITY_FILTER_OPTIONS.forEach((opt) => {
      map[String(opt.id)] = String(opt.id) === target;
    });
    saveRawFacilityFilter(map);
  };

  const getPageFacilityCheckboxes = () => {
    const attendancePanel = document.querySelector("#hug-attendance-panel");
    const personalRecordPanel = document.querySelector("#hug-personal-record-form");
    return [
      ...document.querySelectorAll('input[type="checkbox"][name^="f_ary"]')
    ].filter(
      (cb) =>
        !attendancePanel?.contains(cb) && !personalRecordPanel?.contains(cb)
    );
  };

  const readFacilityFilterFromPageDom = () => {
    const boxes = getPageFacilityCheckboxes();
    if (!boxes.length) return null;

    const map = {};
    boxes.forEach((cb) => {
      const m = String(cb.name || "").match(/f_ary\[(\d+)\]/);
      if (!m) return;
      map[m[1]] = Boolean(cb.checked);
    });
    return Object.keys(map).length ? map : null;
  };

  const loadRawWmFacilityFilter = () => {
    try {
      const raw = localStorage.getItem(ATTENDANCE_WM_FACILITY_STORAGE_KEY);
      if (!raw) return null;
      const o = JSON.parse(raw);
      return o && typeof o === "object" ? o : null;
    } catch {
      return null;
    }
  };

  /** 入退室フォームの施設キャッシュを再取得し、POST 用 PR キャッシュへ反映 */
  const refreshFacilityFilterFromWmCache = () => {
    const fromPage = readFacilityFilterFromPageDom();
    const fromStorage = loadRawWmFacilityFilter();
    const source = fromPage
      ? "page-dom"
      : fromStorage
        ? ATTENDANCE_WM_FACILITY_STORAGE_KEY
        : "default";
    const map = fromPage ?? fromStorage ?? buildDefaultFacilityFilterMap();

    if (fromPage) {
      try {
        localStorage.setItem(
          ATTENDANCE_WM_FACILITY_STORAGE_KEY,
          JSON.stringify(fromPage)
        );
      } catch {
        /* ignore */
      }
    }

    saveRawFacilityFilter(map);
    console.log("[HUG PR] 施設キャッシュ再取得:", { source, map });
    return map;
  };

  const getPrimaryFacilityId = () => {
    const map = getFacilityFilterChecked();
    const hit = PR_FACILITY_FILTER_OPTIONS.find((opt) =>
      isFacilityFilterChecked(map, opt.id, opt.defaultChecked)
    );
    return hit ? String(hit.id) : "3";
  };

  const appendFacilityParamsToSearchParams = (params) => {
    const map = getFacilityFilterChecked();
    PR_FACILITY_FILTER_OPTIONS.forEach((opt) => {
      const id = String(opt.id);
      if (!isFacilityFilterChecked(map, id, opt.defaultChecked)) return;
      params.set(`f_ary[${id}]`, opt.value);
    });
  };

  const normalizeAttendanceSearchDate = (raw) => {
    const s = String(raw ?? "").trim();
    if (!s) return "";
    const m = s.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
    if (!m) return s;
    const mo = String(m[2]).padStart(2, "0");
    const d = String(m[3]).padStart(2, "0");
    return `${m[1]}/${mo}/${d}`;
  };

  const getAttendanceSearchDate = () => {
    const attendanceFormDate = document
      .getElementById("hug-form-attendance-date")
      ?.value?.trim();
    if (attendanceFormDate) {
      return normalizeAttendanceSearchDate(
        attendanceFormDate.replace(/-/g, "/")
      );
    }

    const fromPage =
      document.querySelector('input[name="s_date"]')?.value?.trim() ||
      document.querySelector('input[name="date"]')?.value?.trim() ||
      "";
    const fromUrl =
      new URLSearchParams(location.search).get("s_date") ||
      new URLSearchParams(location.search).get("date") ||
      "";
    const normalized = normalizeAttendanceSearchDate(fromPage || fromUrl);
    if (normalized) return normalized;

    const now = new Date();
    const y = now.getFullYear();
    const mo = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    return `${y}/${mo}/${d}`;
  };

  const buildAttendanceSearchPostParams = () => {
    const params = new URLSearchParams();
    params.set("mode", "search_detail");
    appendFacilityParamsToSearchParams(params);
    SERVICE_FILTER_PARAMS.forEach((opt) => {
      params.set(`s_ary[${opt.id}]`, opt.value);
    });
    params.set("s_date", getAttendanceSearchDate());
    return params;
  };

  const logAttendanceSearchRequest = (params) => {
    const map = getFacilityFilterChecked();
    const facilities = PR_FACILITY_FILTER_OPTIONS.filter((opt) =>
      isFacilityFilterChecked(map, opt.id, opt.defaultChecked)
    ).map((opt) => ({
      key: `f_ary[${opt.id}]`,
      value: opt.value
    }));

    console.group("[HUG PR] 児童一覧 POST リクエスト");
    console.log("URL:", ATTENDANCE_URL);
    console.log("method:", "POST");
    console.log("Content-Type:", "application/x-www-form-urlencoded; charset=UTF-8");
    console.log("s_date:", params.get("s_date"));
    console.log("mode:", params.get("mode"));
    console.log("施設 f_ary:", facilities);
    console.log(
      "サービス s_ary:",
      SERVICE_FILTER_PARAMS.map((opt) => ({
        key: `s_ary[${opt.id}]`,
        value: opt.value
      }))
    );
    console.log("body (raw):", params.toString());
    console.log("body (parsed):", Object.fromEntries(params.entries()));
    console.groupEnd();
  };

  const extractTime = (cell) => {
    if (!cell) return "";

    const text = cell.innerText.trim();
    const match = text.match(/\b\d{1,2}:\d{2}\b/);

    return match ? match[0] : "";
  };

  const extractAttendanceDataFromHtml = (html) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    const listTable = doc.querySelector(
      "table.sortTable01:not(.sortTableAdding):not(.js_adding_table)"
    );

    if (!listTable) {
      console.warn("[HUG PR] listTable が見つかりませんでした");
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

  const fetchAttendanceChildrenList = async () => {
    const body = buildAttendanceSearchPostParams();
    logAttendanceSearchRequest(body);

    const response = await fetch(ATTENDANCE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
      },
      body: body.toString(),
      credentials: "include"
    });

    console.log("[HUG PR] status:", response.status);
    console.log("[HUG PR] ok:", response.ok);

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const html = await response.text();
    const attendanceList = extractAttendanceDataFromHtml(html);

    console.log("[HUG PR] 児童一覧:");
    console.table(attendanceList);

    return attendanceList;
  };

  Object.assign(window.HugPersonalRecord, {
    PR_FACILITY_FILTER_STORAGE_KEY,
    PR_FACILITY_FILTER_OPTIONS,
    getFacilityFilterChecked,
    setFacilityFilterSingle,
    refreshFacilityFilterFromWmCache,
    getPrimaryFacilityId,
    buildAttendanceSearchPostParams,
    fetchAttendanceChildrenList,
    extractAttendanceDataFromHtml
  });

  /** 互換: form.js が参照する名前（入退室フォーム拡張と別実装） */
  window.HugAttendance.fetchAttendanceData = fetchAttendanceChildrenList;
  window.HugAttendance.extractAttendanceDataFromHtml =
    extractAttendanceDataFromHtml;
})();
