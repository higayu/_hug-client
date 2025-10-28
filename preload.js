const { contextBridge, ipcRenderer } = require("electron");

console.log("✅ preload.js が読み込まれた");

// デバッグモード判定
const isDebugMode = process.argv.includes('--dev') || process.argv.includes('--debug');

contextBridge.exposeInMainWorld("electronAPI", {
  // デバッグモード情報を提供
  isDebugMode: () => isDebugMode,
  hugLogin: () => ipcRenderer.invoke("hug-login"),
  doAutoLogin: (username, password) =>
    ipcRenderer.invoke("do-auto-login", { username, password }),
  onInjectLogin: (callback) =>
    ipcRenderer.on("inject-login", (event, args) => callback(args)),

    // API 呼び出し (main 経由)
  // ✅ 子ども一覧取得 (引数を明示的にログ出力)
  GetChildrenByStaffAndDay: async (staffId, date, facility_id) => {
    console.log("📤 [preload] GetChildrenByStaffAndDay 呼び出し");
    console.log("  ↳ 渡す引数:", { staffId, date, facility_id });
    try {
      const result = await ipcRenderer.invoke("GetChildrenByStaffAndDay", { staffId, date, facility_id });
      console.log("📥 [preload] main からの応答:", result);
      return result;
    } catch (err) {
      console.error("❌ [preload] IPC 呼び出し失敗:", err);
      throw err;
    }
  },

  //     // API 呼び出し (main 経由)
  // // ✅ キャンセル待ち子ども一覧取得 (引数を明示的にログ出力)
  // Get_waiting_children_pc: async (facility_id) => {
  //   console.log("📤 [preload] Get_waiting_children_pc 呼び出し");
  //   console.log("  ↳ 渡す引数:", { facility_id });
  //   const result = await ipcRenderer.invoke("Get_waiting_children_pc", { facility_id });
  //   console.log("📥 [preload] main からの応答:", result);
  //   return result;
  // },

  getStaffAndFacility: async () => {
    try {
      const result = await ipcRenderer.invoke("getStaffAndFacility");
      return result;
    } catch (err) {
      console.error("❌ [preload] IPC 呼び出し失敗:", err);
      throw err;
    }
  },

  openIndividualSupportPlan: (childId) => ipcRenderer.send("open-individual-support-plan", childId),

    // 既存のAPIに加えて...
  openSpecializedSupportPlan: (childId) => ipcRenderer.send("open-specialized-support-plan", childId),

  Open_NowDayPage: (args) => ipcRenderer.send("Open_NowDayPage", args),

    // 既存のAPIに加えて...
  open_addition_compare_btn: (facility_id, date_str) => {
    const eventName = "open-addition-compare-btn";
    const args = { facility_id, date_str };
    console.log("📤 [PRELOAD] IPCイベントを送信します:", eventName);
    console.log("📤 [PRELOAD] 引数:", args);
    console.log("🔍 [PRELOAD] ipcRenderer:", ipcRenderer ? "存在" : "未定義");
    try {
      ipcRenderer.send(eventName, args);
      console.log("✅ [PRELOAD] IPCイベントを送信しました:", eventName);
    } catch (error) {
      console.error("❌ [PRELOAD] IPCイベント送信に失敗:", error);
      console.error("❌ [PRELOAD] エラー詳細:", {
        eventName,
        args,
        error: error.message,
        stack: error.stack
      });
    }
  },

  readConfig: () => ipcRenderer.invoke("read-config"),

  saveConfig: (data) => ipcRenderer.invoke("save-config", data),

  readIni: () => ipcRenderer.invoke("read-ini"),

  saveIni: (data) => ipcRenderer.invoke("save-ini", data),

  updateIniSetting: (path, value) => ipcRenderer.invoke("update-ini-setting", path, value),

  importConfigFile: () => ipcRenderer.invoke("import-config-file"),

  // 一時メモのAPI
  saveTempNote: (data) => ipcRenderer.invoke("saveTempNote", data),
  
  getTempNote: (data) => ipcRenderer.invoke("getTempNote", data),

  // 🔧 アップデートデバッグAPI
  getUpdateDebugInfo: () => ipcRenderer.invoke("get-update-debug-info"),
  
  checkForUpdates: () => ipcRenderer.invoke("check-for-updates"),

  // カスタムボタン関連
  readCustomButtons: () => ipcRenderer.invoke("read-custom-buttons"),
  saveCustomButtons: (data) => ipcRenderer.invoke("save-custom-buttons", data),
  readAvailableActions: () => ipcRenderer.invoke("read-available-actions"),

});

