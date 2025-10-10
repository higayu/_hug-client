// main.js

const { app, BrowserWindow, ipcMain, dialog } = require("electron");
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


ipcMain.on("open-specialized-support-plan", (event, childId) => {
      console.log("🆕 専門的支援計画を別ウインドウで開きます:", childId);

      const childWin = new BrowserWindow({
        width: 1200,
        height: 900,
        webPreferences: {
          preload: path.join(__dirname, "preload.js"), // あなたの構成に合わせて
        },
      });

      childWin.loadURL("https://www.hug-ayumu.link/hug/wm/addition_plan.php");

      // ✅ 「一度だけ」実行
      childWin.webContents.once("did-finish-load", () => {
        console.log("✅ did-finish-load（初回）発火");

        childWin.webContents.executeJavaScript(`
          console.log("✅ 専門的支援計画ページを読み込みました");

          const selectChild2 = document.querySelector('#name_list');
          if (selectChild2) {
            selectChild2.value = "${childId}";
            selectChild2.dispatchEvent(new Event("change", { bubbles: true }));
            console.log("✅ #name_list に設定:", selectChild2.value);
          } else {
            console.warn("⚠️ #name_list が見つかりません");
          }

          setTimeout(() => {
            const searchButton = document.querySelector('button.btn.btn-sm.search[type="submit"]');
            if (searchButton && !searchButton.disabled) {
              searchButton.click();
              console.log("✅ 検索ボタンをクリックしました");
            } else {
              console.warn("⚠️ 検索ボタンが無効または見つかりません");
            }
          }, 1500);
        `);
      });
});


// 🧠 個別支援計画ページを別ウインドウで開く
ipcMain.on("open-individual-support-plan", (event, childId) => {
  console.log("🆕 個別支援計画ページを別ウインドウで開きます:", childId);

  const childWin = new BrowserWindow({
    width: 1200,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  childWin.loadURL("https://www.hug-ayumu.link/hug/wm/individual_care-plan-main.php");

  // ✅ 「一度だけ」実行（リロード時は再実行しない）
  childWin.webContents.once("did-finish-load", () => {
    console.log("✅ did-finish-load（初回）発火 - 個別支援計画");

    childWin.webContents.executeJavaScript(`
      console.log("🚀 個別支援計画ページ 自動処理開始");

      const childSelect = document.querySelector('#name_list');
      if (childSelect) {
        const targetValue = "${childId}";
        const optionExists = [...childSelect.options].some(opt => opt.value === targetValue);

        if (optionExists) {
          childSelect.value = targetValue;
          childSelect.dispatchEvent(new Event("change", { bubbles: true }));
          console.log("✅ 子ども選択完了:", targetValue);
        } else {
          console.warn("⚠️ 指定された子どもIDがリストに見つかりません:", targetValue);
        }
      } else {
        console.error("❌ #name_list が見つかりません");
      }

      // 少し待って検索ボタンをクリック
      setTimeout(() => {
        const searchButton = document.querySelector('button.btn.btn-sm.search');
        if (searchButton && !searchButton.disabled) {
          searchButton.click();
          console.log("✅ 検索ボタンをクリックしました");
        } else {
          console.warn("⚠️ 検索ボタンが見つからないか無効です");
        }
      }, 1500);
    `);
  });
});



// 設定ファイルのインポート
ipcMain.handle("import-config-file", async () => {
  try {
    // ① ファイル選択ダイアログ
    const { canceled, filePaths } = await dialog.showOpenDialog({
      title: "設定ファイルを選択してください (config.json)",
      filters: [{ name: "JSONファイル", extensions: ["json"] }],
      properties: ["openFile"],
    });

    if (canceled || filePaths.length === 0) {
      console.log("⚠️ ファイル選択がキャンセルされました");
      return { success: false, message: "キャンセルされました" };
    }

    const selectedFile = filePaths[0];
    const isDev = !app.isPackaged;

    let destDir, destPath;

    if (isDev) {
      // 🚧 開発環境（main.jsがプロジェクト直下）
      destDir = path.join(__dirname, "data");
      destPath = path.join(destDir, "config.json");

      // dataフォルダがなければ作成
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
        console.log("📁 data フォルダを作成:", destDir);
      }

      fs.copyFileSync(selectedFile, destPath);
      console.log("✅ config.json を開発環境にコピー:", destPath);
    } else {
      // 🏁 ビルド後
      destDir = path.join(process.resourcesPath, "data");
      destPath = path.join(destDir, "config.json");

      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
        console.log("📁 data フォルダを作成:", destDir);
      }

      fs.copyFileSync(selectedFile, destPath);
      console.log("✅ config.json をビルド環境にコピー:", destPath);
    }

    // shell.showItemInFolder(destPath); // ← コピー後にフォルダを開く場合
    return { success: true, destination: destPath };
  } catch (err) {
    console.error("❌ 設定ファイルコピー失敗:", err);
    return { success: false, message: err.message };
  }
});


