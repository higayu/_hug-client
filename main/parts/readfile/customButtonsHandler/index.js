// main/parts/readfile/customButtonsHandler.js
const fs = require("fs");
const path = require("path");
const { getCustomButtonsPath } = require("../../utils/pathResolver");
const { DEFAULT_CUSTOM_BUTTONS } = require("./defaultCustomButtons");

function handleCustomButtonsAccess(ipcMain) {
  // ============================================================
  // 🟦 customButtons.json 読み込み
  // ============================================================
  ipcMain.handle("read-custom-buttons", async () => {
    try {
      const filePath = getCustomButtonsPath();

      if (!fs.existsSync(filePath)) {
        // デフォルトのカスタムボタン設定を使用
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(filePath, JSON.stringify(DEFAULT_CUSTOM_BUTTONS, null, 2));
  
        return { success: true, data: DEFAULT_CUSTOM_BUTTONS };
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