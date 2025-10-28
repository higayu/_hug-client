// main/parts/handlers/customButtonsHandler.js
const fs = require("fs");
const path = require("path");
const { app } = require("electron");
const { getDataPath } = require("../utils/util");

function resolveCustomButtonsPath() {
  if (app.isPackaged) {
    // ✅ ビルド後: ユーザーディレクトリ/data/customButtons.json
    return path.join(app.getPath("userData"), "data", "customButtons.json");
  } else {
    // ✅ 開発時: プロジェクト直下の main/data/customButtons.json
    return path.join(__dirname, "..", "..", "data", "customButtons.json");
  }
}

function resolveAvailableActionsPath() {
  if (app.isPackaged) {
    // ✅ ビルド後: ユーザーディレクトリ/data/availableActions.json
    return path.join(app.getPath("userData"), "data", "availableActions.json");
  } else {
    // ✅ 開発時: プロジェクト直下の main/data/availableActions.json
    return path.join(__dirname, "..", "..", "data", "availableActions.json");
  }
}

function handleCustomButtonsAccess(ipcMain) {
  // customButtons.json読み込み
  ipcMain.handle("read-custom-buttons", async () => {
    try {
      const filePath = resolveCustomButtonsPath();
      
      // customButtons.jsonが存在しない場合は自動生成
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
              order: 1
            }
          ]
        };
        
        // ディレクトリが存在しない場合は作成
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        
        fs.writeFileSync(filePath, JSON.stringify(defaultCustomButtons, null, 2));
        console.log("🆕 新しいcustomButtons.jsonを作成しました:", filePath);
        return { success: true, data: defaultCustomButtons };
      }
      
      const jsonData = JSON.parse(fs.readFileSync(filePath, "utf8"));
      return { success: true, data: jsonData };
    } catch (err) {
      console.error("❌ customButtons.json読み込み失敗:", err);
      return { success: false, error: err.message };
    }
  });

  // customButtons.json保存
  ipcMain.handle("save-custom-buttons", async (event, data) => {
    try {
      const filePath = resolveCustomButtonsPath();
      
      // ディレクトリが存在しない場合は作成
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      const jsonString = JSON.stringify(data, null, 2);
      fs.writeFileSync(filePath, jsonString, "utf8");
      console.log("✅ customButtons.json保存成功:", filePath);
      return { success: true };
    } catch (err) {
      console.error("❌ customButtons.json保存失敗:", err);
      return { success: false, error: err.message };
    }
  });

  // availableActions.json読み込み
  ipcMain.handle("read-available-actions", async () => {
    try {
      const filePath = resolveAvailableActionsPath();
      
      // availableActions.jsonが存在しない場合は自動生成
      if (!fs.existsSync(filePath)) {
        const defaultAvailableActions = {
          version: "1.0.0",
          availableActions: [
            {
              id: "additionCompare",
              name: "加算比較",
              description: "加算登録の比較機能を実行します",
              category: "比較機能",
              icon: "📊"
            },
            {
              id: "customAction1",
              name: "カスタムアクション1",
              description: "カスタムアクション1を実行します",
              category: "カスタム",
              icon: "🔧"
            }
          ]
        };
        
        // ディレクトリが存在しない場合は作成
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        
        fs.writeFileSync(filePath, JSON.stringify(defaultAvailableActions, null, 2));
        console.log("🆕 新しいavailableActions.jsonを作成しました:", filePath);
        return { success: true, data: defaultAvailableActions };
      }
      
      const jsonData = JSON.parse(fs.readFileSync(filePath, "utf8"));
      return { success: true, data: jsonData };
    } catch (err) {
      console.error("❌ availableActions.json読み込み失敗:", err);
      return { success: false, error: err.message };
    }
  });
}

module.exports = { handleCustomButtonsAccess };
