// main.js
const { app, dialog, ipcMain } = require("electron");
const path = require("path");

const { createMainWindow } = require("./main/window");
const { registerIpcHandlers } = require("./main/ipcHandlers");
const { setAppMenu } = require("./main/menu");   // ← 追加
// ✅ 修正版（1階層深く）
const { registerSqliteHandlers } = require("./main/parts/handlers/sqliteHandler");


// ✅ アップデーター関連
const { autoUpdater } = require("electron-updater");
const log = require("electron-log");

// ログ設定
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = "info";

let updateDebugInfo = {
  isChecking: false,
  lastCheckTime: null,
  checkCount: 0,
  lastError: null,
  currentVersion: app.getVersion(),
  updateAvailable: false,
  downloadProgress: 0,
};
global.updateDebugInfo = updateDebugInfo;

// ============================================================
// 🏁 Electron 起動処理
// ============================================================
app.whenReady().then(async () => {
  setAppMenu();         // ← メニュー適用

  // 5秒後にアップデートチェック
  setTimeout(() => {
    try {
      updateDebugInfo.isChecking = true;
      updateDebugInfo.lastCheckTime = new Date().toISOString();
      updateDebugInfo.checkCount++;
      autoUpdater.checkForUpdatesAndNotify();
    } catch (err) {
      updateDebugInfo.lastError = err.message;
      updateDebugInfo.isChecking = false;
    }
  }, 5000);

  // メインウィンドウ作成
  const mainWindow = createMainWindow();

  // ============================================================
  // ⚡ IPCハンドラ登録
  // ============================================================
  registerIpcHandlers(mainWindow, null); // 既存のIPC（tempNoteHandlerは後で必要に応じて追加）
  // registerSqliteHandlersはapiHandler.js内でDB_TYPEに応じて自動登録される

  // ============================================================
  // 🪟 終了確認処理
  // ============================================================
  let isHandlingClose = false;
  mainWindow.on("close", (e) => {
    if (isHandlingClose) return;
    e.preventDefault();
    isHandlingClose = true;
    mainWindow.webContents.send("confirm-close-request");

    ipcMain.once("confirm-close-response", (event, shouldClose) => {
      if (shouldClose) {
        isHandlingClose = false;
        mainWindow.destroy();
      } else {
        isHandlingClose = false;
      }
    });
  });
});

// ============================================================
// 🔧 AutoUpdater イベントハンドラー
// ============================================================
autoUpdater.on("checking-for-update", () => {
  updateDebugInfo.isChecking = true;
});
autoUpdater.on("update-available", (info) => {
  updateDebugInfo.updateAvailable = true;
  updateDebugInfo.newVersion = info.version;
});
autoUpdater.on("update-not-available", () => {
  updateDebugInfo.updateAvailable = false;
  updateDebugInfo.isChecking = false;
});
autoUpdater.on("error", (err) => {
  updateDebugInfo.lastError = err.message;
  updateDebugInfo.isChecking = false;
});
autoUpdater.on("download-progress", (progressObj) => {
  updateDebugInfo.downloadProgress = progressObj.percent;
});
autoUpdater.on("update-downloaded", (info) => {
  updateDebugInfo.downloadComplete = true;
  const response = dialog.showMessageBoxSync({
    type: "info",
    title: "アップデート準備完了",
    message: `新しいバージョン ${info.version} がダウンロードされました。今すぐ再起動して更新しますか？`,
    buttons: ["今すぐ再起動", "後で"],
  });
  if (response === 0) {
    autoUpdater.quitAndInstall();
  }
});

// ============================================================
// 🧹 アプリ終了時の処理
// ============================================================
app.on("before-quit", () => {
  console.log("application start");
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
