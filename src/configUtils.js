// src/configUtils.js
const fs = require("fs");
const { getDataPath } = require("./fileUtils");

/**
 * デフォルト設定を返す関数
 * @returns {object} デフォルト設定オブジェクト
 */
function getDefaultConfig() {
  return {
    HUG_USERNAME: "",
    HUG_PASSWORD: "",
    VITE_API_BASE_URL: "http://192.168.1.229:3001/api",
    STAFF_ID: "",
    FACILITY_ID: ""
  };
}

/**
 * config.json を読み込む関数
 * @returns {object} 設定オブジェクト
 */
function loadConfig() {
  try {
    const configPath = getDataPath("config.json");
    
    // ファイルが存在しない場合はデフォルト設定を返す
    if (!fs.existsSync(configPath)) {
      console.log("⚠️ config.json が見つかりません。デフォルト設定を使用します。");
      return getDefaultConfig();
    }
    
    const raw = fs.readFileSync(configPath, "utf8");
    const json = JSON.parse(raw);
    console.log("✅ config.json 読み込み成功:", json);
    return json;
  } catch (err) {
    console.error("❌ config.json 読み込み失敗:", err);
    console.log("⚠️ デフォルト設定を使用します。");
    return getDefaultConfig();
  }
}

module.exports = {
  loadConfig,
  getDefaultConfig,
};
