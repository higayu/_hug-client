// main/parts/utils/initDatabase.js
const fs = require("fs");
const sqlite3 = require("sqlite3").verbose();
const { getDbPath } = require("./pathResolver");

/**
 * SQLite データベースを初期化（存在しない場合は新規作成＋テーブル構築）
 */
function initializeDatabase() {
  const dbPath = getDbPath();
  const dir = require("path").dirname(dbPath);

  // ディレクトリが存在しなければ作成
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const dbExists = fs.existsSync(dbPath);
  const db = new sqlite3.Database(dbPath);

  if (!dbExists) {

    const initSQL = `
BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS "children" (
  "id"  BIGINT,
  "name" TEXT,
  "notes" TEXT,
  "pronunciation_id"  BIGINT,
  "children_type_id"  BIGINT,
  "is_delete" BIGINT,
  PRIMARY KEY("id")
);
CREATE TABLE IF NOT EXISTS "children_type" (
  "id"  BIGINT,
  "name" TEXT,
  PRIMARY KEY("id")
);
CREATE TABLE IF NOT EXISTS "facility_children" (
  "facility_id" BIGINT,
  "children_id" BIGINT,
  PRIMARY KEY("facility_id","children_id")
);
CREATE TABLE IF NOT EXISTS "facility_staff" (
  "facility_id" BIGINT,
  "staff_id" BIGINT,
  PRIMARY KEY("facility_id","staff_id")
);
CREATE TABLE IF NOT EXISTS "facilitys" (
  "id"  BIGINT,
  "name" TEXT,
  PRIMARY KEY("id")
);
CREATE TABLE IF NOT EXISTS "individual_support" (
  children_id BIGINT, 
  family_intention TEXT, 
  support_policy TEXT, 
  long_term_goal TEXT, 
  short_term_goal TEXT, 
  support_date TEXT
);
CREATE TABLE IF NOT EXISTS "managers" (
  "children_id" BIGINT,
  "staff_id" BIGINT,
  "day_of_week" TEXT,
  PRIMARY KEY("children_id","staff_id")
);
CREATE TABLE IF NOT EXISTS "memo" (
  "id"  BIGINT,
  "title" TEXT,
  "content" TEXT,
  PRIMARY KEY("id")
);
CREATE TABLE IF NOT EXISTS "pc" (
  "id"  BIGINT,
  "name" TEXT,
  "explanation" TEXT,
  "memo" TEXT,
  "facility_id" BIGINT,
  PRIMARY KEY("id")
);
CREATE TABLE IF NOT EXISTS "pc_to_children" (
  "id"  BIGINT,
  "pc_id" BIGINT,
  "children_id" BIGINT,
  "day_of_week" TEXT
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
  week_day TEXT NOT NULL,
  memo TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (children_id, week_day)
);
CREATE TABLE IF NOT EXISTS ai_temp_notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  children_id TEXT UNIQUE,
  memo TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
COMMIT;
`;

    db.exec(initSQL, (err) => {
      if (err) {
        console.error("error:", err);
      } else {
        console.log("database initialized:", dbPath);
      }
      db.close();
    });
  } else {
    console.log("database already exists:", dbPath);
    db.close();
  }
}

module.exports = { initializeDatabase };
