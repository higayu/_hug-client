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
 * @param {string} facilityId - 施設ID
 * @param {string} dateStr - 日付文字列
 * @returns {BrowserWindow} 作成されたウィンドウ
 */
function createDoubleWebviewWindow(url1, url2, label, htmlTemplate, facilityId, dateStr) {
  const win = new BrowserWindow({
    width: 1800,
    height: 900,
    webPreferences: {
      preload: resolvePreloadPath(),
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
    .replace("{{PRELOAD_PATH}}", preloadPath)
    .replace("{{FACILITY_ID}}", facilityId || "")
    .replace("{{DATE_STR}}", dateStr || "");

  win.loadURL("data:text/html;charset=utf-8," + encodeURIComponent(html));
  
  win.webContents.once("did-finish-load", () => {
    console.log(`${label} window loaded`);
  });

  return win;
}

/**
 * preload.jsのパスを解決する
 * @returns {string} preload.jsのパス
 */
function resolvePreloadPath() {
  const devPath = path.join(__dirname, "../../../preload.js");
  const prodPath = path.join(process.resourcesPath, "preload.js");

  if (fs.existsSync(devPath)) return devPath;
  if (fs.existsSync(prodPath)) return prodPath;

  throw new Error("preload.js not found: " + devPath);
}


module.exports = {
  createDoubleWebviewWindow,
  resolvePreloadPath
};
