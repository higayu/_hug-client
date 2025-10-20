// main/parts/iniHandler.js
const fs = require("fs");
const path = require("path");
const { app, dialog } = require("electron");
const { getDataPath } = require("./util");

function resolveConfigPath() {
  if (app.isPackaged) {
    // ✅ ビルド後: resources/data/config.json
    return path.join(process.resourcesPath, "data", "ini.json");
  } else {
    // ✅ 開発時: プロジェクト直下の data/config.json
    return path.join(__dirname, "../../data/ini.json");
  }
}

function handleIniAccess(ipcMain) {
  // ini.json読み込み
  ipcMain.handle("read-ini", async () => {
    try {
      const filePath = resolveConfigPath();
      const jsonData = JSON.parse(fs.readFileSync(filePath, "utf8"));
      return { success: true, data: jsonData };
    } catch (err) {
      console.error("❌ ini.json読み込み失敗:", err);
      return { success: false, error: err.message };
    }
  });

  // ini.json保存
  ipcMain.handle("save-ini", async (event, data) => {
    try {
      const filePath = resolveConfigPath();
      const jsonString = JSON.stringify(data, null, 2);
      fs.writeFileSync(filePath, jsonString, "utf8");
      console.log("✅ ini.json保存成功:", filePath);
      return { success: true };
    } catch (err) {
      console.error("❌ ini.json保存失敗:", err);
      return { success: false, error: err.message };
    }
  });

  // 設定項目の更新
  ipcMain.handle("update-ini-setting", async (event, path, value) => {
    try {
      const filePath = resolveConfigPath();
      let data = {};
      
      // ファイルが存在する場合は読み込み
      if (fs.existsSync(filePath)) {
        data = JSON.parse(fs.readFileSync(filePath, "utf8"));
      }
      
      // パスに基づいて値を設定
      const pathArray = path.split('.');
      let current = data;
      for (let i = 0; i < pathArray.length - 1; i++) {
        if (!current[pathArray[i]]) {
          current[pathArray[i]] = {};
        }
        current = current[pathArray[i]];
      }
      current[pathArray[pathArray.length - 1]] = value;
      
      // ファイルに保存
      const jsonString = JSON.stringify(data, null, 2);
      fs.writeFileSync(filePath, jsonString, "utf8");
      
      console.log(`✅ 設定更新成功: ${path} = ${JSON.stringify(value)}`);
      return { success: true, data: data };
    } catch (err) {
      console.error("❌ 設定更新失敗:", err);
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle("import-config-file", async () => {
    try {
      const { canceled, filePaths } = await dialog.showOpenDialog({
        title: "設定ファイルを選択してください (ini.json)",
        filters: [{ name: "JSONファイル", extensions: ["json"] }],
        properties: ["openFile"],
      });

      if (canceled || filePaths.length === 0) return { success: false };

      const selectedFile = filePaths[0];

      const destDir = app.isPackaged
        ? path.join(process.resourcesPath, "data")
        : path.join(__dirname, "../../data");

      const destPath = path.join(destDir, "ini.json");

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

module.exports = { handleIniAccess };
