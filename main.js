const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const puppeteer = require("puppeteer");

async function loginAndNavigate() {
  const browser = await puppeteer.launch({ headless: false }); // ← false でブラウザが見える
  const page = await browser.newPage();

  await page.goto("https://www.hug-ayumu.link/hug/wm/");

  // ログイン処理（セレクタは実際のフォームに合わせて修正）
  await page.type("input[name=email]", "your@email.com");
  await page.type("input[name=password]", "yourPassword");
  await page.click("button[type=submit]");

  await page.waitForNavigation();

  // 遷移先ページ
  await page.goto("https://www.hug-ayumu.link/hug/wm/attendance.php?mode=detail&f_id=3&date=2025-10-03");

  const html = await page.content();
  await browser.close();

  return html;
}

// レンダラーから呼び出せるようにする
ipcMain.handle("fetch-hug", async () => {
  return await loginAndNavigate();
});

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  win.loadFile("index.html");
}

app.whenReady().then(createWindow);
