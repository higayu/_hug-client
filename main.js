const { app, BrowserWindow, ipcMain } = require("electron");
const fs = require('fs');
const path = require("path");
const { loginHug } = require("./puppeteer/login.js");
require("dotenv").config();  // ← 追加

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
      webviewTag: true,   // ← webviewを有効化
      sandbox: false,   // ← これを追加！
    },
  });


  mainWindow.loadFile("renderer/index.html");

    // ⭐ ここを追加
  mainWindow.webContents.openDevTools();
}

app.whenReady().then(createWindow);

// ✅ UI からログイン命令を受け取る
ipcMain.handle("hug-login", async () => {
  try {
    const page = await loginHug(); // puppeteerでログイン
    const cookies = await page.cookies();

    // ElectronセッションにCookieを注入
    const { session } = mainWindow.webContents;
    for (const cookie of cookies) {
      await session.cookies.set({
        url: "https://www.hug-ayumu.link",
        name: cookie.name,
        value: cookie.value,
        domain: "www.hug-ayumu.link",
        path: cookie.path,
        secure: cookie.secure,
        httpOnly: cookie.httpOnly,
      });
    }

    // ✅ ログイン後にHugの画面をElectronに読み込む
    mainWindow.loadURL("https://www.hug-ayumu.link/hug/wm/");

    return { success: true };
  } catch (err) {
    console.error("ログイン処理失敗:", err);
    return { success: false, error: err.message };
  }
});

// main.js
// 既存のhug-login処理に加えて
ipcMain.handle("do-auto-login", async (event, { username, password }) => {
  // puppeteer不要ならここでそのままwebviewに注入させる
  mainWindow.webContents.send("inject-login", { username, password });
  return { success: true };
});

// main.js
const apiClient = require("./src/apiClient.js");


// main.js
ipcMain.handle("GetChildrenByStaffAndDay", async (event, args) => {
  const { staffId, date } = args;
  console.log("📡 GetChildrenByStaffAndDay 呼び出し:", { staffId, date });

  try {
    // callProcedure 側は POSTボディを配列で受け取る
    const result = await apiClient.callProcedure("GetChildrenByStaffAndDay", [
      { name: "staff_id", value: Number(staffId) },
      { name: "weekday", value: date },
    ]);

    console.log("📬 DB応答:", result);
    return result;
  } catch (err) {
    console.error("❌ API 呼び出し失敗:", err.response?.data || err.message);
    throw err;
  }
});





// 開発時は __dirname（現在のフォルダ）
// ビルド後は process.resourcesPath に切り替わる
function getDataPath(...paths) {
  const base = app.isPackaged ? process.resourcesPath : __dirname;
  return path.join(base, "data", ...paths);
}


// ✅ レンダラーからファイルを読み取るIPC
ipcMain.handle("read-config", async () => {
  try {
    const filePath = getDataPath("config.json");
    const jsonData = JSON.parse(fs.readFileSync(filePath, "utf8"));
    return { success: true, data: jsonData };
  } catch (err) {
    console.error("❌ config.json 読み込み失敗:", err);
    return { success: false, error: err.message };
  }
});
