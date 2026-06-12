// main.js
const { app } = require("electron");

const { createMainWindow } = require("./main/window");
const { registerIpcHandlers } = require("./main/ipcHandlers");
const { setAppMenu } = require("./main/menu");

const { setupMediaPermissions } = require("./main/permissions");
const { setupAutoUpdater, scheduleUpdateCheck } = require("./main/updateManager");
const { registerWhisperTranscriber } = require("./main/whisperTranscriber");
const { registerCloseConfirmation } = require("./main/closeConfirmation");
const { registerAppLifecycleHandlers } = require("./main/lifecycle");

// ============================================================
// 🧹 アプリ終了系イベント
// ============================================================
registerAppLifecycleHandlers();

// ============================================================
// 🏁 Electron 起動処理
// ============================================================
app.whenReady().then(async () => {
  // メニュー
  setAppMenu();

  // マイク権限
  setupMediaPermissions();

  // アップデーター
  setupAutoUpdater();

  // whisper.cpp 文字起こし IPC
  registerWhisperTranscriber();

  // 5秒後にアップデートチェック
  scheduleUpdateCheck(5000);

  // メインウィンドウ作成
  const mainWindow = createMainWindow();

  // 既存IPC
  registerIpcHandlers(mainWindow, null);

  // 終了確認
  registerCloseConfirmation(mainWindow);
});