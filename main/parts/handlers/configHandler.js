// main/parts/configHandler.js
const fs = require("fs");
const path = require("path");
const { app, dialog, shell } = require("electron");
const { getDataPath } = require("../utils/util");

function resolveConfigPath() {
  if (app.isPackaged) {
    // ✅ ビルド後: ユーザーディレクトリ/data/config.json
    return path.join(app.getPath("userData"), "data", "config.json");
  } else {
    // ✅ 開発時: プロジェクト直下の data/config.json
    return path.join(__dirname, "../../data/config.json");
  }
}

function handleConfigAccess(ipcMain) {
  ipcMain.handle("read-config", async () => {
    try {
      const filePath = resolveConfigPath();
      
      // config.jsonが存在しない場合は自動生成
      if (!fs.existsSync(filePath)) {
        const defaultConfig = {
          HUG_USERNAME: "",
          HUG_PASSWORD: ""
        };
        
        // ディレクトリが存在しない場合は作成
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        
        fs.writeFileSync(filePath, JSON.stringify(defaultConfig, null, 2));
        console.log("🆕 新しい設定ファイルを作成しました:", filePath);
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
      // データのバリデーション
      if (!data || typeof data !== 'object') {
        console.error("❌ config.json保存失敗: データが無効です", data);
        return { success: false, error: "データが無効です。dataはオブジェクトである必要があります。" };
      }
      
      const filePath = resolveConfigPath();
      
      // ディレクトリが存在しない場合は作成
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      const jsonString = JSON.stringify(data, null, 2);
      fs.writeFileSync(filePath, jsonString, "utf8");
      console.log("✅ config.json保存成功:", filePath);
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

      const destDir = app.isPackaged
        ? path.join(app.getPath("userData"), "data")
        : path.join(__dirname, "../../data");

      // ファイル名に基づいて適切なパスを設定
      const destPath = path.join(destDir, fileName);

      if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
      fs.copyFileSync(selectedFile, destPath);

      console.log(`✅ ${fileName} をコピー:`, destPath);
      return { success: true, destination: destPath, fileName: fileName };
    } catch (err) {
      console.error("❌ 設定コピー失敗:", err);
      return { success: false, message: err.message };
    }
  });

  // 設定フォルダーを開く
  ipcMain.handle("open-config-folder", async () => {
    try {
      const configDir = app.isPackaged
        ? path.join(app.getPath("userData"), "data")
        : path.join(__dirname, "../../data");
      
      // ディレクトリが存在しない場合は作成
      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
      }
      
      // フォルダーを開く
      await shell.openPath(configDir);
      console.log("✅ 設定フォルダーを開きました:", configDir);
      return { success: true, path: configDir };
    } catch (err) {
      console.error("❌ 設定フォルダーを開く失敗:", err);
      return { success: false, error: err.message };
    }
  });
}

module.exports = { handleConfigAccess };
