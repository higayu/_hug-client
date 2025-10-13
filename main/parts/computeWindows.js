// main/parts/computeWindows.js
const { BrowserWindow } = require("electron");
const path = require("path");

let isRegistered = false;

function open_test_double_get(ipcMain) {
  if (isRegistered) return;
  isRegistered = true;

  ipcMain.on("open-test-double-get", () => {
    openDoubleWebviewWindow(
      "https://www.hug-ayumu.link/hug/wm/record_proceedings.php",
      "https://www.hug-ayumu.link/hug/wm/addition_plan_situation.php",
      "test取得"
    );
  });
}

function openDoubleWebviewWindow(url1, url2, label) {
  console.log(`🆕 ${label}ウィンドウを開きます (2画面)`);

  const win = new BrowserWindow({
    width: 1800,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, "../../preload.js"),
      nodeIntegration: false,        // ❌ preloadを使うときはfalseにする
      contextIsolation: true,        // ✅ contextBridgeを使うために必要
      webviewTag: true,              // ✅ <webview>を有効化
    },
  });

  // ✅ webview を2つ横並びに配置
const html = `
  <!DOCTYPE html>
  <html>
    <head>
      <!-- ✅ inline CSS を許可し、CSP警告を抑制 -->
      <meta http-equiv="Content-Security-Policy"
        content="default-src 'self' https: data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline';">

      <style>
        html, body {
          margin: 0;
          padding: 0;
          height: 100%;
          width: 100%;
          display: flex;
          overflow: hidden;
          background: #eee;
        }
        webview {
          flex: 1;
          height: 100%;
          border: none;
        }
        #left { border-right: 2px solid #ccc; }
      </style>
    </head>
    <body>
      <webview id="left"
        src="${url1}"
        preload="${path.join(process.resourcesPath ?? __dirname, '../../preload.js')}"></webview>
      <webview id="right"
        src="${url2}"
        preload="${path.join(process.resourcesPath ?? __dirname, '../../preload.js')}"></webview>
    </body>
  </html>
`;



  win.loadURL("data:text/html;charset=utf-8," + encodeURIComponent(html));

  win.webContents.once("did-finish-load", () => {
    console.log(`✅ ${label}ウィンドウ (2ページ) 読み込み完了`);
  });
}

module.exports = { open_test_double_get };
