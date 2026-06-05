// main/parts/handlers/apiHandler.js
const fs = require("fs");
const path = require("path");
const { app } = require("electron");
const apiClient = require("../../../src/apiClient");
const { registerSqliteHandlers } = require("./sqliteHandler");
const { registerMariadbHandlers } = require("./mariadbHandler"); // ⚠️ 追加
const sqlite3 = require("sqlite3").verbose(); // ← ここで一括読み込み

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
    const dbType = iniData?.apiSettings?.databaseType || "sqlite";
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

  // ============================================================
  // 📗 SQLite/MariaDB CRUD IPC登録
  // ============================================================
  registerMariadbHandlers(ipcMain);
  registerSqliteHandlers(ipcMain);

  ipcMain.handle("fetchTableAll", async () => {
    return await apiClient.fetchTableAll();
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
