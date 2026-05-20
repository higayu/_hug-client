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
    GEMINI_API_KEY: ""
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
      console.log("config.json not found. default settings used.");
      return getDefaultConfig();
    }
    
    const raw = fs.readFileSync(configPath, "utf8");
    const json = JSON.parse(raw);
    console.log("config.json loaded:", json);
    return json;
  } catch (err) {
    console.error("error: config.json load failed:", err);
    console.log("default settings used.");
    return getDefaultConfig();
  }
}

module.exports = {
  loadConfig,
  getDefaultConfig,
};
