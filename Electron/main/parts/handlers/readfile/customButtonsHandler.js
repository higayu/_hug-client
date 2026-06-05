// main/parts/handlers/readfile/customButtonsHandler.js
const fs = require("fs");
const path = require("path");
const { getCustomButtonsPath, getAvailableActionsPath } = require("../../utils/pathResolver");

function handleCustomButtonsAccess(ipcMain) {
  // ============================================================
  // 🟦 customButtons.json 読み込み
  // ============================================================
  ipcMain.handle("read-custom-buttons", async () => {
    try {
      const filePath = getCustomButtonsPath();

      if (!fs.existsSync(filePath)) {
        const defaultCustomButtons = {
          version: "1.0.0",
          customButtons: [
            {
              id: "addition-compare-btn",
              enabled: true,
              text: "加算の比較",
              color: "#f9d4fc",
              action: "additionCompare",
              order: 1,
            },
          ],
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

  // ============================================================
  // 🟩 availableActions.json 読み込み
  // ============================================================
  ipcMain.handle("read-available-actions", async () => {
    try {
      const filePath = getAvailableActionsPath();

      if (!fs.existsSync(filePath)) {
        const defaultAvailableActions = {
          version: "1.0.0",
          availableActions: [
            {
              id: "additionCompare",
              name: "加算比較",
              description: "加算登録の比較機能を実行します",
              category: "比較機能",
              icon: "📊",
            },
            {
              id: "customAction1",
              name: "キャンセル待ちの登録",
              description: "キャンセル待ちの登録を実行します",
              category: "カスタム",
              icon: "🔧",
            },
          ],
        };

        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(filePath, JSON.stringify(defaultAvailableActions, null, 2));
        return { success: true, data: defaultAvailableActions };
      }

      const jsonData = JSON.parse(fs.readFileSync(filePath, "utf8"));
      return { success: true, data: jsonData };
    } catch (err) {
      console.error("❌ availableActions.json 読み込み失敗:", err);
      return { success: false, error: err.message };
    }
  });
}

module.exports = { handleCustomButtonsAccess };
