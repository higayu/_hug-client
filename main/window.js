// main/window.js
const { BrowserWindow } = require("electron");
const path = require("path");

function createMainWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(__dirname, "../assets/favicon.ico"),
    webPreferences: {
      preload: path.join(__dirname, "../preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
      webviewTag: true,
      sandbox: false,
    },
  });

  mainWindow.loadFile("renderer/index.html");
  
  // デバッグモード時のみDeveloperToolを開く
  const isDebugMode = process.argv.includes('--dev') || process.argv.includes('--debug');
  if (isDebugMode) {
    mainWindow.webContents.openDevTools();//開発者ツールを開く
  }
  
  return mainWindow;
}

module.exports = { createMainWindow };
