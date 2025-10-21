// main.js
const { app } = require("electron");
const path = require("path");
//require("dotenv").config();

const { createMainWindow } = require("./main/window");
const { registerIpcHandlers } = require("./main/ipcHandlers");
const TempNoteHandler = require("./main/parts/tempNoteHandler");

// グローバル変数としてtempNoteHandlerを保存
let globalTempNoteHandler = null;

app.whenReady().then(async () => {
  console.log("🚀 [MAIN] Electronアプリが起動しました");
  const mainWindow = createMainWindow();
  console.log("🪟 [MAIN] メインウィンドウを作成しました");
  
  // 一時メモハンドラーの初期化
  console.log("🚀 [MAIN] 一時メモハンドラー初期化開始");
  globalTempNoteHandler = new TempNoteHandler();
  console.log("🔍 [MAIN] TempNoteHandlerインスタンス作成完了");
  
  const dbResult = await globalTempNoteHandler.initDatabase();
  console.log("🔍 [MAIN] データベース初期化結果:", dbResult);
  
  if (dbResult.success) {
    console.log("✅ [MAIN] 一時メモデータベース初期化完了");
    console.log("🔍 [MAIN] データベースパス:", dbResult.dbPath);
    
    // データベース初期化が成功してからIPCハンドラーを登録
    registerIpcHandlers(mainWindow, globalTempNoteHandler);
    console.log("🔧 [MAIN] IPCハンドラーの登録を開始しました");
  } else {
    console.error("❌ [MAIN] 一時メモデータベース初期化失敗:", dbResult.error);
    // 初期化に失敗してもIPCハンドラーは登録（再初期化機能のため）
    registerIpcHandlers(mainWindow, globalTempNoteHandler);
    console.log("🔧 [MAIN] IPCハンドラーの登録を開始しました（再初期化機能付き）");
  }
});

// アプリケーション終了時の処理
app.on('before-quit', () => {
  console.log("🔄 [MAIN] アプリケーション終了前の処理開始");
  if (globalTempNoteHandler) {
    console.log("🔒 [MAIN] データベース接続を閉じています...");
    globalTempNoteHandler.closeDatabase();
    console.log("✅ [MAIN] データベース接続を閉じました");
  }
});

app.on('window-all-closed', () => {
  console.log("🪟 [MAIN] すべてのウィンドウが閉じられました");
  if (process.platform !== 'darwin') {
    console.log("🔄 [MAIN] アプリケーションを終了しています...");
    app.quit();
  }
});