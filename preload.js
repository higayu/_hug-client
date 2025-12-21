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
// 🔹 テーブル CRUD API 自動生成（DB別）
// ============================================
const tableAPIs = {};

for (const table of tables) {
  // ---------- SQLite ----------
  tableAPIs[`sqlite_${table}_getAll`] = () =>
    ipcRenderer.invoke(`sqlite:${table}:getAll`);

  tableAPIs[`sqlite_${table}_getById`] = (id) =>
    ipcRenderer.invoke(`sqlite:${table}:getById`, id);

  tableAPIs[`sqlite_${table}_insert`] = (data) =>
    ipcRenderer.invoke(`sqlite:${table}:insert`, data);

  tableAPIs[`sqlite_${table}_update`] = (dataOrId, maybeData) =>
    ipcRenderer.invoke(`sqlite:${table}:update`, dataOrId, maybeData);

  tableAPIs[`sqlite_${table}_delete`] = (...args) =>
    ipcRenderer.invoke(`sqlite:${table}:delete`, ...args);

  // ---------- MariaDB ----------
  tableAPIs[`mariadb_${table}_getAll`] = () =>
    ipcRenderer.invoke(`mariadb:${table}:getAll`);

  tableAPIs[`mariadb_${table}_getById`] = (id) =>
    ipcRenderer.invoke(`mariadb:${table}:getById`, id);

  tableAPIs[`mariadb_${table}_insert`] = (data) =>
    ipcRenderer.invoke(`mariadb:${table}:insert`, data);

  tableAPIs[`mariadb_${table}_update`] = (dataOrId, maybeData) =>
    ipcRenderer.invoke(`mariadb:${table}:update`, dataOrId, maybeData);

  tableAPIs[`mariadb_${table}_delete`] = (...args) =>
    ipcRenderer.invoke(`mariadb:${table}:delete`, ...args);
}


// ============================================
// 🔹 API expose
// ============================================
contextBridge.exposeInMainWorld("electronAPI", {
  // ---- デバッグ ----
  isDebugMode: () => isDebugMode,

  // ---- DB 種別 ----
  getDatabaseType: () => ipcRenderer.invoke("get-database-type"),

  // ---- テーブル一括取得（主に MariaDB）----
  fetchTableAll: () => ipcRenderer.invoke("fetchTableAll"),

  // ---- AI プロンプト ----
  loadPrompts: () => ipcRenderer.invoke("load-prompts"),
  getAiPrompt: (promptKey) =>
    ipcRenderer.invoke("get-ai-prompt", promptKey),
  buildAiPrompt: (promptKey, userText) =>
    ipcRenderer.invoke("build-ai-prompt", promptKey, userText),

  // ---- 一時メモ（共通）----
  saveTempNote: (data) =>
    ipcRenderer.invoke("sqlite:saveTempNote", data),

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

  // ---- Update ----
  getUpdateDebugInfo: () =>
    ipcRenderer.invoke("get-update-debug-info"),
  checkForUpdates: () =>
    ipcRenderer.invoke("check-for-updates"),

  // ---- カスタムボタン ----
  readCustomButtons: () => ipcRenderer.invoke("read-custom-buttons"),
  saveCustomButtons: (data) =>
    ipcRenderer.invoke("save-custom-buttons", data),
  readAvailableActions: () =>
    ipcRenderer.invoke("read-available-actions"),

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
