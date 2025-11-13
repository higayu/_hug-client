// main/parts/planWindows.js
const { BrowserWindow } = require("electron");
const path = require("path");

let isRegistered = false; // ✅ 二重登録防止フラグ

function registerPlanWindows(ipcMain) {
  if (isRegistered) return; // ← 2回目以降は無視
  isRegistered = true;

  // 専門的支援計画
  ipcMain.on("open-specialized-support-plan", (event, childId) => {
    openPlanWindow(
      "https://www.hug-ayumu.link/hug/wm/addition_plan.php",
      childId,
      "専門的支援計画"
    );
  });

  // 個別支援計画
  ipcMain.on("open-individual-support-plan", (event, childId) => {
    openPlanWindow(
      "https://www.hug-ayumu.link/hug/wm/individual_care-plan-main.php",
      childId,
      "個別支援計画"
    );
  });

  ipcMain.on("Open_NowDayPage", (event, { facilityId, dateStr }) => {
    openSimpleWindow(facilityId, dateStr, "今日の利用者");
  });
}

function openPlanWindow(url, childId, label) {
  const win = new BrowserWindow({
    width: 1200,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, "../../preload.js"),
    },
  });

  win.loadURL(url);

  // 🔍 子ウィンドウのログをメインコンソールでも見られるようにする
  win.webContents.on("console-message", (event, level, message) => {
    console.log(`${message}`);
  });

  win.webContents.once("did-finish-load", () => {
    console.log(`did-finish-load`);

    // 🕒 DOM生成の遅延対策
    setTimeout(() => {
      win.webContents.executeJavaScript(`
        try {
        
          const select = document.querySelector('#name_list');
          if (!select) throw new Error("#name_list not found");
          select.value = "${childId}";
          select.dispatchEvent(new Event("change", { bubbles: true }));

          setTimeout(() => {
            const btn = document.querySelector('button.btn.btn-sm.search');
            if (!btn) throw new Error("search button not found");
            if (btn.disabled) throw new Error("search button is disabled");
            btn.click();
          }, 1500);

        } catch (e) {
          console.error("error:", e);
        }
      `);
    }, 2000); // ← DOM構築待ち
  });
}

/**
 * Hug「今日の利用者」ページなどを別ウィンドウで開く関数
 * @param {string} FACILITY_ID - 施設ID
 * @param {string} DATE_STR - 日付（YYYY-MM-DD）
 * @param {string} label - ウィンドウのラベル（任意）
 */
function openSimpleWindow(FACILITY_ID, DATE_STR, label = "今日の利用者") {
  const url = `https://www.hug-ayumu.link/hug/wm/attendance.php?mode=detail&f_id=${FACILITY_ID}&date=${DATE_STR}`;

  const win = new BrowserWindow({
    width: 1200,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, "../../preload.js"),
    },
  });

  win.loadURL(url);

  // 子ウィンドウの console.log をメイン側にも表示
  win.webContents.on("console-message", (event, level, message) => {
    console.log(`${message}`);
  });

  win.webContents.once("did-finish-load", () => {
    console.log(`did-finish-load`);
  });
}

module.exports = { registerPlanWindows };
