// main/parts/windowManager.js
const { BrowserWindow } = require("electron");
const path = require("path");
const fs = require("fs");

/**
 * ダブルWebViewウィンドウを作成する
 * @param {string} url1 - 左側のURL
 * @param {string} url2 - 右側のURL
 * @param {string} label - ウィンドウのラベル
 * @param {string} htmlTemplate - HTMLテンプレート
 * @returns {BrowserWindow} 作成されたウィンドウ
 */
function createDoubleWebviewWindow(url1, url2, label, htmlTemplate) {
  const win = new BrowserWindow({
    width: 1800,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, "../../preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      webviewTag: true,
      sandbox: false,
      webSecurity: false,
    },
  });

  // HTMLテンプレートにURLとpreloadパスを挿入
  const preloadPath = resolvePreloadPath();
  const html = htmlTemplate
    .replace("{{URL1}}", url1)
    .replace("{{URL2}}", url2)
    .replace("{{PRELOAD_PATH}}", preloadPath);

  win.loadURL("data:text/html;charset=utf-8," + encodeURIComponent(html));
  
  win.webContents.once("did-finish-load", () => {
    console.log(`✅ ${label}ウィンドウ（2ページ＋結果タブ）読み込み完了`);
  });

  return win;
}

/**
 * preload.jsのパスを解決する
 * @returns {string} preload.jsのパス
 */
function resolvePreloadPath() {
  // ① 開発時（npm start等）
  const devPath = path.join(__dirname, "../../preload.js");
  // ② パッケージ後
  const prodPath = path.join(process.resourcesPath, "data", "preload.js");

  if (fs.existsSync(devPath)) return devPath;
  if (fs.existsSync(prodPath)) return prodPath;
  console.warn("⚠ preload.js が見つかりません。", devPath, prodPath);
  return devPath;
}

module.exports = {
  createDoubleWebviewWindow,
  resolvePreloadPath
};
