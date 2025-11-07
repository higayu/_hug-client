// main/parts/tempNote/database/schemaManager.js
function initAllTables(db) {
  return new Promise((resolve, reject) => {
    const schemaSQL = `
BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS Children (
  id BIGINT,
  name TEXT,
  notes TEXT,
  pronunciation_id BIGINT,
  children_type_id BIGINT,
  is_delete BIGINT
);
CREATE TABLE IF NOT EXISTS Individual_Support (
  children_id BIGINT,
  family_intention TEXT,
  support_policy TEXT,
  long_term_goal TEXT,
  short_term_goal TEXT,
  support_date TEXT
);
CREATE TABLE IF NOT EXISTS children_type (
  id BIGINT,
  name TEXT
);
CREATE TABLE IF NOT EXISTS facility_children (
  facility_id BIGINT,
  children_id BIGINT
);
CREATE TABLE IF NOT EXISTS facility_staff (
  facility_id BIGINT,
  staff_id BIGINT
);
CREATE TABLE IF NOT EXISTS facilitys (
  id BIGINT,
  name TEXT
);
CREATE TABLE IF NOT EXISTS managers (
  children_id BIGINT,
  staff_id BIGINT,
  day_of_week TEXT
);
CREATE TABLE IF NOT EXISTS memo (
  id BIGINT,
  title TEXT,
  content TEXT
);
CREATE TABLE IF NOT EXISTS pc (
  id BIGINT,
  name TEXT,
  explanation TEXT,
  memo TEXT,
  facility_id BIGINT
);
CREATE TABLE IF NOT EXISTS pc_to_children (
  id BIGINT,
  pc_id BIGINT,
  children_id BIGINT,
  day_of_week TEXT,
  start_time BIGINT,
  end_time BIGINT
);
CREATE TABLE IF NOT EXISTS pronunciation (
  id BIGINT,
  pronunciation TEXT
);
CREATE TABLE IF NOT EXISTS staffs (
  id BIGINT,
  name TEXT,
  notes TEXT,
  is_delete BIGINT
);
CREATE TABLE IF NOT EXISTS temp_notes (
  children_id TEXT NOT NULL,
  staff_id TEXT NOT NULL,
  date_str TEXT NOT NULL,
  week_day TEXT NOT NULL,
  enter_time TEXT,
  exit_time TEXT,
  memo TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY(children_id, week_day)
);
COMMIT;
    `;

    db.exec(schemaSQL, (err) => {
      if (err) {
        console.error("❌ [schemaManager] テーブル初期化エラー:", err);
        reject(err);
      } else {
        console.log("✅ [schemaManager] すべてのテーブルが利用可能になりました");
        resolve();
      }
    });
  });
}

module.exports = { initAllTables };
