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
  } else {
    console.error("❌ [MAIN] 一時メモデータベース初期化失敗:", dbResult.error);
  }
  
  registerIpcHandlers(mainWindow, globalTempNoteHandler);
  console.log("🔧 [MAIN] IPCハンドラーの登録を開始しました");
});
