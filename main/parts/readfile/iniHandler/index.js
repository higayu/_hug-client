// main/parts/readfile/iniHandler/index.js
const fs = require("fs");
const path = require("path");
const { ipcMain } = require("electron");
const { getDataDir, getIniPath } = require("../../utils/pathResolver");
const { DEFAULT_INI, getDefaultIni } = require("./defaultIni");

function handleIniAccess(ipcMain) {
  // ============================================================
  // 📖 ini.json 読み込み
  // ============================================================
  ipcMain.handle("read-ini", async () => {
    try {
      const filePath = getIniPath();

      // ini.json が存在しない場合は自動生成
      if (!fs.existsSync(filePath)) {
        const defaultIni = getDefaultIni();
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(filePath, JSON.stringify(defaultIni, null, 2));
        return { success: true, data: defaultIni };
      }

      const jsonData = JSON.parse(fs.readFileSync(filePath, "utf8"));
      
      // バージョンチェックとマイグレーション
      if (!jsonData.version || jsonData.version !== DEFAULT_INI.version) {
        console.warn(`⚠️ ini.json のバージョンが異なります (current: ${DEFAULT_INI.version}, file: ${jsonData.version || 'undefined'})`);
        // 不足しているキーをデフォルト値で補完
        const merged = mergeDeep(DEFAULT_INI, jsonData);
        merged.version = DEFAULT_INI.version;
        
        // 補完したデータを保存
        fs.writeFileSync(filePath, JSON.stringify(merged, null, 2), "utf8");
        return { success: true, data: merged };
      }
      
      return { success: true, data: jsonData };
    } catch (err) {
      console.error("❌ ini.json 読み込み失敗:", err);
      // 破損時はデフォルトを返す
      try {
        const fallback = getDefaultIni();
        fs.writeFileSync(getIniPath(), JSON.stringify(fallback, null, 2));
        return { success: true, data: fallback };
      } catch (e) {
        return { success: false, error: err.message };
      }
    }
  });

  // ============================================================
  // 💾 ini.json 保存
  // ============================================================
  ipcMain.handle("save-ini", async (event, data) => {
    try {
      const filePath = getIniPath();

      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

      // バージョン情報を保持
      const saveData = {
        ...data,
        version: data.version || DEFAULT_INI.version
      };

      const jsonString = JSON.stringify(saveData, null, 2);
      fs.writeFileSync(filePath, jsonString, "utf8");

      return { success: true };
    } catch (err) {
      console.error("❌ ini.json 保存エラー:", err);
      return { success: false, error: err.message };
    }
  });

  // ============================================================
  // 🔄 ini.json リセット（デフォルトで上書き）
  // ============================================================
  ipcMain.handle("reset-ini", async () => {
    try {
      const filePath = getIniPath();
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

      const defaultIni = getDefaultIni();
      fs.writeFileSync(filePath, JSON.stringify(defaultIni, null, 2), "utf8");
      return { success: true, data: defaultIni };
    } catch (err) {
      console.error("❌ ini.json リセットエラー:", err);
      return { success: false, error: err.message };
    }
  });

  // ============================================================
  // ✏️ ini.json の特定設定項目を更新
  // ============================================================
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
          data = getDefaultIni();
        }
      } else {
        data = getDefaultIni();
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
      console.error("❌ ini.json 更新エラー:", err);
      return { success: false, error: err.message };
    }
  });
}

/**
 * オブジェクトのディープマージ
 */
function mergeDeep(target, source) {
  const result = { ...target };
  
  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = mergeDeep(target[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
  }
  
  return result;
}

module.exports = { handleIniAccess };