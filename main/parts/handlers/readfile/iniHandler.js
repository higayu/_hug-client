// main/parts/handlers/readfile/iniHandler.js
const fs = require("fs");
const path = require("path");
const { ipcMain } = require("electron");
const { getDataDir, getIniPath } = require("../../utils/pathResolver");

const DEFAULT_INI_PATH = path.join(__dirname, "../../data/ini.json.example");

function loadDefaultIni() {
  try {
    if (fs.existsSync(DEFAULT_INI_PATH)) {
      const json = JSON.parse(fs.readFileSync(DEFAULT_INI_PATH, "utf8"));
      return json;
    }
  } catch (e) {
    console.error("⚠️ ini.json.example の読み込みに失敗:", e);
  }

  // フォールバックの組み込みデフォルト
  return {
    version: "1.0.0",
    appSettings: {
      autoLogin: { enabled: true },
      ui: {
        theme: "light",
        language: "ja",
        showCloseButtons: true,
        confirmOnClose: true,
        autoRefresh: { enabled: false, interval: 30000 },
      },
      features: {
        individualSupportPlan: { enabled: true, buttonText: "個別支援計画", buttonColor: "#007bff" },
        specializedSupportPlan: { enabled: true, buttonText: "専門的支援計画", buttonColor: "#28a745" },
        additionCompare: { enabled: true, buttonText: "加算比較", buttonColor: "#ffc107" },
        importSetting: { enabled: false, buttonText: "設定ファイル取得", buttonColor: "#6c757d" },
        getUrl: { enabled: false, buttonText: "URL取得", buttonColor: "#17a2b8" },
        loadIni: { enabled: true, buttonText: "設定の再読み込み", buttonColor: "#e5d7fe" },
      },
      window: {
        width: 1200,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        maximized: false,
        alwaysOnTop: false,
      },
      notifications: { enabled: true, sound: true, desktop: true },
    },
    userPreferences: {
      lastLoginDate: "",
      rememberWindowState: true,
      showWelcomeMessage: true,
    },
    apiSettings: {
      baseURL: "http://192.168.1.229",
      staffId: "73",
      facilityId: "3",
      databaseType: "mariadb",
      useAI: "gemini",
      debugFlg:"false"
    },
  };
}

// もし pathResolver.js に getIniPath() がまだない場合、以下を追加してください:
// function getIniPath() { return path.join(getDataDir(), "ini.json"); }

function handleIniAccess(ipcMain) {
  // ini.json 読み込み
  ipcMain.handle("read-ini", async () => {
    try {
      const filePath = getIniPath();

      // ini.json が存在しない場合は自動生成
      // fs.exists はコールバック版なので必ず existsSync を使う
      if (!fs.existsSync(filePath)) {
        const defaultIni = loadDefaultIni();
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(filePath, JSON.stringify(defaultIni, null, 2));
        return { success: true, data: defaultIni };
      }

      const jsonData = JSON.parse(fs.readFileSync(filePath, "utf8"));
      return { success: true, data: jsonData };
    } catch (err) {
      console.error("❌ ini.json 読み込み失敗:", err);
      // 破損時はデフォルトを返す
      try {
        const fallback = loadDefaultIni();
        fs.writeFileSync(getIniPath(), JSON.stringify(fallback, null, 2));
        return { success: true, data: fallback };
      } catch (e) {
        return { success: false, error: err.message };
      }
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

      return { success: true };
    } catch (err) {
      console.error("error:", err);
      return { success: false, error: err.message };
    }
  });

  // ini.json リセット（サンプルで上書き）
  ipcMain.handle("reset-ini", async () => {
    try {
      const filePath = getIniPath();
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

      const defaultIni = loadDefaultIni();
      fs.writeFileSync(filePath, JSON.stringify(defaultIni, null, 2), "utf8");
      return { success: true, data: defaultIni };
    } catch (err) {
      console.error("error:", err);
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

    // JSON 破損対策
    if (fs.existsSync(filePath)) {
      try {
        data = JSON.parse(fs.readFileSync(filePath, "utf8"));
      } catch (e) {
        console.error("⚠️ ini.json が破損していたため初期化します");
        data = {};
      }
    }

    // 深いパスの作成
    const keys = settingPath.split(".");
    let obj = data;
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];

      // オブジェクト以外なら強制的にオブジェクトに変換
      if (typeof obj[key] !== "object" || obj[key] === null) {
        obj[key] = {};
      }

      obj = obj[key];
    }

    obj[keys[keys.length - 1]] = value;

    // 原子的書き込み
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");

    return { success: true, data };

  } catch (err) {
    console.error("error:", err);
    return { success: false, error: err.message };
  }
});

}

module.exports = { handleIniAccess };
