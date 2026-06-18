// preload/electronApi.js
const { createTableApis } = require("./tableApis");

function createElectronApi(ipcRenderer, isDebugMode) {
  return {
    // ---- デバッグ ----
    isDebugMode: () => isDebugMode,

    // ---- DB 種別 ----
    getDatabaseType: () => ipcRenderer.invoke("get-database-type"),

    // ---- テーブル一括取得 ----
    fetchTableAll: () => ipcRenderer.invoke("fetchTableAll"),

    // ---- AI プロンプト ----
    loadPrompts: () => ipcRenderer.invoke("load-prompts"),

    getAiPrompt: (promptKey) =>
      ipcRenderer.invoke("get-ai-prompt", promptKey),

    buildAiPrompt: (promptKey, userText) =>
      ipcRenderer.invoke("build-ai-prompt", promptKey, userText),

    // ---- 一時メモ ----
    saveTempNote: (data) =>
      ipcRenderer.invoke("sqlite:saveTempNote", data),

    saveTempNote1: (data) =>
      ipcRenderer.invoke("sqlite:saveTempNote1", data),

    saveTempNote2: (data) =>
      ipcRenderer.invoke("sqlite:saveTempNote2", data),

    getTempNote: ({ children_id, staff_id, day_of_week_id }) =>
      ipcRenderer.invoke("sqlite:getTempNote", {
        children_id,
        staff_id,
        day_of_week_id,
      }),

    saveAiTempNote: (childId, note) =>
      ipcRenderer.invoke("sqlite:saveAiTempNote", { childId, note }),

    getAiTempNote: (childId) =>
      ipcRenderer.invoke("sqlite:getAiTempNote", { childId }),

    // ---- UI / Window ----
    clearWebviewCache: (wcId) =>
      ipcRenderer.invoke("clear-webview-cache", wcId),

    openIndividualSupportPlan: (childId) =>
      ipcRenderer.send("open-individual-support-plan", childId),

    openSpecializedSupportPlan: (childId) =>
      ipcRenderer.send("open-specialized-support-plan", childId),

    Open_NowDayPage: (args) =>
      ipcRenderer.send("Open_NowDayPage", args),

    openWebManagerPage: (args) =>
      ipcRenderer.send("open-web-manager-page", args),

    open_addition_compare_btn: (facility_id, date_str) =>
      ipcRenderer.send("open-addition-compare-btn", {
        facility_id,
        date_str,
      }),

    handleProfessionalSupportSearch: (
      facility_id,
      targetFacility,
      date_str
    ) =>
      ipcRenderer.send("handle-professional-support-search", {
        facility_id,
        targetFacility,
        date_str,
      }),

    // ---- 設定 ----
    readConfig: () => ipcRenderer.invoke("read-config"),

    saveConfig: (data) =>
      ipcRenderer.invoke("save-config", data),

    readIni: () =>
      ipcRenderer.invoke("read-ini"),

    saveIni: (data) =>
      ipcRenderer.invoke("save-ini", data),

    updateIniSetting: (path, value) =>
      ipcRenderer.invoke("update-ini-setting", path, value),

    importConfigFile: () =>
      ipcRenderer.invoke("import-config-file"),

    openConfigFolder: () =>
      ipcRenderer.invoke("open-config-folder"),

    // ---- Update ----
    getUpdateDebugInfo: () =>
      ipcRenderer.invoke("get-update-debug-info"),

    checkForUpdates: () =>
      ipcRenderer.invoke("check-for-updates"),

    // ---- カスタムボタン ----
    readCustomButtons: () =>
      ipcRenderer.invoke("read-custom-buttons"),

    saveCustomButtons: (data) =>
      ipcRenderer.invoke("save-custom-buttons", data),

    readAvailableActions: () =>
      ipcRenderer.invoke("read-available-actions"),

    // ---- Close ----
    onConfirmCloseRequest: (callback) => {
      const listener = () => callback();
      ipcRenderer.on("confirm-close-request", listener);

      return () => {
        ipcRenderer.removeListener("confirm-close-request", listener);
      };
    },

    sendConfirmCloseResponse: (shouldClose) =>
      ipcRenderer.send("confirm-close-response", shouldClose),

    // ---- webview ----
    getPreloadPath: () =>
      ipcRenderer.invoke("get-preload-path"),

    // ---- Attendance ----
    saveAttendanceColumnData: (data) =>
      ipcRenderer.invoke("saveAttendanceColumnData", data),

    mariadb_service_record_insert: (data) =>
      ipcRenderer.invoke("mariadb:service_record:insert", data),

    mariadb_service_record_upsert: (data) =>
      ipcRenderer.invoke("mariadb:service_record:upsert", data),

    syncHugStaffs: (data) =>
      ipcRenderer.invoke("mariadb:hug_staffs:sync", data),

    // ---- CRUD API 展開 ----
    ...createTableApis(ipcRenderer),
  };
}

module.exports = {
  createElectronApi,
};
