// main/parts/window/planWindows.js
const { BrowserWindow } = require("electron");
const path = require("path");

let isRegistered = false;

function registerPlanWindows(ipcMain) {
  if (isRegistered) return;
  isRegistered = true;

  ipcMain.on("open-specialized-support-plan", (event, childId) => {
    openPlanWindow(
      "https://www.hug-ayumu.link/hug/wm/addition_plan.php",
      childId,
      "専門的支援計画"
    );
  });

  ipcMain.on("open-individual-support-plan", (event, childId) => {
    openPlanWindow(
      "https://www.hug-ayumu.link/hug/wm/individual_care-plan-main.php",
      childId,
      "個別支援計画"
    );
  });

  ipcMain.on("Open_NowDayPage", (event, { facilityId, dateStr }) => {
    openSimpleWindow(facilityId, dateStr, "当日の利用画面");
  });

  ipcMain.on("open-web-manager-page", (event, { url, title }) => {
    openExternalPageWindow(url, title || "Webページ");
  });
}

function createWindowOptions(title) {
  return {
    width: 1200,
    height: 900,
    title,
    webPreferences: {
      preload: path.join(__dirname, "../../preload.js"),
    },
  };
}

function attachConsoleLogging(win) {
  win.webContents.on("console-message", (event, level, message) => {
    console.log(`${message}`);
  });
}

function openPlanWindow(url, childId, label) {
  const win = new BrowserWindow(createWindowOptions(label));
  win.loadURL(url);
  attachConsoleLogging(win);

  win.webContents.once("did-finish-load", () => {
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
    }, 2000);
  });
}

function openSimpleWindow(facilityId, dateStr, label = "当日の利用画面") {
  const url = `https://www.hug-ayumu.link/hug/wm/attendance.php?mode=detail&f_id=${facilityId}&date=${dateStr}`;
  const win = new BrowserWindow(createWindowOptions(label));
  win.loadURL(url);
  attachConsoleLogging(win);
}

function openExternalPageWindow(url, title = "Webページ") {
  if (!url) {
    console.error("[openExternalPageWindow] url is required");
    return;
  }

  const win = new BrowserWindow(createWindowOptions(title));
  win.loadURL(url);
  attachConsoleLogging(win);
}

module.exports = { registerPlanWindows };
