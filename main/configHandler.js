// main/configHandler.js
const fs = require("fs");
const path = require("path");
const { app, dialog } = require("electron");
const { getDataPath } = require("./util");

function handleConfigAccess(ipcMain) {
  ipcMain.handle("read-config", async () => {
    try {
      const filePath = getDataPath("config.json");
      const jsonData = JSON.parse(fs.readFileSync(filePath, "utf8"));
      return { success: true, data: jsonData };
    } catch (err) {
      console.error("❌ config読み込み失敗:", err);
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle("import-config-file", async () => {
    try {
      const { canceled, filePaths } = await dialog.showOpenDialog({
        title: "設定ファイルを選択してください (config.json)",
        filters: [{ name: "JSONファイル", extensions: ["json"] }],
        properties: ["openFile"],
      });

      if (canceled || filePaths.length === 0) return { success: false };

      const selectedFile = filePaths[0];
      const destDir = getDataPath();
      const destPath = path.join(destDir, "config.json");

      if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
      fs.copyFileSync(selectedFile, destPath);

      console.log("✅ config.json をコピー:", destPath);
      return { success: true, destination: destPath };
    } catch (err) {
      console.error("❌ 設定コピー失敗:", err);
      return { success: false, message: err.message };
    }
  });
}

module.exports = { handleConfigAccess };
