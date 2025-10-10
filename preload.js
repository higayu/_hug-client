const { contextBridge, ipcRenderer } = require("electron");

console.log("✅ preload.js が読み込まれた");

contextBridge.exposeInMainWorld("electronAPI", {
  hugLogin: () => ipcRenderer.invoke("hug-login"),
  doAutoLogin: (username, password) =>
    ipcRenderer.invoke("do-auto-login", { username, password }),
  onInjectLogin: (callback) =>
    ipcRenderer.on("inject-login", (event, args) => callback(args)),

    // API 呼び出し (main 経由)
  // ✅ 子ども一覧取得 (引数を明示的にログ出力)
  GetChildrenByStaffAndDay: async (staffId, date) => {
    console.log("📤 [preload] GetChildrenByStaffAndDay 呼び出し");
    console.log("  ↳ 渡す引数:", { staffId, date });
    try {
      const result = await ipcRenderer.invoke("GetChildrenByStaffAndDay", { staffId, date });
      console.log("📥 [preload] main からの応答:", result);
      return result;
    } catch (err) {
      console.error("❌ [preload] IPC 呼び出し失敗:", err);
      throw err;
    }
  },

  openIndividualSupportPlan: (childId) => ipcRenderer.send("open-individual-support-plan", childId),

    // 既存のAPIに加えて...
  openSpecializedSupportPlan: (childId) => ipcRenderer.send("open-specialized-support-plan", childId),

  readConfig: () => ipcRenderer.invoke("read-config"),

  importConfigFile: () => ipcRenderer.invoke("import-config-file"),

});

