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
      console.log("⚠️ ini.jsonが見つかりません。デフォルト（SQLite）を使用します");
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
  const DB_TYPE = getDatabaseType();
  console.log(`⚙️ 現在のDBモード: ${DB_TYPE}`);

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


  // ============================================================
  // 📗 SQLite/MariaDB CRUD IPC登録
  // ============================================================
  if (DB_TYPE === "sqlite") {
    registerSqliteHandlers(ipcMain);
  } else if (DB_TYPE === "mariadb") {
    // ⚠️ MariaDBハンドラーを登録
    registerMariadbHandlers(ipcMain);
  } else {
    console.warn(`⚠️ 不明なDBモード: ${DB_TYPE}。デフォルト（SQLite）を使用します。`);
    registerSqliteHandlers(ipcMain);
  }

  console.log("✅ APIハンドラ登録完了");
}

module.exports = { handleApiCalls };
