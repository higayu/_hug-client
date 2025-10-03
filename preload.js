const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  hugLogin: () => ipcRenderer.invoke("hug-login")
});
