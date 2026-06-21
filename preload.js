// preload.js
const { contextBridge, ipcRenderer } = require("electron");

console.log("[preload.bundle.cjs] start");

const { createElectronApi } = require("./preload/electronApi");
const { createDevApi } = require("./preload/devApi");
const { createWhisperApi } = require("./preload/whisperApi");

const isDebugMode =
  process.argv.includes("--dev") || process.argv.includes("--debug");

contextBridge.exposeInMainWorld(
  "electronAPI",
  createElectronApi(ipcRenderer, isDebugMode)
);

contextBridge.exposeInMainWorld(
  "api",
  createDevApi(ipcRenderer)
);

contextBridge.exposeInMainWorld(
  "whisperAPI",
  createWhisperApi(ipcRenderer)
);