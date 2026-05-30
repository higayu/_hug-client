/**
 * 一覧取得時に入室 is_mail === 1 の行を検出（ヘッダーバッジ表示用）
 */
(() => {
  window.HugAttendance = window.HugAttendance || {};
  const HA = window.HugAttendance;

  let lastCapturePayload = null;

  const normalizeDisplayName = (name) =>
    String(name ?? "")
      .replace(/\s+/g, " ")
      .trim();

  const filterEnterMailRows = (attendanceList) => {
    return (attendanceList || []).filter((item) => {
      if (item?.isAbsenceStatus) return false;
      if (item?.isEnterMailEnabled === true) return true;
      if (Number(item?.enterIsMailResolved) === 1) return true;
      if (typeof HA.isEnterMailEnabled === "function") {
        return HA.isEnterMailEnabled(item);
      }
      return false;
    });
  };

  const buildCapturePayload = (attendanceList, rows) => {
    const detailPageDate =
      rows[0]?.detailPageDate || attendanceList[0]?.detailPageDate || "";

    const enrichedRows = rows.map((item) => ({
      rowIndex: item.rowIndex,
      r_id: item.r_id,
      c_id: item.c_id,
      name: normalizeDisplayName(item.name),
      enterIsMailResolved: item.enterIsMailResolved
    }));

    return {
      capturedAt: new Date().toISOString(),
      detailPageDate,
      count: enrichedRows.length,
      rows: enrichedRows
    };
  };

  const updatePanelUi = (payload) => {
    const panel = document.querySelector("#hug-attendance-panel");
    if (!panel) return;

    panel.querySelector(".hug-enter-mail-download")?.remove();
    panel.querySelector(".hug-enter-mail-run")?.remove();

    const count = payload?.count ?? 0;
    const badge = panel.querySelector(".hug-enter-mail-badge");
    if (badge) {
      badge.textContent =
        count > 0 ? `入室is_mail=1: ${count}件` : "入室is_mail=1: 0件";
      badge.hidden = false;
    }
  };

  /**
   * @param {object[]} attendanceList extractAttendanceDataFromHtml の結果
   * @returns {{ payload: object, count: number }}
   */
  const processEnterMailCapture = (attendanceList) => {
    const rows = filterEnterMailRows(attendanceList);

    if (rows.length === 0) {
      lastCapturePayload = {
        capturedAt: new Date().toISOString(),
        detailPageDate: attendanceList[0]?.detailPageDate || "",
        count: 0,
        rows: []
      };
      updatePanelUi(lastCapturePayload);
      console.log("[HUG WM] 入室 is_mail=1 の行はありません");
      return { payload: lastCapturePayload, count: 0 };
    }

    const payload = buildCapturePayload(attendanceList, rows);
    lastCapturePayload = payload;

    console.log("[HUG WM] 入室 is_mail=1 を検出:", payload.count, "件");
    console.table(payload.rows);

    updatePanelUi(payload);
    return { payload, count: payload.count };
  };

  const refreshEnterMailPanelUi = () => {
    if (lastCapturePayload) {
      updatePanelUi(lastCapturePayload);
    }
  };

  HA.processEnterMailCapture = processEnterMailCapture;
  HA.getLastEnterMailCapture = () => lastCapturePayload;
  HA.refreshEnterMailPanelUi = refreshEnterMailPanelUi;
})();
