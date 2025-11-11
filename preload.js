const { contextBridge, ipcRenderer } = require("electron");

console.log("✅ preload.js が読み込まれた");

// デバッグモード判定
const isDebugMode = process.argv.includes("--dev") || process.argv.includes("--debug");

// ============================================
// 🔹 SQLite テーブルAPI 一括登録
// ============================================
const tables = [
  "children",
  "staffs",
  "facilitys",
  "managers",
  "pc",
  "pc_to_children",
  "pronunciation",
  "children_type",
  "individual_support",
  "temp_notes",
  "facility_children",
  "facility_staff",
  "facilitys",
];

const tableAPIs = {};
for (const table of tables) {
  tableAPIs[`${table}_getAll`] = () => ipcRenderer.invoke(`${table}:getAll`);
  // 🟢 CRUD 対応追加
  tableAPIs[`${table}_insert`] = (data) => ipcRenderer.invoke(`${table}:insert`, data);
  tableAPIs[`${table}_update`] = (data) => ipcRenderer.invoke(`${table}:update`, data);
  tableAPIs[`${table}_delete`] = (ids) => ipcRenderer.invoke(`${table}:delete`, ids);
}


// ============================================
// 🔹 すべてのAPIを一度に expose
// ============================================
contextBridge.exposeInMainWorld("electronAPI", {
  // ---- デバッグ情報 ----
  isDebugMode: () => isDebugMode,

  // ---- ログイン系 ----
  hugLogin: () => ipcRenderer.invoke("hug-login"),
  doAutoLogin: (username, password) =>
    ipcRenderer.invoke("do-auto-login", { username, password }),
  onInjectLogin: (callback) =>
    ipcRenderer.on("inject-login", (event, args) => callback(args)),

  // ---- DB関連 ----
  getStaffAndFacility: async () => {
    try {
      const result = await ipcRenderer.invoke("getStaffAndFacility");
      return result;
    } catch (err) {
      console.error("❌ [preload] IPC 呼び出し失敗:", err);
      throw err;
    }
  },

  getDatabaseType: () => ipcRenderer.invoke("get-database-type"),

  // ---- ファイル・設定関連 ----
  readConfig: () => ipcRenderer.invoke("read-config"),
  saveConfig: (data) => ipcRenderer.invoke("save-config", data),
  readIni: () => ipcRenderer.invoke("read-ini"),
  saveIni: (data) => ipcRenderer.invoke("save-ini", data),
  updateIniSetting: (path, value) => ipcRenderer.invoke("update-ini-setting", path, value),
  importConfigFile: () => ipcRenderer.invoke("import-config-file"),
  openConfigFolder: () => ipcRenderer.invoke("open-config-folder"),

  // ---- UI操作関連 ----
  openIndividualSupportPlan: (childId) =>
    ipcRenderer.send("open-individual-support-plan", childId),
  openSpecializedSupportPlan: (childId) =>
    ipcRenderer.send("open-specialized-support-plan", childId),
  Open_NowDayPage: (args) => ipcRenderer.send("Open_NowDayPage", args),

  open_addition_compare_btn: (facility_id, date_str) => {
    const eventName = "open-addition-compare-btn";
    const args = { facility_id, date_str };
    console.log("📤 [PRELOAD] IPCイベント送信:", eventName, args);
    ipcRenderer.send(eventName, args);
  },

  // ---- 一時メモ ----
  saveTempNote: (data) => ipcRenderer.invoke("saveTempNote", data),
  getTempNote: (data) => ipcRenderer.invoke("getTempNote", data),

  // ---- アップデート関連 ----
  getUpdateDebugInfo: () => ipcRenderer.invoke("get-update-debug-info"),
  checkForUpdates: () => ipcRenderer.invoke("check-for-updates"),

  // ---- カスタムボタン ----
  readCustomButtons: () => ipcRenderer.invoke("read-custom-buttons"),
  saveCustomButtons: (data) => ipcRenderer.invoke("save-custom-buttons", data),
  readAvailableActions: () => ipcRenderer.invoke("read-available-actions"),

  // ---- 終了確認 ----
  onConfirmCloseRequest: (callback) =>
    ipcRenderer.on("confirm-close-request", () => callback()),
  sendConfirmCloseResponse: (shouldClose) =>
    ipcRenderer.send("confirm-close-response", shouldClose),

  // ---- webview preload取得 ----
  getPreloadPath: () => ipcRenderer.invoke("get-preload-path"),

  // ---- 出勤データ列保存 ----
  saveAttendanceColumnData: (data) => ipcRenderer.invoke("saveAttendanceColumnData", data),

  // ---- SQLite テーブルAPIを展開 ----
  ...tableAPIs,
});
