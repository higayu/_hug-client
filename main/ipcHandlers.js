// main/ipcHandlers.js
const { ipcMain } = require("electron");
const { handleLogin } = require("./parts/loginHandler");
const { handleApiCalls } = require("./parts/apiHandler");
const { handleConfigAccess } = require("./parts/configHandler");
const { handleIniAccess } = require("./parts/iniHandler");
const { registerPlanWindows } = require("./parts/planWindows");
const { open_test_double_get } = require("./parts/computeWindows");

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
    
    registerPlanWindows(ipcMain);
    console.log("✅ [MAIN] registerPlanWindows 登録完了");
    
    open_test_double_get(ipcMain);
    console.log("✅ [MAIN] open_test_double_get 登録完了");
    
    // 一時メモのIPCハンドラー
    ipcMain.handle('saveTempNote', async (event, data) => {
      console.log("🔍 [IPC] saveTempNote 呼び出し:", data);
      console.log("🔍 [IPC] tempNoteHandler:", tempNoteHandler ? "存在" : "未定義");
      if (!tempNoteHandler) {
        return { success: false, error: "tempNoteHandlerが初期化されていません" };
      }
      return await tempNoteHandler.saveTempNote(data);
    });
    
    ipcMain.handle('getTempNote', async (event, data) => {
      console.log("🔍 [IPC] getTempNote 呼び出し:", data);
      console.log("🔍 [IPC] tempNoteHandler:", tempNoteHandler ? "存在" : "未定義");
      if (!tempNoteHandler) {
        return { success: false, error: "tempNoteHandlerが初期化されていません" };
      }
      return await tempNoteHandler.getTempNote(data);
    });
    
    console.log("✅ [MAIN] 一時メモIPCハンドラー 登録完了");
    
    console.log("✅ [MAIN] すべてのIPCハンドラーを登録しました");
  } catch (error) {
    console.error("❌ [MAIN] IPCハンドラー登録中にエラー:", error);
  }
}

module.exports = { registerIpcHandlers };
