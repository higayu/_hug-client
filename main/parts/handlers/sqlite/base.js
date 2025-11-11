// main/parts/handlers/sqlite/base.js
const sqlite3 = require("sqlite3").verbose();
const { getDbPath } = require("../../utils/pathResolver");

const dbPath = getDbPath();

function connect() {
  return new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error("❌ DB接続エラー:", err.message);
    } else {
      console.log("✅ DB接続成功:", dbPath);
    }
  });
}

module.exports = { connect };
