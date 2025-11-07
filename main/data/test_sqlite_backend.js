// main/data/test_sqlite_backend.js
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

// === SQLiteファイルの絶対パス ===
const dbPath = path.resolve(__dirname, "./houday.db");

// === テスト用パラメータ ===
const staffId = 73;
const day = "土";

// === SQLiteクエリ ===
const query = `
SELECT 
    c.id AS children_id,
    c.name AS children_name,
    c.pronunciation_id AS children_pronunciation_id,
    p.pronunciation AS children_pronunciation,
    c.notes,
    c.children_type_id AS children_type_id,
    ct.name AS children_type_name,
    pc.id AS pc_id,
    pc.name AS pc_name,
    pc.explanation AS pc_explanation,
    pc.memo AS pc_memo,
    ptc.day_of_week AS pc_day_of_week,
    ptc.id AS ptc_id,
    ptc.start_time AS start_time,
    ptc.end_time AS end_time
FROM children c
INNER JOIN managers m ON c.id = m.children_id
INNER JOIN staffs s ON m.staff_id = s.id
LEFT JOIN pc_to_children ptc 
    ON c.id = ptc.children_id
    AND (ptc.day_of_week = ? OR ptc.day_of_week = '')
LEFT JOIN pc 
    ON ptc.pc_id = pc.id
LEFT JOIN pronunciation p 
    ON c.pronunciation_id = p.id
LEFT JOIN children_type ct
    ON c.children_type_id = ct.id
WHERE 
    s.id = ?
    AND m.day_of_week LIKE ?
ORDER BY s.id DESC, c.name;
`;

// === 実行 ===
console.log("🧩 SQLite テスト開始");
console.log("DB:", dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("❌ DB接続エラー:", err.message);
    process.exit(1);
  }
  console.log("✅ DB接続成功");
});

db.serialize(() => {
  const dayJsonPattern = `%\"${day}\"%`;

  db.all(query, [day, staffId, dayJsonPattern], (err, rows) => {
    if (err) {
      console.error("❌ SQL実行エラー:", err.message);
    } else {
      console.log(`🔍 検索結果: ${rows.length} 件`);
      if (rows.length === 0) {
        console.warn("⚠️ データが見つかりません。managers, staffs などを確認してください。");
      } else {
        console.log("📋 結果サンプル:");
        console.dir(rows.slice(0, 3), { depth: null });
      }
    }
  });
});

db.close(() => {
  console.log("✅ DB接続終了");
});
