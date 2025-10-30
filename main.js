// main.js
const { app, dialog } = require("electron"); // ← dialog を追加！
const path = require("path");
//require("dotenv").config();

const { createMainWindow } = require("./main/window");
const { registerIpcHandlers } = require("./main/ipcHandlers");
const TempNoteHandler = require("./main/parts/handlers/tempNoteHandler");

// ✅ 正しいモジュールを使用
const { autoUpdater } = require("electron-updater");
const log = require("electron-log");

// ログ設定（アップデート経過をファイル出力）
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = "info";

// 🔧 デバッグ用のアップデート状態管理
let updateDebugInfo = {
  isChecking: false,
  lastCheckTime: null,
  checkCount: 0,
  lastError: null,
  currentVersion: app.getVersion(),
  updateAvailable: false,
  downloadProgress: 0
};

// グローバル変数として設定（IPCハンドラーからアクセス可能にする）
global.updateDebugInfo = updateDebugInfo;

// グローバル変数としてtempNoteHandlerを保存
let globalTempNoteHandler = null;

app.whenReady().then(async () => {
  console.log("🚀 [MAIN] Electronアプリが起動しました");

  // 🔹 5秒後にアップデートチェック（GitHub通信の安定化のため）
  //console.log("⏰ [UPDATE] 5秒後にアップデートチェックを開始します...");
  setTimeout(() => {
    try {
      // console.log("🔄 [UPDATE] アップデートチェック開始");
      // console.log("🔧 [UPDATE DEBUG] 現在のバージョン:", app.getVersion());
      // console.log("🔧 [UPDATE DEBUG] パッケージ状態:", app.isPackaged ? "パッケージ済み" : "開発中");
      // console.log("🔧 [UPDATE DEBUG] プロセス引数:", process.argv);
      
      updateDebugInfo.isChecking = true;
      updateDebugInfo.lastCheckTime = new Date().toISOString();
      updateDebugInfo.checkCount++;
      // console.log("🔧 [UPDATE DEBUG] チェック開始:", updateDebugInfo);
      
      // アップデーターの設定を確認
      // console.log("🔧 [UPDATE DEBUG] autoUpdater設定:");
      // console.log("  - allowPrerelease:", autoUpdater.allowPrerelease);
      // console.log("  - autoDownload:", autoUpdater.autoDownload);
      // console.log("  - autoInstallOnAppQuit:", autoUpdater.autoInstallOnAppQuit);
      
      autoUpdater.checkForUpdatesAndNotify();
    } catch (err) {
      console.error("⚠️ [UPDATE] アップデートチェック失敗:", err);
      updateDebugInfo.lastError = err.message;
      updateDebugInfo.isChecking = false;
    }
  }, 5000);

  const mainWindow = createMainWindow();
  //console.log("🪟 [MAIN] メインウィンドウを作成しました");

  // 退出確認: rendererに問い合わせてから閉じる
  const { ipcMain } = require("electron");
  let isHandlingClose = false;
  mainWindow.on("close", (e) => {
    if (isHandlingClose) return; // 多重実行防止
    e.preventDefault();
    isHandlingClose = true;

    // rendererに確認要求
    mainWindow.webContents.send("confirm-close-request");

    // 1回限りの応答待ち
    ipcMain.once("confirm-close-response", (event, shouldClose) => {
      if (shouldClose) {
        isHandlingClose = false;
        // destroyでbeforeunload/closeを再発火させない
        mainWindow.destroy();
      } else {
        isHandlingClose = false;
      }
    });
  });

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


// 🔧 詳細なアップデートイベントハンドラー
autoUpdater.on("checking-for-update", () => {
  // console.log("🔍 [UPDATE] アップデート確認中...");
  updateDebugInfo.isChecking = true;
});

autoUpdater.on("update-available", (info) => {
  // console.log("✅ [UPDATE] アップデート利用可能:", info);
  updateDebugInfo.updateAvailable = true;
  updateDebugInfo.newVersion = info.version;
  // console.log("🔧 [UPDATE DEBUG] アップデート情報:", {
  //   version: info.version,
  //   releaseName: info.releaseName,
  //   releaseNotes: info.releaseNotes,
  //   releaseDate: info.releaseDate
  // });
});

autoUpdater.on("update-not-available", (info) => {
  // console.log("ℹ️ [UPDATE] アップデートなし（最新版）:", info);
  updateDebugInfo.updateAvailable = false;
  updateDebugInfo.isChecking = false;
});

autoUpdater.on("error", (err) => {
  // console.error("❌ [UPDATE] アップデートエラー:", err);
  updateDebugInfo.lastError = err.message;
  updateDebugInfo.isChecking = false;
  // console.log("🔧 [UPDATE DEBUG] エラー詳細:", {
  //   message: err.message,
  //   stack: err.stack,
  //   code: err.code
  // });
});

autoUpdater.on("download-progress", (progressObj) => {
  // const log_message = `📥 [UPDATE] ダウンロード進捗: ${progressObj.percent}% (${progressObj.transferred}/${progressObj.total})`;
  // console.log(log_message);
  updateDebugInfo.downloadProgress = progressObj.percent;
  // console.log("🔧 [UPDATE DEBUG] ダウンロード詳細:", {
  //   percent: progressObj.percent,
  //   transferred: progressObj.transferred,
  //   total: progressObj.total,
  //   bytesPerSecond: progressObj.bytesPerSecond
  // });
});

autoUpdater.on("update-downloaded", (info) => {
  // console.log("✅ [UPDATE] アップデートダウンロード完了:", info);
  updateDebugInfo.downloadComplete = true;
  // console.log("🔧 [UPDATE DEBUG] ダウンロード完了情報:", {
  //   version: info.version,
  //   releaseName: info.releaseName,
  //   releaseNotes: info.releaseNotes
  // });
  
  const response = dialog.showMessageBoxSync({
    type: "info",
    title: "アップデート準備完了",
    message: `新しいバージョン ${info.version} がダウンロードされました。今すぐ再起動して更新しますか？`,
    buttons: ["今すぐ再起動", "後で"]
  });
  if (response === 0) {
    console.log("🔄 [UPDATE] アプリケーション再起動開始");
    autoUpdater.quitAndInstall();
  }
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
