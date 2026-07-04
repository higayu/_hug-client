// main/parts/handlers/index.js
const fs = require("fs");
const path = require("path");
const { app } = require("electron");
const apiClient = require("../../../src/apiClient");
const { registerSqliteHandlers } = require("./sqliteHandler");
const { registerMariadbHandlers } = require("./mariadbHandler");

function resolveIniPath() {
  if (app.isPackaged) {
    return path.join(app.getPath("userData"), "data", "ini.json");
  } else {
    return path.join(__dirname, "../../data/ini.json");
  }
}

function getDatabaseType() {
  try {
    const iniPath = resolveIniPath();

    if (!fs.existsSync(iniPath)) {
      console.log("ini.json not found");
      return "sqlite";
    }

    const iniData = JSON.parse(fs.readFileSync(iniPath, "utf8"));
    const dbType = iniData?.apiSettings?.databaseType || "mariadb";

    return dbType.toLowerCase();
  } catch (err) {
    console.error("⚠️ ini.jsonの読み込みに失敗:", err.message);
    return "sqlite";
  }
}

// ============================================================
// 🧩 メイン関数
// ============================================================
async function handleApiCalls(ipcMain) {
  console.log("🔥 handleApiCalls START");

  const DB_TYPE = getDatabaseType();

  console.log("📌 現在のDB_TYPE:", DB_TYPE);

  // ============================================================
  // 📗 SQLite/MariaDB CRUD IPC登録
  // ============================================================
  registerMariadbHandlers(ipcMain);
  registerSqliteHandlers(ipcMain);

  // ============================================================
  // 🔹 全テーブル取得
  // ============================================================
  ipcMain.handle("fetchTableAll", async () => {
    try {
      console.log("🔄 [fetchTableAll] START");

      const result = await apiClient.fetchTableAll();

      console.log("✅ [fetchTableAll] DONE");
      return result;
    } catch (err) {
      console.error("❌ [fetchTableAll] ERROR:", err);

      return {
        success: false,
        error: err?.message || String(err),
      };
    }
  });

  // ============================================================
  // 🔹 getDatabaseType IPCハンドラー
  // ============================================================
  ipcMain.handle("get-database-type", async () => {
    try {
      const dbType = getDatabaseType();
      return dbType;
    } catch (err) {
      console.error("❌ getDatabaseType失敗:", err.message);
      return "sqlite";
    }
  });
}

module.exports = { handleApiCalls };