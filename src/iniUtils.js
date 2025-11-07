// src/iniUtils.js
const fs = require("fs");
const { getDataPath } = require("./fileUtils");

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
 * config.json を読み込む関数
 * @returns {object} 設定オブジェクト
 */
function loadIni() {
  try {
    const iniPath = getDataPath("ini.json");
    
    // ファイルが存在しない場合はデフォルト設定を返す
    if (!fs.existsSync(iniPath)) {
      console.log("⚠️ ini.json が見つかりません。デフォルト設定を使用します。");
      return getDefaultIni();
    }
    
    const raw = fs.readFileSync(iniPath, "utf8");
    const json = JSON.parse(raw);
    console.log("✅ ini.json 読み込み成功:", json);
    return json;
  } catch (err) {
    console.error("❌ ini.json 読み込み失敗:", err);
    console.log("⚠️ デフォルト設定を使用します。");
    return getDefaultIni();
  }
}

module.exports = {
  loadIni,
  getDefaultIni,
};
