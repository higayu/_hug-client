const { app, BrowserWindow, ipcMain } = require("electron");
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

// ✅ 環境変数をレンダラーに渡すIPC
ipcMain.handle("get-env", () => {
  return {
    username: process.env.HUG_USERNAME,
    password: process.env.HUG_PASSWORD,
    apiBaseUrl: process.env.VITE_API_BASE_URL,   // ← 追加
  };
});

// main.js
const apiClient = require("./src/apiClient.js");

// 追加: IPC 経由で fetchStaff を呼ぶ
ipcMain.handle("fetch-staff", async () => {
  console.log("📥 fetch-staff IPC 呼ばれた");
  try {
    const staff = await apiClient.fetchStaff();
    console.log("📤 fetch-staff 成功:", staff);
    return staff;
  } catch (err) {
    console.error("❌ fetchStaff 失敗:", err);
    throw err;
  }
});


