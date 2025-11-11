// main/parts/handlers/iniHandler.js
const fs = require("fs");
const path = require("path");
const { ipcMain } = require("electron");
const { getDataDir, getIniPath } = require("../utils/pathResolver");

// もし pathResolver.js に getIniPath() がまだない場合、以下を追加してください:
// function getIniPath() { return path.join(getDataDir(), "ini.json"); }

function handleIniAccess(ipcMain) {
  // ini.json 読み込み
  ipcMain.handle("read-ini", async () => {
    try {
      const filePath = getIniPath();

      // ini.json が存在しない場合は自動生成
      if (!fs.existsSync(filePath)) {
        const defaultIni = {
          version: "1.0.0",
          appSettings: {
            autoLogin: {
              enabled: true,
              username: "",
              password: "",
            },
            ui: {
              theme: "light",
              language: "ja",
              showCloseButtons: true,
              confirmOnClose: true,
              autoRefresh: {
                enabled: false,
                interval: 30000,
              },
            },
            features: {
              individualSupportPlan: {
                enabled: true,
                buttonText: "個別支援計画",
                buttonColor: "#007bff",
              },
              specializedSupportPlan: {
                enabled: true,
                buttonText: "専門的支援計画",
                buttonColor: "#28a745",
              },
              additionCompare: {
                enabled: true,
                buttonText: "加算比較",
                buttonColor: "#ffc107",
              },
              importSetting: {
                enabled: false,
                buttonText: "設定ファイル取得",
                buttonColor: "#6c757d",
              },
              getUrl: {
                enabled: true,
                buttonText: "URL取得",
                buttonColor: "#17a2b8",
              },
              loadIni: {
                enabled: true,
                buttonText: "設定の再読み込み",
                buttonColor: "#6f42c1",
              },
            },
            window: {
              width: 1200,
              height: 800,
              minWidth: 800,
              minHeight: 600,
              maximized: false,
              alwaysOnTop: false,
            },
            notifications: {
              enabled: true,
              sound: true,
              desktop: true,
            },
          },
          userPreferences: {
            lastLoginDate: "",
            rememberWindowState: true,
            showWelcomeMessage: true,
          },
          apiSettings: {
            baseURL: "http://192.168.1.229:3001/api",
            staffId: "",
            facilityId: "",
            databaseType: "mariadb",
          },
        };

        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(filePath, JSON.stringify(defaultIni, null, 2));
        console.log("🆕 新しい ini.json を作成しました:", filePath);
        return { success: true, data: defaultIni };
      }

      const jsonData = JSON.parse(fs.readFileSync(filePath, "utf8"));
      return { success: true, data: jsonData };
    } catch (err) {
      console.error("❌ ini.json 読み込み失敗:", err);
      return { success: false, error: err.message };
    }
  });

  // ini.json 保存
  ipcMain.handle("save-ini", async (event, data) => {
    try {
      const filePath = getIniPath();

      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

      const jsonString = JSON.stringify(data, null, 2);
      fs.writeFileSync(filePath, jsonString, "utf8");
      console.log("✅ ini.json 保存成功:", filePath);
      return { success: true };
    } catch (err) {
      console.error("❌ ini.json 保存失敗:", err);
      return { success: false, error: err.message };
    }
  });

  // ini.json の特定設定項目を更新
  ipcMain.handle("update-ini-setting", async (event, settingPath, value) => {
    try {
      const filePath = getIniPath();

      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

      let data = {};
      if (fs.existsSync(filePath)) {
        data = JSON.parse(fs.readFileSync(filePath, "utf8"));
      }

      // パス（例: "apiSettings.databaseType"）に基づいて値を設定
      const pathArray = settingPath.split(".");
      let current = data;
      for (let i = 0; i < pathArray.length - 1; i++) {
        if (!current[pathArray[i]]) current[pathArray[i]] = {};
        current = current[pathArray[i]];
      }
      current[pathArray[pathArray.length - 1]] = value;

      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
      console.log(`✅ 設定更新成功: ${settingPath} = ${JSON.stringify(value)}`);
      return { success: true, data };
    } catch (err) {
      console.error("❌ 設定更新失敗:", err);
      return { success: false, error: err.message };
    }
  });
}

module.exports = { handleIniAccess };
