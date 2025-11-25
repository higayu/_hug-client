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
    // dev path is main/data/ini.json
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
      baseURL: "http://192.168.1.229",
      staffId: "",
      facilityId: "",
      databaseType: "mariadb",
      useAI: "gemini"
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
    console.log("ini.json path:", iniPath);
    
    // ファイルが存在しない場合はデフォルト設定を返す
    if (!fs.existsSync(iniPath)) {
      console.log("ini.json not found. default settings used.");
      console.log("file exists check:", iniPath);
      return getDefaultIni();
    }
    
    const raw = fs.readFileSync(iniPath, "utf8");
    const json = JSON.parse(raw);
    console.log("ini.json loaded:", {
      baseURL: json?.apiSettings?.baseURL,
      databaseType: json?.apiSettings?.databaseType,
      useAI: json?.apiSettings?.useAI
    });
    return json;
  } catch (err) {
    console.error("error: ini.json load failed:", err);
    console.log("default settings used.");
    return getDefaultIni();
  }
}

module.exports = {
  loadIni,
  getDefaultIni,
};
