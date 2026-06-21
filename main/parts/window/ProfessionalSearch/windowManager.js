// main\parts\window\ProfessionalSearch\windowManager.js
const { BrowserWindow, app } = require("electron");
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
 * preload.bundle.cjs のパス解決
 */
function resolvePreloadPath() {
  // 旧パス: preload.js を直接読む方式
  // const devPath = path.join(__dirname, "../../../../preload.js");
  // const prodPath = path.join(process.resourcesPath, "preload.js");

  // 新パス: bundle 済み preload を読む方式
  const bundlePath = path.join(app.getAppPath(), "preload.bundle.cjs");

  console.log("[ProfessionalSearch/windowManager] preload bundlePath =", bundlePath);
  console.log(
    "[ProfessionalSearch/windowManager] preload bundle exists =",
    fs.existsSync(bundlePath)
  );

  if (fs.existsSync(bundlePath)) {
    return bundlePath;
  }

  // 旧パス確認用ログだけ残す
  // console.log("[ProfessionalSearch/windowManager] old devPath =", devPath);
  // console.log("[ProfessionalSearch/windowManager] old prodPath =", prodPath);

  throw new Error("preload.bundle.cjs not found: " + bundlePath);
}

module.exports = {
  createDoubleWebviewWindow,
  resolvePreloadPath,
};