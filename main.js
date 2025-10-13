// main.js
const { app } = require("electron");
const path = require("path");
//require("dotenv").config();

const { createMainWindow } = require("./main/window");
const { registerIpcHandlers } = require("./main/ipcHandlers");

app.whenReady().then(() => {
  const mainWindow = createMainWindow();
  registerIpcHandlers(mainWindow);
});
