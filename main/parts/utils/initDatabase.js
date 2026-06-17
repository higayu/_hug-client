// main/parts/utils/initDatabase.js
const fs = require("fs");
const sqlite3 = require("sqlite3").verbose();
const { getDbPath } = require("./pathResolver");

const CHILDREN_COLUMN_MIGRATIONS = [
  { name: "notes2", sql: 'ALTER TABLE "children" ADD COLUMN "notes2" TEXT' },
  { name: "personal_tmp", sql: 'ALTER TABLE "children" ADD COLUMN "personal_tmp" TEXT' },
];

function ensureChildrenColumns(db, done) {
  db.all('PRAGMA table_info("children")', [], (err, rows) => {
    if (err) return done(err);

    const existingColumns = new Set(rows.map((row) => row.name));
    const missing = CHILDREN_COLUMN_MIGRATIONS.filter(
      ({ name }) => !existingColumns.has(name)
    );

    if (missing.length === 0) return done();

    db.serialize(() => {
      let pending = missing.length;
      let firstError = null;

      missing.forEach(({ sql }) => {
        db.run(sql, (alterErr) => {
          if (alterErr && !firstError) firstError = alterErr;
          pending -= 1;
          if (pending === 0) done(firstError);
        });
      });
    });
  });
}

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
CREATE TABLE IF NOT EXISTS "ai_temp_notes" (
	"id"	INTEGER,
	"children_id"	INTEGER UNIQUE,
	"type"	TEXT,
	"memo"	TEXT,
	"updated_at"	DATETIME DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY("id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "children" (
	"id"	BIGINT,
	"name"	TEXT,
	"notes"	TEXT,
	"notes2"	TEXT,
	"personal_tmp"	TEXT,
	"pronunciation_id"	BIGINT,
	"children_type_id"	BIGINT,
	"is_delete"	BIGINT,
	"leaving_at"	TEXT,
	PRIMARY KEY("id")
);
CREATE TABLE IF NOT EXISTS "children_type" (
	"id"	BIGINT,
	"name"	TEXT,
	PRIMARY KEY("id")
);
CREATE TABLE IF NOT EXISTS day_of_week (
    id INTEGER PRIMARY KEY,
    label_jp TEXT NOT NULL,
    label_en TEXT,
    sort_order INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS "facility_children" (
	"facility_id"	BIGINT,
	"children_id"	BIGINT,
	PRIMARY KEY("facility_id","children_id")
);
CREATE TABLE IF NOT EXISTS "facility_staff" (
	"facility_id"	BIGINT,
	"staff_id"	BIGINT,
	PRIMARY KEY("facility_id","staff_id")
);
CREATE TABLE IF NOT EXISTS "facilitys" (
	"id"	BIGINT,
	"name"	TEXT,
	PRIMARY KEY("id")
);
CREATE TABLE IF NOT EXISTS managers2 (
  children_id     INTEGER NOT NULL,
  staff_id        INTEGER NOT NULL,
  day_of_week_id  INTEGER NOT NULL,
  priority        INTEGER NOT NULL DEFAULT 0,

  PRIMARY KEY (children_id, staff_id, day_of_week_id),

  FOREIGN KEY (children_id)
    REFERENCES children(id)
    ON DELETE CASCADE,

  FOREIGN KEY (staff_id)
    REFERENCES staffs(id)
    ON DELETE CASCADE,

  FOREIGN KEY (day_of_week_id)
    REFERENCES day_of_week(id)
    ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS pc (
	id BIGINT, 
	name TEXT, 
	explanation TEXT, 
	memo TEXT, 
	facility_id BIGINT
);
CREATE TABLE IF NOT EXISTS "pc_to_children" (
	"id"	BIGINT,
	"pc_id"	BIGINT,
	"children_id"	BIGINT,
	"day_of_week"	INTEGER,
	PRIMARY KEY("id")
);
CREATE TABLE IF NOT EXISTS "pronunciation" (
	"id"	BIGINT,
	"pronunciation"	TEXT,
	PRIMARY KEY("id")
);
CREATE TABLE IF NOT EXISTS "staffs" (
	"id"	BIGINT,
	"name"	TEXT,
	"notes"	TEXT,
	"is_delete"	BIGINT,
	"admin"	INTEGER,
	"leaving_at"	TEXT,
	PRIMARY KEY("id")
);
CREATE TABLE IF NOT EXISTS "temp_notes" (
	"children_id"	INTEGER NOT NULL,
	"staff_id"	INTEGER NOT NULL,
	"day_of_week_id"	INTEGER NOT NULL,
	"memo1"	TEXT,
	"memo2"	TEXT,
	"created_at"	DATETIME DEFAULT CURRENT_TIMESTAMP,
	"updated_at"	DATETIME DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY("children_id","day_of_week_id")
);
COMMIT;
`;

    db.exec(initSQL, (err) => {
      if (err) {
        console.error("error:", err);
        db.close();
        return;
      }

      ensureChildrenColumns(db, (migrationErr) => {
        if (migrationErr) {
          console.error("children table migration error:", migrationErr);
        } else {
          console.log("database initialized:", dbPath);
        }
        db.close();
      });
    });
  } else {
    console.log("database already exists:", dbPath);
    ensureChildrenColumns(db, (err) => {
      if (err) {
        console.error("children table migration error:", err);
      }
      db.close();
    });
  }
}

module.exports = { initializeDatabase };
