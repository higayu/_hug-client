// main/windowHandlers/computeWindows/windowManager.js
const { BrowserWindow, app } = require("electron");
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
function createDoubleWebviewWindow(
  url1,
  url2,
  label,
  htmlTemplate,
  facilityId,
  dateStr
) {
  const preloadPath = resolvePreloadPath();

  const win = new BrowserWindow({
    width: 1800,
    height: 900,
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
      webviewTag: true,
      sandbox: false,
      webSecurity: false,
    },
  });

  // HTMLテンプレートにURLとpreloadパスを挿入
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
 * preload.bundle.cjs のパスを解決する
 * @returns {string} preload.bundle.cjs のパス
 */
function resolvePreloadPath() {
  // 旧パス: preload.js を直接読む方式
  // const devPath = path.join(__dirname, "../../../../preload.js");
  // const prodPath = path.join(process.resourcesPath, "preload.js");

  // 新パス: bundle 済み preload を読む方式
  const bundlePath = path.join(app.getAppPath(), "preload.bundle.cjs");

  console.log("[computeWindows/windowManager] preload bundlePath =", bundlePath);
  console.log(
    "[computeWindows/windowManager] preload bundle exists =",
    fs.existsSync(bundlePath)
  );

  if (fs.existsSync(bundlePath)) {
    return bundlePath;
  }

  // 旧パス確認用ログだけ残す
  // console.log("[computeWindows/windowManager] old devPath =", devPath);
  // console.log("[computeWindows/windowManager] old prodPath =", prodPath);

  throw new Error("preload.bundle.cjs not found: " + bundlePath);
}

module.exports = {
  createDoubleWebviewWindow,
  resolvePreloadPath,
};
