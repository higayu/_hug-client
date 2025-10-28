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
    console.log(`✅ ${label}ウィンドウ（2ページ＋結果タブ）読み込み完了`);
  });

  return win;
}

/**
 * preload.jsのパスを解決する
 * @returns {string} preload.jsのパス
 */
function resolvePreloadPath() {
  // ① 開発時（npm start等）- プロジェクトルートのpreload.js
  const devPath = path.join(__dirname, "../../../preload.js");
  // ② パッケージ後
  const prodPath = path.join(process.resourcesPath, "data", "preload.js");

  console.log("🔍 preload.js パス確認:");
  console.log("  - 開発時パス:", devPath);
  console.log("  - パッケージ後パス:", prodPath);
  console.log("  - 開発時パス存在:", fs.existsSync(devPath));
  console.log("  - パッケージ後パス存在:", fs.existsSync(prodPath));

  if (fs.existsSync(devPath)) {
    console.log("✅ 開発時パスを使用:", devPath);
    return devPath;
  }
  if (fs.existsSync(prodPath)) {
    console.log("✅ パッケージ後パスを使用:", prodPath);
    return prodPath;
  }
  console.warn("⚠ preload.js が見つかりません。", devPath, prodPath);
  return devPath;
}

module.exports = {
  createDoubleWebviewWindow,
  resolvePreloadPath
};
