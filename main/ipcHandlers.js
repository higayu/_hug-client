// main/ipcHandlers.js
const { ipcMain } = require("electron");
const { handleLogin } = require("./parts/loginHandler");
const { handleApiCalls } = require("./parts/apiHandler");
const { handleConfigAccess } = require("./parts/configHandler");
const { registerPlanWindows } = require("./parts/planWindows");
const { open_test_double_get } = require("./parts/computeWindows");

function registerIpcHandlers(mainWindow) {
  handleLogin(ipcMain, mainWindow);
  handleApiCalls(ipcMain, mainWindow);
  handleConfigAccess(ipcMain);
  registerPlanWindows(ipcMain);
  open_test_double_get(ipcMain);
}

module.exports = { registerIpcHandlers };
