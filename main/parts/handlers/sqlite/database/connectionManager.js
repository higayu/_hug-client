const sqlite3 = require('sqlite3').verbose();

function connectDatabase(dbPath) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('❌ SQLite接続エラー:', err);
        reject(err);
      } else {
        console.log('✅ SQLite接続成功:', dbPath);
        resolve(db);
      }
    });
  });
}

function closeDatabase(db) {
  if (db) {
    db.close((err) => {
      if (err) console.error('❌ データベース終了エラー:', err);
      else console.log('✅ データベース接続終了');
    });
  }
}

module.exports = { connectDatabase, closeDatabase };
