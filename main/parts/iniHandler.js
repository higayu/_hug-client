// main/parts/iniHandler.js
const fs = require("fs");
const path = require("path");
const { app, dialog } = require("electron");
const { getDataPath } = require("./util");

function resolveConfigPath() {
  if (app.isPackaged) {
    // ✅ ビルド後: ユーザーディレクトリ/data/ini.json
    return path.join(app.getPath("userData"), "data", "ini.json");
  } else {
    // ✅ 開発時: プロジェクト直下の data/ini.json
    return path.join(__dirname, "../../data/ini.json");
  }
}

function handleIniAccess(ipcMain) {
  // ini.json読み込み
  ipcMain.handle("read-ini", async () => {
    try {
      const filePath = resolveConfigPath();
      
      // ini.jsonが存在しない場合は自動生成
      if (!fs.existsSync(filePath)) {
        const defaultIni = {
          version: "1.0.0",
          appSettings: {
            autoLogin: {
              enabled: true,
              username: "",
              password: ""
            },
            ui: {
              theme: "light",
              language: "ja",
              showCloseButtons: true,
              autoRefresh: {
                enabled: false,
                interval: 30000
              }
            },
            features: {
              individualSupportPlan: {
                enabled: true,
                buttonText: "個別支援計画",
                buttonColor: "#007bff"
              },
              specializedSupportPlan: {
                enabled: true,
                buttonText: "専門的支援計画",
                buttonColor: "#28a745"
              },
              additionCompare: {
                enabled: true,
                buttonText: "加算比較",
                buttonColor: "#ffc107"
              },
              importSetting: {
                enabled: false,
                buttonText: "設定ファイル取得",
                buttonColor: "#6c757d"
              },
              getUrl: {
                enabled: true,
                buttonText: "URL取得",
                buttonColor: "#17a2b8"
              },
              loadIni: {
                enabled: true,
                buttonText: "設定の再読み込み",
                buttonColor: "#6f42c1"
              }
            },
            customButtons: [
              {
                id: "custom1",
                enabled: true,
                text: "カスタムボタン1",
                color: "#dc3545",
                action: "customAction1",
                position: "top"
              },
              {
                id: "custom2",
                enabled: false,
                text: "カスタムボタン2",
                color: "#6f42c1",
                action: "customAction2",
                position: "bottom"
              }
            ],
            window: {
              width: 1200,
              height: 800,
              minWidth: 800,
              minHeight: 600,
              maximized: false,
              alwaysOnTop: false
            },
            notifications: {
              enabled: true,
              sound: true,
              desktop: true
            }
          },
          userPreferences: {
            lastLoginDate: "",
            rememberWindowState: true,
            showWelcomeMessage: true
          }
        };
        
        // ディレクトリが存在しない場合は作成
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        
        fs.writeFileSync(filePath, JSON.stringify(defaultIni, null, 2));
        console.log("🆕 新しいini.jsonを作成しました:", filePath);
        return { success: true, data: defaultIni };
      }
      
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
      
      // ディレクトリが存在しない場合は作成
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
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
      
      // ディレクトリが存在しない場合は作成
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
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

  // import-config-file ハンドラーは configHandler.js で管理
}

module.exports = { handleIniAccess };
