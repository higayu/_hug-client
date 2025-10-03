const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("hugAPI", {
  fetchPage: () => ipcRenderer.invoke("fetch-hug"),
});
