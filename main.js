// main.js
const { app, dialog } = require("electron"); // ← dialog を追加！
const path = require("path");
//require("dotenv").config();

const { createMainWindow } = require("./main/window");
const { registerIpcHandlers } = require("./main/ipcHandlers");
const TempNoteHandler = require("./main/parts/tempNoteHandler");

// ✅ 正しいモジュールを使用
const { autoUpdater } = require("electron-updater");
const log = require("electron-log");

// ログ設定（アップデート経過をファイル出力）
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = "info";

// グローバル変数としてtempNoteHandlerを保存
let globalTempNoteHandler = null;

app.whenReady().then(async () => {
  console.log("🚀 [MAIN] Electronアプリが起動しました");

  // 🔹 5秒後にアップデートチェック（GitHub通信の安定化のため）
  setTimeout(() => {
    try {
      console.log("🔄 [UPDATE] アップデートチェック開始");
      autoUpdater.checkForUpdatesAndNotify();
    } catch (err) {
      console.error("⚠️ [UPDATE] アップデートチェック失敗:", err);
    }
  }, 5000);

  const mainWindow = createMainWindow();
  console.log("🪟 [MAIN] メインウィンドウを作成しました");

  // データベース初期化
  globalTempNoteHandler = new TempNoteHandler();
  const dbResult = await globalTempNoteHandler.initDatabase();
  if (dbResult.success) {
    console.log("✅ [MAIN] 一時メモデータベース初期化完了");
    registerIpcHandlers(mainWindow, globalTempNoteHandler);
  } else {
    console.error("❌ [MAIN] データベース初期化失敗:", dbResult.error);
    registerIpcHandlers(mainWindow, globalTempNoteHandler);
  }
});


// 🔹 自動アップデート後の挙動（ダウンロード完了時に再起動確認）
// 🔹 ダウンロード完了時に再起動確認
autoUpdater.on("update-downloaded", () => {
  const response = dialog.showMessageBoxSync({
    type: "info",
    title: "アップデート準備完了",
    message: "新しいバージョンがダウンロードされました。今すぐ再起動して更新しますか？",
    buttons: ["今すぐ再起動", "後で"]
  });
  if (response === 0) autoUpdater.quitAndInstall();
});


// アプリケーション終了時の処理
app.on("before-quit", () => {
  console.log("🔄 [MAIN] アプリケーション終了前の処理開始");
  if (globalTempNoteHandler) {
    console.log("🔒 [MAIN] データベース接続を閉じています...");
    globalTempNoteHandler.closeDatabase();
    console.log("✅ [MAIN] データベース接続を閉じました");
  }
});

app.on("window-all-closed", () => {
  console.log("🪟 [MAIN] すべてのウィンドウが閉じられました");
  if (process.platform !== "darwin") {
    console.log("🔄 [MAIN] アプリケーションを終了しています...");
    app.quit();
  }
});
