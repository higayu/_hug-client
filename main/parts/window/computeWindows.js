// main/parts/computeWindows.js
const fs = require("fs");
const path = require("path");
const { createDoubleWebviewWindow } = require("./windowManager");

let isRegistered = false;

function open_addition_compare_btn(ipcMain, facility_id, date_str) {
  if (isRegistered) {
    return;
  }
  isRegistered = true;

  // IPCハンドラーを登録
  ipcMain.on("open-addition-compare-btn", (event, args) => {
    const received_facility_id = args?.facility_id || facility_id;
    const received_date_str = args?.date_str || date_str;

    try {
      openDoubleWebviewWithTabs(
        `https://www.hug-ayumu.link/hug/wm/attendance.php?mode=detail&f_id=${received_facility_id}&date=${received_date_str}`,
        "https://www.hug-ayumu.link/hug/wm/record_proceedings.php",
        "HUGデータ取得",
        received_facility_id,
        received_date_str
      );
    } catch (error) {
      console.error("❌ [MAIN] ダブルWebViewウィンドウの作成に失敗:", error);
    }
  });

  // デバッグ用：IPCイベントの監視
  const originalOn = ipcMain.on;
  ipcMain.on = function(channel, listener) {
    return originalOn.call(this, channel, listener);
  };
}

function openDoubleWebviewWithTabs(url1, url2, label, facilityId, dateStr) {
  
  // HTMLテンプレートを読み込み
  const templatePath = path.join(__dirname, "..", "templates", "doubleWebviewTemplate.html");
  const htmlTemplate = fs.readFileSync(templatePath, "utf8");
  
  // ウィンドウを作成
  const win = createDoubleWebviewWindow(url1, url2, label, htmlTemplate, facilityId, dateStr);
  
  return win;
}

module.exports = { open_addition_compare_btn };
