const { contextBridge, ipcRenderer } = require("electron");

console.log("✅ preload.js が読み込まれた");

contextBridge.exposeInMainWorld("electronAPI", {
  hugLogin: () => ipcRenderer.invoke("hug-login"),
  doAutoLogin: (username, password) =>
    ipcRenderer.invoke("do-auto-login", { username, password }),
  onInjectLogin: (callback) =>
    ipcRenderer.on("inject-login", (event, args) => callback(args)),
  getEnv: () => ipcRenderer.invoke("get-env"),  // ← 追加

    // API 呼び出し (main 経由)
  fetchStaff: () => ipcRenderer.invoke("fetch-staff"),
});
