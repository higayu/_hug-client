// preload.js
const { contextBridge, ipcRenderer } = require("electron");

const { createElectronApi } = require("./preload/electronApi");
const { createDevApi } = require("./preload/devApi");
const { createWhisperApi } = require("./preload/whisperApi");

// デバッグモード判定
const isDebugMode =
  process.argv.includes("--dev") || process.argv.includes("--debug");

// メインAPI
contextBridge.exposeInMainWorld(
  "electronAPI",
  createElectronApi(ipcRenderer, isDebugMode)
);

// 開発用API
contextBridge.exposeInMainWorld(
  "api",
  createDevApi(ipcRenderer)
);

// whisper.cpp 文字起こしAPI
contextBridge.exposeInMainWorld(
  "whisperAPI",
  createWhisperApi(ipcRenderer)
);