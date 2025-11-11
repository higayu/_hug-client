// main/parts/handlers/sqlite/base.js
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const dbPath = path.resolve(__dirname, "../../../data/houday.db");

/**
 * SQLite接続を取得
 * better-sqlite3 は使わず、標準 sqlite3（非同期版）を使用
 */
function connect() {
  return new sqlite3.Database(dbPath, (err) => {
    if (err) console.error("❌ DB接続エラー:", err.message);
  });
}

module.exports = { connect};