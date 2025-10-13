// main/parts/computeWindows.js
const { BrowserWindow } = require("electron");
const path = require("path");

function open_test_double_get(ipcMain) {
  // 2ページのデータ取得
  ipcMain.on("open-test-double-get", (event, childId) => {
    openPlanWindow(
      "https://www.hug-ayumu.link/hug/wm/addition_plan.php",
      childId,
      "test取得"
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
}

function openPlanWindow(url, childId, label) {
  const win = new BrowserWindow({
    width: 1200,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, "../../preload.js"),
    },
  });

  console.log(`🆕 ${label}ウィンドウを開きます:`, childId);
  win.loadURL(url);

  // 🔍 子ウィンドウのログをメインコンソールでも見られるようにする
  win.webContents.on("console-message", (event, level, message) => {
    console.log(`🧭 [${label}] ${message}`);
  });

  win.webContents.once("did-finish-load", () => {
    console.log(`✅ did-finish-load（${label}）`);

    // 🕒 DOM生成の遅延対策
    setTimeout(() => {
      win.webContents.executeJavaScript(`
        try {
          console.log("🚀 ${label} ページ自動処理開始");

          const select = document.querySelector('#name_list');
          if (!select) throw new Error("#name_list not found");
          select.value = "${childId}";
          select.dispatchEvent(new Event("change", { bubbles: true }));
          console.log("✅ #name_list に設定:", select.value);

          setTimeout(() => {
            const btn = document.querySelector('button.btn.btn-sm.search');
            if (!btn) throw new Error("search button not found");
            if (btn.disabled) throw new Error("search button is disabled");
            btn.click();
            console.log("✅ 検索ボタンをクリックしました");
          }, 1500);

        } catch (e) {
          console.error("❌ executeJavaScript failed:", e);
        }
      `);
    }, 2000); // ← DOM構築待ち
  });
}

module.exports = { open_test_double_get };
