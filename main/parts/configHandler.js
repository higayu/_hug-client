// main/parts/configHandler.js
const fs = require("fs");
const path = require("path");
const { app, dialog } = require("electron");
const { getDataPath } = require("./util");

function resolveConfigPath() {
  if (app.isPackaged) {
    // ✅ ビルド後: resources/data/config.json
    return path.join(process.resourcesPath, "data", "config.json");
  } else {
    // ✅ 開発時: プロジェクト直下の data/config.json
    return path.join(__dirname, "../../data/config.json");
  }
}

function handleConfigAccess(ipcMain) {
  ipcMain.handle("read-config", async () => {
    try {
      const filePath = resolveConfigPath();
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

      const destDir = app.isPackaged
        ? path.join(process.resourcesPath, "data")
        : path.join(__dirname, "../../data");

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
