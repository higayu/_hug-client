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

  // 開発環境と本番環境で読み込み方法を切り替え
  const isDev = process.argv.includes('--dev') || process.argv.includes('--debug') || !require('electron').app.isPackaged;
  
  if (isDev) {
    // 開発環境: Vite開発サーバー
    mainWindow.loadURL('http://localhost:5173');
    console.log("🔧 [MAIN] 開発環境: Vite開発サーバーに接続 (http://localhost:5173)");
  } else {
    // 本番環境: ビルド済みファイル
    const rendererPath = path.join(__dirname, "../renderer/dist/index.html");
    mainWindow.loadFile(rendererPath);
    console.log("🔧 [MAIN] 本番環境: ビルド済みファイルを読み込み:", rendererPath);
  }
  
  // デバッグモード時のみDeveloperToolを開く
  const isDebugMode = process.argv.includes('--dev') || process.argv.includes('--debug');
  if (isDebugMode) {
    mainWindow.webContents.openDevTools();//開発者ツールを開く
  }
  
  return mainWindow;
}

module.exports = { createMainWindow };
