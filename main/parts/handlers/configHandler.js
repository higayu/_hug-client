// main/parts/configHandler.js
const fs = require("fs");
const path = require("path");
const { app, dialog, shell } = require("electron");
const { getDataDir, getConfigPath } = require("../utils/pathResolver");

function handleConfigAccess(ipcMain) {
  ipcMain.handle("read-config", async () => {
    try {
      const filePath = getConfigPath();

      if (!fs.existsSync(filePath)) {
        const defaultConfig = {
          HUG_USERNAME: "",
          HUG_PASSWORD: "",
          GEMINI_API_KEY: "",
        };

        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

        fs.writeFileSync(filePath, JSON.stringify(defaultConfig, null, 2));
        return { success: true, data: defaultConfig };
      }

      const jsonData = JSON.parse(fs.readFileSync(filePath, "utf8"));
      return { success: true, data: jsonData };
    } catch (err) {
      console.error("❌ config読み込み失敗:", err);
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle("save-config", async (event, data) => {
    try {
      if (!data || typeof data !== "object") {
        console.error("❌ config.json保存失敗: データが無効です", data);
        return { success: false, error: "データが無効です。" };
      }

      const filePath = getConfigPath();
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
   
      return { success: true };
    } catch (err) {
      console.error("❌ config.json保存失敗:", err);
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle("import-config-file", async () => {
    try {
      const { canceled, filePaths } = await dialog.showOpenDialog({
        title: "設定ファイルを選択してください (config.json または ini.json)",
        filters: [{ name: "JSONファイル", extensions: ["json"] }],
        properties: ["openFile"],
      });

      if (canceled || filePaths.length === 0) return { success: false };

      const selectedFile = filePaths[0];
      const fileName = path.basename(selectedFile);
      const destDir = getDataDir();
      const destPath = path.join(destDir, fileName);

      if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
      fs.copyFileSync(selectedFile, destPath);

      return { success: true, destination: destPath, fileName };
    } catch (err) {
      return { success: false, message: err.message };
    }
  });

  ipcMain.handle("open-config-folder", async () => {
    try {
      const configDir = getDataDir();
      if (!fs.existsSync(configDir)) fs.mkdirSync(configDir, { recursive: true });
      await shell.openPath(configDir);
      return { success: true, path: configDir };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });
}

module.exports = { handleConfigAccess };
