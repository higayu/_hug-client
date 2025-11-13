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
  const fs = require('fs');
  const rendererDistPath = path.join(__dirname, "../renderer/dist/index.html");
  const hasProdFlag = process.argv.includes('--prod') || process.argv.includes('--production');
  const hasDevFlag = process.argv.includes('--dev') || process.argv.includes('--debug');
  const isPackaged = require('electron').app.isPackaged;
  
  // 優先順位: --prod > --dev > (パッケージ済み) > (開発モード)
  let isDev;
  if (hasProdFlag) {
    // --prodフラグが指定されている場合は本番モード
    isDev = false;
  } else if (hasDevFlag) {
    // --devフラグが指定されている場合は開発モード
    isDev = true;
  } else if (isPackaged) {
    // パッケージ済みの場合は本番モード
    isDev = false;
  } else {
    // その他の場合は開発モード
    isDev = true;
  }
  
  if (isDev) {
    // 開発環境: Vite開発サーバー
    mainWindow.loadURL('http://localhost:5173');
  } else {
    // 本番環境: ビルド済みファイル
    const hasDistFile = fs.existsSync(rendererDistPath);
    if (!hasDistFile) {
      console.error("❌ [MAIN] エラー: renderer/dist/index.html が見つかりません。先に 'npm run build:renderer' を実行してください。");
      // フォールバック: 開発サーバーに接続を試みる
      mainWindow.loadURL('http://localhost:5173');
    } else {
      mainWindow.loadFile(rendererDistPath);
    }
  }
  
  // デバッグモード時のみDeveloperToolを開く
  const isDebugMode = process.argv.includes('--dev') || process.argv.includes('--debug');
  if (isDebugMode) {
    mainWindow.webContents.openDevTools();//開発者ツールを開く
  }
  
  return mainWindow;
}

module.exports = { createMainWindow };
