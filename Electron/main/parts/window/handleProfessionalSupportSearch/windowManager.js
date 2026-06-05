// main/parts/handleProfessionalSupportSearch/windowManager.js
const { BrowserWindow } = require("electron");
const path = require("path");
const fs = require("fs");

function createDoubleWebviewWindow(
  url1,
  url2,
  label,
  htmlTemplate, // ← もう使わない（互換のため残してOK）
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

  // ★ HTML ファイルを直接ロードする
  const htmlPath = path.join(
    __dirname,
    "templates",
    "ProfessionalSupport.html"
  );

  win.loadFile(htmlPath, {
    query: {
      URL1: url1,
      URL2: url2,
      FACILITY_ID: String(targetFacility?.id ?? ""),
      FACILITY_NAME: targetFacility?.name ?? "",
      FACILITY_URL: targetFacility?.url ?? "",
      DATE_STR: dateStr ?? "",
    },
  });

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
  const devPath = path.join(__dirname, "../../../../preload.js");
  const prodPath = path.join(process.resourcesPath, "preload.js");

  if (fs.existsSync(devPath)) return devPath;
  if (fs.existsSync(prodPath)) return prodPath;

  throw new Error("preload.js not found: " + devPath);
}

module.exports = {
  createDoubleWebviewWindow,
  resolvePreloadPath,
};
