const { contextBridge, ipcRenderer } = require("electron");

// デバッグモード判定
const isDebugMode =
  process.argv.includes("--dev") || process.argv.includes("--debug");

// ============================================
// 🔹 SQLite / MariaDB 共通テーブル一覧
// ============================================
const tables = [
  "children",
  "children_type",
  "day_of_week",
  "facility_children",
  "facility_staff",
  "facilitys",
  "individual_support",
  "managers2",
  "pc",
  "pc_to_children",
  "pronunciation",
  "staffs",
  "temp_notes",
  "ai_temp_notes",
];

// ============================================
// 🔹 テーブル CRUD API 自動生成
// ============================================
const tableAPIs = {};
for (const table of tables) {
  tableAPIs[`${table}_getAll`] = () =>
    ipcRenderer.invoke(`${table}:getAll`);

  tableAPIs[`${table}_getById`] = (id) =>
    ipcRenderer.invoke(`${table}:getById`, id);

  tableAPIs[`${table}_insert`] = (data) =>
    ipcRenderer.invoke(`${table}:insert`, data);

  tableAPIs[`${table}_update`] = (dataOrId, maybeData) =>
    ipcRenderer.invoke(`${table}:update`, dataOrId, maybeData);

  tableAPIs[`${table}_delete`] = (...args) =>
    ipcRenderer.invoke(`${table}:delete`, ...args);
}

// ============================================
// 🔹 API expose
// ============================================
contextBridge.exposeInMainWorld("electronAPI", {
  // ---- デバッグ ----
  isDebugMode: () => isDebugMode,

  // ---- DB 種別 ----
  getDatabaseType: () => ipcRenderer.invoke("get-database-type"),

  // ---- テーブル一括取得（MariaDB 用）----
  fetchTableAll: () => ipcRenderer.invoke("fetchTableAll"),

  // ---- AI プロンプト ----
  loadPrompts: () => ipcRenderer.invoke("load-prompts"),
  getAiPrompt: (promptKey) =>
    ipcRenderer.invoke("get-ai-prompt", promptKey),
  buildAiPrompt: (promptKey, userText) =>
    ipcRenderer.invoke("build-ai-prompt", promptKey, userText),

  // ---- 一時メモ ----
  saveTempNote: (data) => ipcRenderer.invoke("saveTempNote", data),
  getTempNote: (data) => ipcRenderer.invoke("getTempNote", data),

  saveAiTempNote: (childId, note) =>
    ipcRenderer.invoke("saveAiTempNote", { childId, note }),
  getTempNote: ({ children_id, staff_id, day_of_week_id }) =>
    ipcRenderer.invoke("getTempNote", {
      children_id,
      staff_id,
      day_of_week_id,
    }),


  // ---- UI / Window ----
  clearWebviewCache: (wcId) =>
    ipcRenderer.invoke("clear-webview-cache", wcId),

  openIndividualSupportPlan: (childId) =>
    ipcRenderer.send("open-individual-support-plan", childId),

  openSpecializedSupportPlan: (childId) =>
    ipcRenderer.send("open-specialized-support-plan", childId),

  Open_NowDayPage: (args) =>
    ipcRenderer.send("Open_NowDayPage", args),

  open_addition_compare_btn: (facility_id, date_str) =>
    ipcRenderer.send("open-addition-compare-btn", {
      facility_id,
      date_str,
    }),

  // ---- 設定 ----
  readConfig: () => ipcRenderer.invoke("read-config"),
  saveConfig: (data) => ipcRenderer.invoke("save-config", data),
  readIni: () => ipcRenderer.invoke("read-ini"),
  saveIni: (data) => ipcRenderer.invoke("save-ini", data),
  updateIniSetting: (path, value) =>
    ipcRenderer.invoke("update-ini-setting", path, value),

  importConfigFile: () => ipcRenderer.invoke("import-config-file"),
  openConfigFolder: () => ipcRenderer.invoke("open-config-folder"),

  // ---- UpdateのためのAPI ----
  getUpdateDebugInfo: () =>
    ipcRenderer.invoke("get-update-debug-info"),
  checkForUpdates: () =>
    ipcRenderer.invoke("check-for-updates"),


  // ---- カスタムボタン ----
  readCustomButtons: () => ipcRenderer.invoke("read-custom-buttons"),
  saveCustomButtons: (data) => ipcRenderer.invoke("save-custom-buttons", data),
  readAvailableActions: () => ipcRenderer.invoke("read-available-actions"),


  // ---- Close ----
  onConfirmCloseRequest: (callback) =>
    ipcRenderer.on("confirm-close-request", () => callback()),
  sendConfirmCloseResponse: (shouldClose) =>
    ipcRenderer.send("confirm-close-response", shouldClose),

  // ---- webview ----
  getPreloadPath: () =>
    ipcRenderer.invoke("get-preload-path"),

  // ---- Attendance ----
  saveAttendanceColumnData: (data) =>
    ipcRenderer.invoke("saveAttendanceColumnData", data),

  // ---- CRUD API 展開 ----
  ...tableAPIs,
});
