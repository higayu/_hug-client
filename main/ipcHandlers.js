// main/ipcHandlers.js
const { ipcMain } = require("electron");
const { handleLogin } = require("./loginHandler");
const { handleApiCalls } = require("./apiHandler");
const { handleConfigAccess } = require("./configHandler");
const { registerPlanWindows } = require("./planWindows");

function registerIpcHandlers(mainWindow) {
  handleLogin(ipcMain, mainWindow);
  handleApiCalls(ipcMain, mainWindow);
  handleConfigAccess(ipcMain);
  registerPlanWindows(ipcMain);
}

module.exports = { registerIpcHandlers };
