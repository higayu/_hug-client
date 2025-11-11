// src/iniUtils.js
const fs = require("fs");
const path = require("path");
const { app } = require("electron");

/**
 * ini.jsonのパスを解決
 */
function resolveIniPath() {
  if (app.isPackaged) {
    return path.join(app.getPath("userData"), "data", "ini.json");
  } else {
    // ⚠️ 開発時はmain/data/ini.jsonを参照
    return path.join(__dirname, "..", "main", "data", "ini.json");
  }
}

/**
 * デフォルト設定を返す関数
 * @returns {object} デフォルト設定オブジェクト
 */
function getDefaultIni() {
  return {
    apiSettings: {
      baseURL: "http://192.168.1.229:3001/api",
      staffId: "",
      facilityId: "",
      databaseType: "sqlite"
    }
  };
}

/**
 * ini.json を読み込む関数
 * @returns {object} 設定オブジェクト
 */
function loadIni() {
  try {
    const iniPath = resolveIniPath();
    console.log("🔍 [iniUtils] ini.jsonパス:", iniPath);
    
    // ファイルが存在しない場合はデフォルト設定を返す
    if (!fs.existsSync(iniPath)) {
      console.log("⚠️ ini.json が見つかりません。デフォルト設定を使用します。");
      console.log("🔍 [iniUtils] ファイル存在確認:", iniPath);
      return getDefaultIni();
    }
    
    const raw = fs.readFileSync(iniPath, "utf8");
    const json = JSON.parse(raw);
    console.log("✅ [iniUtils] ini.json 読み込み成功:", {
      baseURL: json?.apiSettings?.baseURL,
      databaseType: json?.apiSettings?.databaseType
    });
    return json;
  } catch (err) {
    console.error("❌ [iniUtils] ini.json 読み込み失敗:", err);
    console.log("⚠️ デフォルト設定を使用します。");
    return getDefaultIni();
  }
}

module.exports = {
  loadIni,
  getDefaultIni,
};
