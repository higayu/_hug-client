// main/ipcHandlers.js
const { ipcMain, app } = require("electron");
const path = require("path");
const { pathToFileURL } = require("url");
const fs = require("fs");
const { handleLogin } = require("./parts/handlers/loginHandler");
const { handleApiCalls } = require("./parts/handlers/apiHandler");
const { handleConfigAccess } = require("./parts/handlers/configHandler");
const { handleIniAccess } = require("./parts/handlers/iniHandler");
const { handleCustomButtonsAccess } = require("./parts/handlers/customButtonsHandler");
const { registerPlanWindows } = require("./parts/window/planWindows");
const { open_addition_compare_btn } = require("./parts/window/computeWindows");

function registerIpcHandlers(mainWindow, tempNoteHandler) {
  console.log("🔧 [MAIN] IPCハンドラーを登録中...");
  console.log("🔍 [MAIN] mainWindow:", mainWindow ? "存在" : "未定義");
  console.log("🔍 [MAIN] ipcMain:", ipcMain ? "存在" : "未定義");
  console.log("🔍 [MAIN] tempNoteHandler:", tempNoteHandler ? "存在" : "未定義");
  
  try {
    handleLogin(ipcMain, mainWindow);
    console.log("✅ [MAIN] handleLogin 登録完了");
    
    handleApiCalls(ipcMain, mainWindow);
    console.log("✅ [MAIN] handleApiCalls 登録完了");
    
    handleConfigAccess(ipcMain);
    console.log("✅ [MAIN] handleConfigAccess 登録完了");
    
    handleIniAccess(ipcMain);
    console.log("✅ [MAIN] handleIniAccess 登録完了");
    
    handleCustomButtonsAccess(ipcMain);
    console.log("✅ [MAIN] handleCustomButtonsAccess 登録完了");
    
    registerPlanWindows(ipcMain);
    console.log("✅ [MAIN] registerPlanWindows 登録完了");
    
    open_addition_compare_btn(ipcMain);
    console.log("✅ [MAIN] open_addition_compare_btn 登録完了");
    
    // 一時メモのIPCハンドラー
    ipcMain.handle('saveTempNote', async (event, data) => {
      console.log("🔍 [IPC] saveTempNote 呼び出し:", data);
      console.log("🔍 [IPC] tempNoteHandler:", tempNoteHandler ? "存在" : "未定義");
      if (!tempNoteHandler) {
        return { success: false, error: "tempNoteHandlerが初期化されていません" };
      }
      
      // データベース接続状態を確認
      if (!tempNoteHandler.isDatabaseConnected()) {
        console.log("🔄 [IPC] データベース未接続のため再初期化を試行");
        const initResult = await tempNoteHandler.initDatabase();
        if (!initResult.success) {
          return { success: false, error: "データベースの再初期化に失敗しました: " + initResult.error };
        }
      }
      
      return await tempNoteHandler.saveTempNote(data);
    });
    
    ipcMain.handle('getTempNote', async (event, data) => {
      console.log("🔍 [IPC] getTempNote 呼び出し:", data);
      console.log("🔍 [IPC] tempNoteHandler:", tempNoteHandler ? "存在" : "未定義");
      if (!tempNoteHandler) {
        return { success: false, error: "tempNoteHandlerが初期化されていません" };
      }
      
      // データベース接続状態を確認
      if (!tempNoteHandler.isDatabaseConnected()) {
        console.log("🔄 [IPC] データベース未接続のため再初期化を試行");
        const initResult = await tempNoteHandler.initDatabase();
        if (!initResult.success) {
          return { success: false, error: "データベースの再初期化に失敗しました: " + initResult.error };
        }
      }
      
      return await tempNoteHandler.getTempNote(data);
    });
    
    console.log("✅ [MAIN] 一時メモIPCハンドラー 登録完了");
    
    // 🔧 アップデートデバッグ情報取得ハンドラー
    ipcMain.handle('get-update-debug-info', async () => {
      console.log("🔧 [IPC] アップデートデバッグ情報取得要求");
      return {
        success: true,
        data: global.updateDebugInfo || {
          isChecking: false,
          lastCheckTime: null,
          checkCount: 0,
          lastError: null,
          currentVersion: "不明",
          updateAvailable: false,
          downloadProgress: 0
        }
      };
    });
    
    // 🔧 手動アップデートチェックハンドラー
    ipcMain.handle('check-for-updates', async () => {
      console.log("🔧 [IPC] 手動アップデートチェック要求");
      try {
        const { autoUpdater } = require("electron-updater");
        const result = await autoUpdater.checkForUpdates();
        console.log("🔧 [IPC] 手動アップデートチェック結果:", result);
        return { success: true, data: result };
      } catch (err) {
        console.error("❌ [IPC] 手動アップデートチェックエラー:", err);
        return { success: false, error: err.message };
      }
    });
    
    console.log("✅ [MAIN] アップデートデバッグハンドラー 登録完了");
    
    // 🔧 webviewのpreload属性用のパス取得ハンドラー
    ipcMain.handle('get-preload-path', async () => {
      console.log("🔧 [IPC] getPreloadPath 呼び出し");
      try {
        // 開発環境と本番環境で正しいパスを取得
        const appPath = app.isPackaged 
          ? path.dirname(process.execPath)  // 本番環境: 実行ファイルのディレクトリ
          : app.getAppPath();                // 開発環境: アプリのルートディレクトリ
        
        const preloadPath = path.resolve(appPath, 'preload.js');
        
        // ファイル存在確認
        if (!fs.existsSync(preloadPath)) {
          console.error('❌ preload.jsが見つかりません:', preloadPath);
          console.error('🔍 [getPreloadPath] app.isPackaged:', app.isPackaged);
          console.error('🔍 [getPreloadPath] appPath:', appPath);
          return null;
        }
        
        // pathToFileURLは絶対パスをfile:// URLに変換する
        const fileUrl = pathToFileURL(preloadPath).href;
        console.log("✅ [IPC] preloadパス:", fileUrl);
        console.log("🔍 [IPC] app.isPackaged:", app.isPackaged);
        console.log("🔍 [IPC] appPath:", appPath);
        console.log("🔍 [IPC] ファイル存在確認:", fs.existsSync(preloadPath));
        
        return fileUrl;
      } catch (err) {
        console.error("❌ [IPC] preloadパス取得エラー:", err);
        throw err;
      }
    });
    
    console.log("✅ [MAIN] getPreloadPathハンドラー 登録完了");
    console.log("✅ [MAIN] すべてのIPCハンドラーを登録しました");
  } catch (error) {
    console.error("❌ [MAIN] IPCハンドラー登録中にエラー:", error);
  }
}

module.exports = { registerIpcHandlers };
