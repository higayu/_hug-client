const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { loginHug } = require("./puppeteer/login.js");

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"), // ipcRenderer用
    },
  });

  mainWindow.loadFile("renderer/index.html");
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



