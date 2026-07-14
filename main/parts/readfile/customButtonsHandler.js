// main/parts/readfile/customButtonsHandler.js
const fs = require("fs");
const path = require("path");
const { getCustomButtonsPath } = require("../utils/pathResolver");

function handleCustomButtonsAccess(ipcMain) {
  // ============================================================
  // 🟦 customButtons.json 読み込み
  // ============================================================
  ipcMain.handle("read-custom-buttons", async () => {
    try {
      const filePath = getCustomButtonsPath();

      if (!fs.existsSync(filePath)) {
        // デフォルトのカスタムボタン設定（featuresを統合）
        const defaultCustomButtons = {
          version: "1.0.0",
          customButtons: [
            {
              id: "individualSupportPlan",
              enabled: true,
              text: "個別支援計画",
              color: "#007bff",
              action: "individualSupportPlan",
              order: 1,
              category: "支援計画"
            },
            {
              id: "specializedSupportPlan",
              enabled: true,
              text: "専門的支援計画",
              color: "#28a745",
              action: "specializedSupportPlan",
              order: 2,
              category: "支援計画"
            },
            {
              id: "importSetting",
              enabled: false,
              text: "設定ファイル取得",
              color: "#6c757d",
              action: "importSetting",
              order: 3,
              category: "設定"
            },
            {
              id: "getUrl",
              enabled: false,
              text: "URL取得",
              color: "#17a2b8",
              action: "getUrl",
              order: 4,
              category: "ユーティリティ"
            },
            {
              id: "loadIni",
              enabled: true,
              text: "設定の再読み込み",
              color: "#e5d7fe",
              action: "loadIni",
              order: 5,
              category: "設定"
            }
          ]
        };

        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(filePath, JSON.stringify(defaultCustomButtons, null, 2));
  
        return { success: true, data: defaultCustomButtons };
      }

      const jsonData = JSON.parse(fs.readFileSync(filePath, "utf8"));
      return { success: true, data: jsonData };
    } catch (err) {
      console.error("❌ customButtons.json 読み込み失敗:", err);
      return { success: false, error: err.message };
    }
  });

  // ============================================================
  // 🟨 customButtons.json 保存
  // ============================================================
  ipcMain.handle("save-custom-buttons", async (event, data) => {
    try {
      const filePath = getCustomButtonsPath();
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
  
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });
}

module.exports = { handleCustomButtonsAccess };