// main/parts/utils/initDatabase.js

const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const { getDbPath } = require("./pathResolver");

/**
 * sqlite3 Promise helpers
 */
function execSql(db, sql) {
  return new Promise((resolve, reject) => {
    db.exec(sql, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

function runSql(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve(this);
    });
  });
}

function allSql(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

async function tryRunSql(db, sql, label) {
  try {
    await runSql(db, sql);
  } catch (err) {
    console.warn(`[initDatabase] ${label} skipped:`, err.message);
  }
}

function quoteIdent(name) {
  return `"${String(name).replace(/"/g, '""')}"`;
}

async function tableExists(db, tableName) {
  const rows = await allSql(
    db,
    `
      SELECT name
      FROM sqlite_master
      WHERE type = 'table'
        AND name = ?
      LIMIT 1
    `,
    [tableName]
  );

  return rows.length > 0;
}

async function getColumns(db, tableName) {
  const rows = await allSql(
    db,
    `PRAGMA table_info(${quoteIdent(tableName)})`
  );

  return rows.map((row) => row.name);
}

async function ensureColumn(db, tableName, columnName, columnDefinition) {
  const exists = await tableExists(db, tableName);
  if (!exists) return;

  const columns = await getColumns(db, tableName);
  if (columns.includes(columnName)) return;

  await runSql(
    db,
    `ALTER TABLE ${quoteIdent(tableName)} ADD COLUMN ${columnDefinition}`
  );
}

/**
 * 旧 day_of_week テーブル対策
 *
 * 以前の SQLite day_of_week が children_id / staff_id / days 用だった場合、
 * MariaDB 側の曜日マスタと衝突するため、バックアップ名に退避する。
 */
async function migrateLegacyDayOfWeekIfNeeded(db) {
  const exists = await tableExists(db, "day_of_week");
  if (!exists) return;

  const columns = await getColumns(db, "day_of_week");

  const isCurrentSchema =
    columns.includes("id") &&
    columns.includes("label_jp") &&
    columns.includes("label_en") &&
    columns.includes("sort_order");

  if (isCurrentSchema) return;

  const looksLikeLegacyLocalTable =
    columns.includes("children_id") ||
    columns.includes("staff_id") ||
    columns.includes("days");

  if (!looksLikeLegacyLocalTable) {
    console.warn(
      "[initDatabase] day_of_week exists but schema is unknown. Not renamed."
    );
    return;
  }

  const backupName = `child_staff_week_days_backup_${Date.now()}`;

  console.warn(
    `[initDatabase] legacy day_of_week detected. Renaming to ${backupName}`
  );

  await runSql(
    db,
    `ALTER TABLE ${quoteIdent("day_of_week")} RENAME TO ${quoteIdent(backupName)}`
  );
}

/**
 * SQLite 初期テーブル定義
 *
 * 方針:
 * - MariaDB の主要テーブルを SQLite キャッシュとして作る
 * - SQLite 独自の temp_notes / ai_temp_notes もここで作る
 * - 一時フォールバック用途なので、FK は厳密には張らず、PK / UNIQUE / INDEX を中心にする
 */
const INIT_SQL = `
BEGIN TRANSACTION;

CREATE TABLE IF NOT EXISTS "ai_temp_notes" (
  "id" INTEGER PRIMARY KEY AUTOINCREMENT,
  "children_id" INTEGER NOT NULL UNIQUE,
  "type" TEXT,
  "memo" TEXT,
  "updated_at" DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "children_type" (
  "id" INTEGER PRIMARY KEY,
  "name" TEXT
);

CREATE TABLE IF NOT EXISTS "pronunciation" (
  "id" INTEGER PRIMARY KEY,
  "pronunciation" TEXT
);

CREATE TABLE IF NOT EXISTS "children" (
  "id" INTEGER PRIMARY KEY,
  "name" TEXT NOT NULL DEFAULT '',
  "notes" TEXT,
  "notes2" TEXT,
  "personal_tmp" TEXT,
  "pronunciation_id" INTEGER,
  "children_type_id" INTEGER NOT NULL DEFAULT 1,
  "is_delete" INTEGER NOT NULL DEFAULT 0,
  "leaving_at" TEXT
);

CREATE TABLE IF NOT EXISTS "day_of_week" (
  "id" INTEGER PRIMARY KEY,
  "label_jp" TEXT NOT NULL,
  "label_en" TEXT,
  "sort_order" INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS "facilitys" (
  "id" INTEGER PRIMARY KEY,
  "name" TEXT NOT NULL DEFAULT '',
  "url" TEXT
);

CREATE TABLE IF NOT EXISTS "facility_children" (
  "facility_id" INTEGER NOT NULL,
  "children_id" INTEGER NOT NULL,
  PRIMARY KEY ("facility_id", "children_id")
);

CREATE TABLE IF NOT EXISTS "facility_staff" (
  "facility_id" INTEGER NOT NULL,
  "staff_id" INTEGER NOT NULL,
  PRIMARY KEY ("facility_id", "staff_id")
);

CREATE TABLE IF NOT EXISTS "staffs" (
  "id" INTEGER PRIMARY KEY,
  "name" TEXT NOT NULL DEFAULT '',
  "work_style" TEXT,
  "notes" TEXT NOT NULL DEFAULT '',
  "is_delete" INTEGER NOT NULL DEFAULT 0,
  "admin" INTEGER,
  "display_order" INTEGER,
  "entered_at" TEXT,
  "leaving_at" TEXT,
  "hug_updated_at" TEXT,
  "hug_updated_by" TEXT
);

CREATE TABLE IF NOT EXISTS "staff_facility_roles" (
  "id" INTEGER PRIMARY KEY AUTOINCREMENT,
  "staff_id" INTEGER NOT NULL,
  "facility_id" INTEGER NOT NULL,
  "job_name" TEXT NOT NULL,
  "experience_label" TEXT,
  "role_note" TEXT,
  "raw_text" TEXT,
  "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE ("staff_id", "facility_id", "job_name", "experience_label")
);

CREATE TABLE IF NOT EXISTS "managers2" (
  "children_id" INTEGER NOT NULL,
  "staff_id" INTEGER NOT NULL,
  "day_of_week_id" INTEGER NOT NULL,
  "priority" INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY ("children_id", "staff_id", "day_of_week_id")
);

CREATE TABLE IF NOT EXISTS "pc" (
  "id" INTEGER PRIMARY KEY AUTOINCREMENT,
  "facility_id" INTEGER NOT NULL,
  "pc_id" INTEGER NOT NULL,
  "name" TEXT NOT NULL DEFAULT '',
  "explanation" TEXT,
  "memo" TEXT,
  UNIQUE ("facility_id", "pc_id")
);

CREATE TABLE IF NOT EXISTS "pc_to_children" (
  "id" INTEGER PRIMARY KEY AUTOINCREMENT,
  "pc_id" INTEGER NOT NULL,
  "children_id" INTEGER NOT NULL,
  "day_of_week" INTEGER,
  "start_time" TEXT,
  "end_time" TEXT
);

CREATE TABLE IF NOT EXISTS "record_types" (
  "id" INTEGER PRIMARY KEY AUTOINCREMENT,
  "name" TEXT NOT NULL,
  "memo" TEXT
);

CREATE TABLE IF NOT EXISTS "child_records" (
  "id" INTEGER PRIMARY KEY AUTOINCREMENT,
  "children_id" INTEGER NOT NULL,
  "record_type_id" INTEGER NOT NULL,
  "date" TEXT NOT NULL,
  "score" INTEGER,
  "mistakes" INTEGER,
  "facility_id" INTEGER NOT NULL,
  "memo1" TEXT,
  "memo2" TEXT,
  "created_at" DATETIME DEFAULT CURRENT_TIMESTAMP,
  "updated_at" DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "m_service_items" (
  "id" INTEGER PRIMARY KEY AUTOINCREMENT,
  "name" TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS "service_record" (
  "id" INTEGER PRIMARY KEY AUTOINCREMENT,
  "children_id" INTEGER NOT NULL,
  "day_of_week_id" INTEGER NOT NULL,
  "item_id" INTEGER NOT NULL,
  "served_date" TEXT NOT NULL,
  "facility_id" INTEGER NOT NULL,
  "note" TEXT,
  "is_copy" INTEGER NOT NULL DEFAULT 0,
  "is_deleted" INTEGER NOT NULL DEFAULT 0,
  "recorded_staff_id" INTEGER NOT NULL DEFAULT -1,
  "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_staff_id" INTEGER NOT NULL DEFAULT -1,
  "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE ("children_id", "day_of_week_id", "item_id", "served_date")
);

CREATE TABLE IF NOT EXISTS "memo" (
  "id" INTEGER PRIMARY KEY AUTOINCREMENT,
  "title" TEXT NOT NULL DEFAULT '',
  "content" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "text_data" (
  "id" INTEGER PRIMARY KEY AUTOINCREMENT,
  "genre" TEXT NOT NULL,
  "group" TEXT NOT NULL,
  "sort" INTEGER NOT NULL,
  "value" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "toolbox" (
  "id" INTEGER PRIMARY KEY AUTOINCREMENT,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "layout" TEXT NOT NULL,
  "is_tools" INTEGER NOT NULL DEFAULT 1,
  "created_at" DATETIME DEFAULT CURRENT_TIMESTAMP,
  "updated_at" DATETIME DEFAULT CURRENT_TIMESTAMP,
  "permission" INTEGER NOT NULL DEFAULT 0,
  "facility_id" INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS "users" (
  "id" INTEGER PRIMARY KEY AUTOINCREMENT,
  "name" TEXT,
  "email" TEXT NOT NULL,
  "password" TEXT NOT NULL,
  "created_at" DATETIME DEFAULT CURRENT_TIMESTAMP,
  "leaving_at" TEXT,
  UNIQUE ("email")
);

CREATE TABLE IF NOT EXISTS "refresh_tokens" (
  "id" INTEGER PRIMARY KEY AUTOINCREMENT,
  "user_id" INTEGER NOT NULL,
  "token" TEXT NOT NULL,
  "revoked" INTEGER DEFAULT 0,
  "expires_at" DATETIME NOT NULL,
  "created_at" DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "individual_support" (
  "children_id" INTEGER PRIMARY KEY,
  "family_intention" TEXT,
  "support_policy" TEXT,
  "long_term_goal" TEXT,
  "short_term_goal" TEXT,
  "support_date" TEXT,
  "created_at" DATETIME DEFAULT CURRENT_TIMESTAMP,
  "updated_at" DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "temp_notes" (
  "children_id" INTEGER NOT NULL,
  "staff_id" INTEGER NOT NULL,
  "day_of_week_id" INTEGER NOT NULL,
  "memo1" TEXT,
  "memo2" TEXT,
  "created_at" DATETIME DEFAULT CURRENT_TIMESTAMP,
  "updated_at" DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("children_id", "day_of_week_id")
);

COMMIT;
`;

/**
 * 既存DB向け migration
 *
 * CREATE TABLE IF NOT EXISTS は既存テーブルを変更しないため、
 * 既存DBには ALTER TABLE ADD COLUMN を実行する。
 *
 * SQLite は PRIMARY KEY や NOT NULL を後付けしにくいため、
 * 既存DB向け追加カラムは基本的に nullable / default 付きにする。
 */
async function migrateExistingDatabase(db) {
  // ai_temp_notes
  await ensureColumn(db, "ai_temp_notes", "children_id", `"children_id" INTEGER`);
  await ensureColumn(db, "ai_temp_notes", "type", `"type" TEXT`);
  await ensureColumn(db, "ai_temp_notes", "memo", `"memo" TEXT`);
  await ensureColumn(
    db,
    "ai_temp_notes",
    "updated_at",
    `"updated_at" DATETIME DEFAULT CURRENT_TIMESTAMP`
  );

  // children
  await ensureColumn(db, "children", "name", `"name" TEXT`);
  await ensureColumn(db, "children", "notes", `"notes" TEXT`);
  await ensureColumn(db, "children", "notes2", `"notes2" TEXT`);
  await ensureColumn(db, "children", "personal_tmp", `"personal_tmp" TEXT`);
  await ensureColumn(db, "children", "pronunciation_id", `"pronunciation_id" INTEGER`);
  await ensureColumn(db, "children", "children_type_id", `"children_type_id" INTEGER DEFAULT 1`);
  await ensureColumn(db, "children", "is_delete", `"is_delete" INTEGER DEFAULT 0`);
  await ensureColumn(db, "children", "leaving_at", `"leaving_at" TEXT`);

  // children_type
  await ensureColumn(db, "children_type", "name", `"name" TEXT`);

  // pronunciation
  await ensureColumn(db, "pronunciation", "pronunciation", `"pronunciation" TEXT`);

  // day_of_week
  await ensureColumn(db, "day_of_week", "label_jp", `"label_jp" TEXT`);
  await ensureColumn(db, "day_of_week", "label_en", `"label_en" TEXT`);
  await ensureColumn(db, "day_of_week", "sort_order", `"sort_order" INTEGER`);

  // facilitys
  await ensureColumn(db, "facilitys", "name", `"name" TEXT`);
  await ensureColumn(db, "facilitys", "url", `"url" TEXT`);

  // facility_children
  await ensureColumn(db, "facility_children", "facility_id", `"facility_id" INTEGER`);
  await ensureColumn(db, "facility_children", "children_id", `"children_id" INTEGER`);

  // facility_staff
  await ensureColumn(db, "facility_staff", "facility_id", `"facility_id" INTEGER`);
  await ensureColumn(db, "facility_staff", "staff_id", `"staff_id" INTEGER`);

  // staffs
  await ensureColumn(db, "staffs", "name", `"name" TEXT`);
  await ensureColumn(db, "staffs", "work_style", `"work_style" TEXT`);
  await ensureColumn(db, "staffs", "notes", `"notes" TEXT`);
  await ensureColumn(db, "staffs", "is_delete", `"is_delete" INTEGER DEFAULT 0`);
  await ensureColumn(db, "staffs", "admin", `"admin" INTEGER`);
  await ensureColumn(db, "staffs", "display_order", `"display_order" INTEGER`);
  await ensureColumn(db, "staffs", "entered_at", `"entered_at" TEXT`);
  await ensureColumn(db, "staffs", "leaving_at", `"leaving_at" TEXT`);
  await ensureColumn(db, "staffs", "hug_updated_at", `"hug_updated_at" TEXT`);
  await ensureColumn(db, "staffs", "hug_updated_by", `"hug_updated_by" TEXT`);

  // staff_facility_roles
  await ensureColumn(db, "staff_facility_roles", "staff_id", `"staff_id" INTEGER`);
  await ensureColumn(db, "staff_facility_roles", "facility_id", `"facility_id" INTEGER`);
  await ensureColumn(db, "staff_facility_roles", "job_name", `"job_name" TEXT`);
  await ensureColumn(db, "staff_facility_roles", "experience_label", `"experience_label" TEXT`);
  await ensureColumn(db, "staff_facility_roles", "role_note", `"role_note" TEXT`);
  await ensureColumn(db, "staff_facility_roles", "raw_text", `"raw_text" TEXT`);
  await ensureColumn(
    db,
    "staff_facility_roles",
    "created_at",
    `"created_at" DATETIME DEFAULT CURRENT_TIMESTAMP`
  );
  await ensureColumn(
    db,
    "staff_facility_roles",
    "updated_at",
    `"updated_at" DATETIME DEFAULT CURRENT_TIMESTAMP`
  );

  // managers2
  await ensureColumn(db, "managers2", "children_id", `"children_id" INTEGER`);
  await ensureColumn(db, "managers2", "staff_id", `"staff_id" INTEGER`);
  await ensureColumn(db, "managers2", "day_of_week_id", `"day_of_week_id" INTEGER`);
  await ensureColumn(db, "managers2", "priority", `"priority" INTEGER DEFAULT 0`);

  // pc
  await ensureColumn(db, "pc", "facility_id", `"facility_id" INTEGER`);
  await ensureColumn(db, "pc", "pc_id", `"pc_id" INTEGER`);
  await ensureColumn(db, "pc", "name", `"name" TEXT`);
  await ensureColumn(db, "pc", "explanation", `"explanation" TEXT`);
  await ensureColumn(db, "pc", "memo", `"memo" TEXT`);

  // pc_to_children
  await ensureColumn(db, "pc_to_children", "pc_id", `"pc_id" INTEGER`);
  await ensureColumn(db, "pc_to_children", "children_id", `"children_id" INTEGER`);
  await ensureColumn(db, "pc_to_children", "day_of_week", `"day_of_week" INTEGER`);
  await ensureColumn(db, "pc_to_children", "start_time", `"start_time" TEXT`);
  await ensureColumn(db, "pc_to_children", "end_time", `"end_time" TEXT`);

  // record_types
  await ensureColumn(db, "record_types", "name", `"name" TEXT`);
  await ensureColumn(db, "record_types", "memo", `"memo" TEXT`);

  // child_records
  await ensureColumn(db, "child_records", "children_id", `"children_id" INTEGER`);
  await ensureColumn(db, "child_records", "record_type_id", `"record_type_id" INTEGER`);
  await ensureColumn(db, "child_records", "date", `"date" TEXT`);
  await ensureColumn(db, "child_records", "score", `"score" INTEGER`);
  await ensureColumn(db, "child_records", "mistakes", `"mistakes" INTEGER`);
  await ensureColumn(db, "child_records", "facility_id", `"facility_id" INTEGER`);
  await ensureColumn(db, "child_records", "memo1", `"memo1" TEXT`);
  await ensureColumn(db, "child_records", "memo2", `"memo2" TEXT`);
  await ensureColumn(
    db,
    "child_records",
    "created_at",
    `"created_at" DATETIME DEFAULT CURRENT_TIMESTAMP`
  );
  await ensureColumn(
    db,
    "child_records",
    "updated_at",
    `"updated_at" DATETIME DEFAULT CURRENT_TIMESTAMP`
  );

  // m_service_items
  await ensureColumn(db, "m_service_items", "name", `"name" TEXT`);

  // service_record
  await ensureColumn(db, "service_record", "children_id", `"children_id" INTEGER`);
  await ensureColumn(db, "service_record", "day_of_week_id", `"day_of_week_id" INTEGER`);
  await ensureColumn(db, "service_record", "item_id", `"item_id" INTEGER`);
  await ensureColumn(db, "service_record", "served_date", `"served_date" TEXT`);
  await ensureColumn(db, "service_record", "facility_id", `"facility_id" INTEGER`);
  await ensureColumn(db, "service_record", "note", `"note" TEXT`);
  await ensureColumn(db, "service_record", "is_copy", `"is_copy" INTEGER DEFAULT 0`);
  await ensureColumn(db, "service_record", "is_deleted", `"is_deleted" INTEGER DEFAULT 0`);
  await ensureColumn(db, "service_record", "recorded_staff_id", `"recorded_staff_id" INTEGER DEFAULT -1`);
  await ensureColumn(
    db,
    "service_record",
    "created_at",
    `"created_at" DATETIME DEFAULT CURRENT_TIMESTAMP`
  );
  await ensureColumn(db, "service_record", "updated_staff_id", `"updated_staff_id" INTEGER DEFAULT -1`);
  await ensureColumn(
    db,
    "service_record",
    "updated_at",
    `"updated_at" DATETIME DEFAULT CURRENT_TIMESTAMP`
  );

  // memo
  await ensureColumn(db, "memo", "title", `"title" TEXT`);
  await ensureColumn(db, "memo", "content", `"content" TEXT`);

  // text_data
  await ensureColumn(db, "text_data", "genre", `"genre" TEXT`);
  await ensureColumn(db, "text_data", "group", `"group" TEXT`);
  await ensureColumn(db, "text_data", "sort", `"sort" INTEGER`);
  await ensureColumn(db, "text_data", "value", `"value" TEXT`);

  // toolbox
  await ensureColumn(db, "toolbox", "title", `"title" TEXT`);
  await ensureColumn(db, "toolbox", "description", `"description" TEXT`);
  await ensureColumn(db, "toolbox", "layout", `"layout" TEXT`);
  await ensureColumn(db, "toolbox", "is_tools", `"is_tools" INTEGER DEFAULT 1`);
  await ensureColumn(
    db,
    "toolbox",
    "created_at",
    `"created_at" DATETIME DEFAULT CURRENT_TIMESTAMP`
  );
  await ensureColumn(
    db,
    "toolbox",
    "updated_at",
    `"updated_at" DATETIME DEFAULT CURRENT_TIMESTAMP`
  );
  await ensureColumn(db, "toolbox", "permission", `"permission" INTEGER DEFAULT 0`);
  await ensureColumn(db, "toolbox", "facility_id", `"facility_id" INTEGER`);

  // users
  await ensureColumn(db, "users", "name", `"name" TEXT`);
  await ensureColumn(db, "users", "email", `"email" TEXT`);
  await ensureColumn(db, "users", "password", `"password" TEXT`);
  await ensureColumn(
    db,
    "users",
    "created_at",
    `"created_at" DATETIME DEFAULT CURRENT_TIMESTAMP`
  );
  await ensureColumn(db, "users", "leaving_at", `"leaving_at" TEXT`);

  // refresh_tokens
  await ensureColumn(db, "refresh_tokens", "user_id", `"user_id" INTEGER`);
  await ensureColumn(db, "refresh_tokens", "token", `"token" TEXT`);
  await ensureColumn(db, "refresh_tokens", "revoked", `"revoked" INTEGER DEFAULT 0`);
  await ensureColumn(db, "refresh_tokens", "expires_at", `"expires_at" DATETIME`);
  await ensureColumn(
    db,
    "refresh_tokens",
    "created_at",
    `"created_at" DATETIME DEFAULT CURRENT_TIMESTAMP`
  );

  // individual_support
  await ensureColumn(db, "individual_support", "family_intention", `"family_intention" TEXT`);
  await ensureColumn(db, "individual_support", "support_policy", `"support_policy" TEXT`);
  await ensureColumn(db, "individual_support", "long_term_goal", `"long_term_goal" TEXT`);
  await ensureColumn(db, "individual_support", "short_term_goal", `"short_term_goal" TEXT`);
  await ensureColumn(db, "individual_support", "support_date", `"support_date" TEXT`);
  await ensureColumn(
    db,
    "individual_support",
    "created_at",
    `"created_at" DATETIME DEFAULT CURRENT_TIMESTAMP`
  );
  await ensureColumn(
    db,
    "individual_support",
    "updated_at",
    `"updated_at" DATETIME DEFAULT CURRENT_TIMESTAMP`
  );

  // temp_notes
  await ensureColumn(db, "temp_notes", "children_id", `"children_id" INTEGER`);
  await ensureColumn(db, "temp_notes", "staff_id", `"staff_id" INTEGER`);
  await ensureColumn(db, "temp_notes", "day_of_week_id", `"day_of_week_id" INTEGER`);
  await ensureColumn(db, "temp_notes", "memo1", `"memo1" TEXT`);
  await ensureColumn(db, "temp_notes", "memo2", `"memo2" TEXT`);
  await ensureColumn(
    db,
    "temp_notes",
    "created_at",
    `"created_at" DATETIME DEFAULT CURRENT_TIMESTAMP`
  );
  await ensureColumn(
    db,
    "temp_notes",
    "updated_at",
    `"updated_at" DATETIME DEFAULT CURRENT_TIMESTAMP`
  );
}

/**
 * INDEX / UNIQUE INDEX 作成
 *
 * 既存DBに重複データがあると UNIQUE INDEX 作成に失敗する。
 * その場合でもアプリ起動を止めないように warning にする。
 */
async function createIndexes(db) {
  await tryRunSql(
    db,
    `
      CREATE UNIQUE INDEX IF NOT EXISTS "idx_ai_temp_notes_children_id"
      ON "ai_temp_notes" ("children_id")
    `,
    "idx_ai_temp_notes_children_id"
  );

  await tryRunSql(
    db,
    `
      CREATE UNIQUE INDEX IF NOT EXISTS "idx_temp_notes_children_day"
      ON "temp_notes" ("children_id", "day_of_week_id")
    `,
    "idx_temp_notes_children_day"
  );

  await tryRunSql(
    db,
    `
      CREATE UNIQUE INDEX IF NOT EXISTS "idx_facility_children_ids"
      ON "facility_children" ("facility_id", "children_id")
    `,
    "idx_facility_children_ids"
  );

  await tryRunSql(
    db,
    `
      CREATE UNIQUE INDEX IF NOT EXISTS "idx_facility_staff_ids"
      ON "facility_staff" ("facility_id", "staff_id")
    `,
    "idx_facility_staff_ids"
  );

  await tryRunSql(
    db,
    `
      CREATE UNIQUE INDEX IF NOT EXISTS "idx_managers2_ids"
      ON "managers2" ("children_id", "staff_id", "day_of_week_id")
    `,
    "idx_managers2_ids"
  );

  await tryRunSql(
    db,
    `
      CREATE UNIQUE INDEX IF NOT EXISTS "idx_pc_facility_pc_id"
      ON "pc" ("facility_id", "pc_id")
    `,
    "idx_pc_facility_pc_id"
  );

  await tryRunSql(
    db,
    `
      CREATE UNIQUE INDEX IF NOT EXISTS "idx_service_record_unique"
      ON "service_record" ("children_id", "day_of_week_id", "item_id", "served_date")
    `,
    "idx_service_record_unique"
  );

  await tryRunSql(
    db,
    `
      CREATE UNIQUE INDEX IF NOT EXISTS "idx_staff_facility_roles_unique"
      ON "staff_facility_roles" ("staff_id", "facility_id", "job_name", "experience_label")
    `,
    "idx_staff_facility_roles_unique"
  );

  await tryRunSql(
    db,
    `
      CREATE UNIQUE INDEX IF NOT EXISTS "idx_users_email"
      ON "users" ("email")
    `,
    "idx_users_email"
  );

  await tryRunSql(
    db,
    `
      CREATE INDEX IF NOT EXISTS "idx_pc_to_children_children_id"
      ON "pc_to_children" ("children_id")
    `,
    "idx_pc_to_children_children_id"
  );

  await tryRunSql(
    db,
    `
      CREATE INDEX IF NOT EXISTS "idx_pc_to_children_pc_id"
      ON "pc_to_children" ("pc_id")
    `,
    "idx_pc_to_children_pc_id"
  );

  await tryRunSql(
    db,
    `
      CREATE INDEX IF NOT EXISTS "idx_child_records_children_id"
      ON "child_records" ("children_id")
    `,
    "idx_child_records_children_id"
  );

  await tryRunSql(
    db,
    `
      CREATE INDEX IF NOT EXISTS "idx_child_records_record_type_id"
      ON "child_records" ("record_type_id")
    `,
    "idx_child_records_record_type_id"
  );

  await tryRunSql(
    db,
    `
      CREATE INDEX IF NOT EXISTS "idx_child_records_facility_id"
      ON "child_records" ("facility_id")
    `,
    "idx_child_records_facility_id"
  );

  await tryRunSql(
    db,
    `
      CREATE INDEX IF NOT EXISTS "idx_service_record_item_id"
      ON "service_record" ("item_id")
    `,
    "idx_service_record_item_id"
  );

  await tryRunSql(
    db,
    `
      CREATE INDEX IF NOT EXISTS "idx_service_record_facility_id"
      ON "service_record" ("facility_id")
    `,
    "idx_service_record_facility_id"
  );

  await tryRunSql(
    db,
    `
      CREATE INDEX IF NOT EXISTS "idx_refresh_tokens_user_id"
      ON "refresh_tokens" ("user_id")
    `,
    "idx_refresh_tokens_user_id"
  );

  await tryRunSql(
    db,
    `
      CREATE INDEX IF NOT EXISTS "idx_toolbox_facility_id"
      ON "toolbox" ("facility_id")
    `,
    "idx_toolbox_facility_id"
  );
}

/**
 * 曜日マスタ初期データ
 *
 * MariaDB 側の day_of_week と合わせる。
 */
async function seedDayOfWeek(db) {
  const rows = [
    [1, "月", "monday", 1],
    [2, "火", "tuesday", 2],
    [3, "水", "wednesday", 3],
    [4, "木", "thursday", 4],
    [5, "金", "friday", 5],
    [6, "土", "saturday", 6],
    [7, "日", "sunday", 7],
  ];

  for (const row of rows) {
    await runSql(
      db,
      `
        INSERT OR IGNORE INTO "day_of_week"
          ("id", "label_jp", "label_en", "sort_order")
        VALUES (?, ?, ?, ?)
      `,
      row
    );
  }
}

/**
 * SQLite データベース初期化
 */
function initializeDatabase() {
  const dbPath = getDbPath();
  const dir = path.dirname(dbPath);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const db = new sqlite3.Database(dbPath);

  db.serialize(() => {
    (async () => {
      try {
        await execSql(
          db,
          `
            PRAGMA journal_mode = WAL;
            PRAGMA foreign_keys = OFF;
          `
        );

        await migrateLegacyDayOfWeekIfNeeded(db);
        await execSql(db, INIT_SQL);
        await migrateExistingDatabase(db);
        await createIndexes(db);
        await seedDayOfWeek(db);

        console.log("[initDatabase] database initialized:", dbPath);
      } catch (err) {
        console.error("[initDatabase] error:", err);
      } finally {
        db.close((closeErr) => {
          if (closeErr) {
            console.error("[initDatabase] DB close error:", closeErr);
          }
        });
      }
    })();
  });
}

module.exports = { initializeDatabase };