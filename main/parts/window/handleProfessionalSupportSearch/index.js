// main/parts/window/handleProfessionalSupportSearch/index.js
// 加算比較用ウインドウ
// main/parts/window/handleProfessionalSupportSearch/index.js
// 加算比較用ウインドウ
const fs = require("fs");
const path = require("path");
const { createDoubleWebviewWindow } = require("./windowManager");

let isRegistered = false;

function handleProfessionalSupportSearch(ipcMain, defaultFacilityId, defaultDateStr) {
  if (isRegistered) return;
  isRegistered = true;

  ipcMain.on("handle-professional-support-search", (event, args = {}) => {
    const receivedFacilityId = args.facility_id ?? defaultFacilityId;
    const receivedDateStr = args.date_str ?? defaultDateStr;
    const targetFacility = args.targetFacility;

    // --- 安全チェック ---
    if (!targetFacility || typeof targetFacility !== "object") {
      console.error("❌ targetFacility が不正です:", targetFacility);
      return;
    }

    console.log("✅ Select targetFacility", targetFacility);

    try {
      const url1 =
        `https://www.hug-ayumu.link/hug/wm/attendance.php` +
        `?mode=detail&f_id=${receivedFacilityId}&date=${receivedDateStr}`;

      const url2 =
        "https://www.hug-ayumu.link/hug/wm/record_proceedings.php";

      openDoubleWebviewWithTabs(
        url1,
        url2,
        "HUGデータ取得",
        targetFacility,     // ← ★ここが重要
        receivedDateStr
      );
    } catch (error) {
      console.error("❌ [MAIN] ダブルWebViewウィンドウの作成に失敗:", error);
    }
  });
}

function openDoubleWebviewWithTabs(
  url1,
  url2,
  label,
  targetFacility,
  dateStr
) {
  const templatePath = path.join(
    __dirname,
    "templates",
    "ProfessionalSupport.html"
  );

  const htmlTemplate = fs.readFileSync(templatePath, "utf8");

  return createDoubleWebviewWindow(
    url1,
    url2,
    label,
    htmlTemplate,
    targetFacility,   // ← object を渡す
    dateStr
  );
}

module.exports = { handleProfessionalSupportSearch };
