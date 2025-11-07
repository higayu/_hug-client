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

/**
 * 安全にクエリを実行して結果を返す（Promiseでラップ）
 */
function runQuery(query, params = []) {
  const db = connect();
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }

      // クエリ完了後に安全に閉じる
      db.close((closeErr) => {
        if (closeErr) console.error("⚠️ DBクローズ失敗:", closeErr.message);
      });
    });
  });
}

module.exports = { connect, runQuery };
