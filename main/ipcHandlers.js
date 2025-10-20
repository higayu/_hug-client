// main/ipcHandlers.js
const { ipcMain } = require("electron");
const { handleLogin } = require("./parts/loginHandler");
const { handleApiCalls } = require("./parts/apiHandler");
const { handleConfigAccess } = require("./parts/configHandler");
const { handleIniAccess } = require("./parts/iniHandler");
const { registerPlanWindows } = require("./parts/planWindows");
const { open_test_double_get } = require("./parts/computeWindows");

function registerIpcHandlers(mainWindow) {
  console.log("🔧 [MAIN] IPCハンドラーを登録中...");
  handleLogin(ipcMain, mainWindow);
  handleApiCalls(ipcMain, mainWindow);
  handleConfigAccess(ipcMain);
  handleIniAccess(ipcMain);
  registerPlanWindows(ipcMain);
  open_test_double_get(ipcMain);
  console.log("✅ [MAIN] すべてのIPCハンドラーを登録しました");
}

module.exports = { registerIpcHandlers };
