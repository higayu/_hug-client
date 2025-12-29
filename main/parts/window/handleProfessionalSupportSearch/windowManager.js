// main/parts/handleProfessionalSupportSearch/windowManager.js
const { BrowserWindow } = require("electron");
const path = require("path");
const fs = require("fs");

/**
 * ダブルWebViewウインドウを作成する
 * @param {string} url1
 * @param {string} url2
 * @param {string} label
 * @param {string} htmlTemplate
 * @param {{ id:number, name:string, url:string }} targetFacility
 * @param {string} dateStr
 */
function createDoubleWebviewWindow(
  url1,
  url2,
  label,
  htmlTemplate,
  targetFacility,
  dateStr
) {
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

  const preloadPath = resolvePreloadPath();

  const html = htmlTemplate
    .replace(/{{URL1}}/g, url1)
    .replace(/{{URL2}}/g, url2)
    .replace(/{{PRELOAD_PATH}}/g, preloadPath)
    .replace(/{{FACILITY_ID}}/g, String(targetFacility?.id ?? ""))
    .replace(/{{FACILITY_NAME}}/g, targetFacility?.name ?? "")
    .replace(/{{FACILITY_URL}}/g, targetFacility?.url ?? "")
    .replace(/{{DATE_STR}}/g, dateStr ?? "");

  win.loadURL(
    "data:text/html;charset=utf-8," + encodeURIComponent(html)
  );

  win.webContents.once("did-finish-load", () => {
    console.log(`${label} window loaded`);
    console.log("targetFacility:", targetFacility);
  });

  return win;
}

/**
 * preload.js のパス解決
 */
function resolvePreloadPath() {
  const devPath = path.join(__dirname, "../../../preload.js");
  const prodPath = path.join(process.resourcesPath, "data", "preload.js");

  if (fs.existsSync(devPath)) return devPath;
  if (fs.existsSync(prodPath)) return prodPath;

  console.warn("preload.js not found");
  return devPath;
}

module.exports = {
  createDoubleWebviewWindow,
  resolvePreloadPath,
};
