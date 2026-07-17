// main/parts/handlers/sqliteHandler/initDatabase/schema.js

/**
 * SQLite 初期テーブル定義
 *
 * 方針:
 * - MariaDB の主要テーブルを SQLite キャッシュとして作る
 * - 一時フォールバック用途なので、FK は厳密には張らず、PK / UNIQUE / INDEX を中心にする
 */
const INIT_SQL = `
BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS "children_type" (
	"id"	INTEGER NOT NULL,
	"name"	TEXT NOT NULL DEFAULT '0',
	PRIMARY KEY("id")
);
CREATE TABLE IF NOT EXISTS "pronunciation" (
	"id"	INTEGER NOT NULL,
	"pronunciation"	TEXT NOT NULL,
	PRIMARY KEY("id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "day_of_week" (
	"id"	INTEGER NOT NULL,
	"label_jp"	TEXT NOT NULL,
	"label_en"	TEXT DEFAULT NULL,
	"sort_order"	INTEGER NOT NULL,
	PRIMARY KEY("id")
);
CREATE TABLE IF NOT EXISTS "facilitys" (
	"id"	INTEGER NOT NULL,
	"name"	TEXT DEFAULT NULL,
	"url"	TEXT DEFAULT NULL,
	PRIMARY KEY("id")
);
CREATE TABLE IF NOT EXISTS "staffs" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "login_id" TEXT DEFAULT NULL,
    "password_hash" TEXT DEFAULT NULL,
    "work_style" TEXT DEFAULT NULL,
    "notes" TEXT DEFAULT '',
    "is_delete" INTEGER NOT NULL DEFAULT 0,
    "role_id" INTEGER NOT NULL DEFAULT 0,
    "display_order" INTEGER DEFAULT NULL,
    "entered_at" TEXT DEFAULT NULL,
    "leaving_at" TEXT DEFAULT NULL,
    "hug_updated_at" TEXT DEFAULT NULL,
    "hug_updated_by" TEXT DEFAULT NULL,
    "created_at" TEXT DEFAULT NULL,
    "updated_at" TEXT DEFAULT NULL,
    PRIMARY KEY("id"),
    UNIQUE("login_id")
);
CREATE TABLE IF NOT EXISTS "record_types" (
	"id"	INTEGER NOT NULL,
	"name"	TEXT NOT NULL,
	"memo"	TEXT DEFAULT NULL,
	PRIMARY KEY("id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "m_service_items" (
	"id"	INTEGER NOT NULL,
	"name"	TEXT NOT NULL DEFAULT '',
	PRIMARY KEY("id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "text_data" (
	"id"	INTEGER NOT NULL,
	"genre"	TEXT NOT NULL,
	"group"	TEXT NOT NULL,
	"sort"	INTEGER NOT NULL,
	"value"	TEXT NOT NULL,
	PRIMARY KEY("id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "children" (
	"id"	INTEGER NOT NULL,
	"name"	TEXT NOT NULL,
	"furigana"	TEXT DEFAULT NULL,
	"notes"	TEXT DEFAULT NULL,
	"notes2"	TEXT DEFAULT NULL,
	"personal_tmp"	TEXT DEFAULT NULL,
	"pronunciation_id"	INTEGER DEFAULT NULL,
	"children_type_id"	INTEGER NOT NULL DEFAULT 1,
	"is_delete"	INTEGER NOT NULL DEFAULT 0,
	"leaving_at"	TEXT DEFAULT NULL,
	PRIMARY KEY("id"),
	CONSTRAINT "FK_children_children_type" FOREIGN KEY("children_type_id") REFERENCES "children_type"("id") ON DELETE CASCADE,
	CONSTRAINT "FK_children_pronunciation" FOREIGN KEY("pronunciation_id") REFERENCES "pronunciation"("id") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "pc" (
	"id"	INTEGER NOT NULL,
	"facility_id"	INTEGER NOT NULL,
	"pc_id"	INTEGER NOT NULL,
	"name"	TEXT NOT NULL DEFAULT '',
	"explanation"	TEXT DEFAULT NULL,
	"memo"	TEXT DEFAULT NULL,
	PRIMARY KEY("id" AUTOINCREMENT),
	UNIQUE("facility_id","pc_id"),
	CONSTRAINT "FK_pc_facilitys" FOREIGN KEY("facility_id") REFERENCES "facilitys"("id") ON DELETE NO ACTION
);
CREATE TABLE IF NOT EXISTS "facility_children" (
	"facility_id"	INTEGER NOT NULL,
	"children_id"	INTEGER NOT NULL,
	PRIMARY KEY("facility_id","children_id"),
	CONSTRAINT "FK__facility" FOREIGN KEY("facility_id") REFERENCES "facilitys"("id") ON DELETE CASCADE,
	CONSTRAINT "FK__childrens" FOREIGN KEY("children_id") REFERENCES "children"("id") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "facility_staff" (
	"facility_id"	INTEGER NOT NULL,
	"staff_id"	INTEGER NOT NULL,
	PRIMARY KEY("facility_id","staff_id"),
	CONSTRAINT "FK_facility_staff_facilitys" FOREIGN KEY("facility_id") REFERENCES "facilitys"("id") ON DELETE CASCADE,
	CONSTRAINT "FK_facility_staff_staffs" FOREIGN KEY("staff_id") REFERENCES "staffs"("id") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "staff_facility_roles" (
	"id"	INTEGER NOT NULL,
	"staff_id"	INTEGER NOT NULL,
	"facility_id"	INTEGER NOT NULL,
	"job_name"	TEXT NOT NULL,
	"experience_label"	TEXT DEFAULT NULL,
	"role_note"	TEXT DEFAULT NULL,
	"raw_text"	TEXT DEFAULT NULL,
	"created_at"	TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"updated_at"	TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY("id" AUTOINCREMENT),
	UNIQUE("staff_id","facility_id","job_name","experience_label"),
	CONSTRAINT "fk_staff_facility_roles_staffs" FOREIGN KEY("staff_id") REFERENCES "staffs"("id") ON DELETE CASCADE,
	CONSTRAINT "fk_staff_facility_roles_facilitys" FOREIGN KEY("facility_id") REFERENCES "facilitys"("id") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "managers2" (
	"children_id"	INTEGER NOT NULL,
	"facility_id"	INTEGER NOT NULL,
	"staff_id"	INTEGER NOT NULL,
	"day_of_week_id"	INTEGER NOT NULL,
	"priority"	INTEGER NOT NULL DEFAULT 0,
	"support_start_time"	TEXT DEFAULT NULL,
	"support_end_time"	TEXT DEFAULT NULL,
	PRIMARY KEY("children_id","facility_id","staff_id","day_of_week_id"),
	CONSTRAINT "FK_managers2_children" FOREIGN KEY("children_id") REFERENCES "children"("id") ON DELETE CASCADE,
	CONSTRAINT "FK_managers2_facilitys" FOREIGN KEY("facility_id") REFERENCES "facilitys"("id") ON DELETE CASCADE,
	CONSTRAINT "FK_managers2_staffs" FOREIGN KEY("staff_id") REFERENCES "staffs"("id") ON DELETE CASCADE,
	CONSTRAINT "FK_managers2_day_of_week" FOREIGN KEY("day_of_week_id") REFERENCES "day_of_week"("id") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "pc_to_children" (
	"id"	INTEGER NOT NULL,
	"pc_id"	INTEGER NOT NULL,
	"children_id"	INTEGER NOT NULL,
	"day_of_week"	INTEGER DEFAULT NULL,
	"start_time"	TEXT DEFAULT NULL,
	"end_time"	TEXT DEFAULT NULL,
	PRIMARY KEY("id" AUTOINCREMENT),
	CONSTRAINT "FK_pc_to_children_day_of_week" FOREIGN KEY("day_of_week") REFERENCES "day_of_week"("id") ON DELETE CASCADE,
	CONSTRAINT "FK__childrenpc" FOREIGN KEY("children_id") REFERENCES "children"("id") ON DELETE CASCADE,
	CONSTRAINT "FK__pc" FOREIGN KEY("pc_id") REFERENCES "pc"("id") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "temp_notes" (
	"children_id"	INTEGER NOT NULL,
	"staff_id"	INTEGER NOT NULL,
	"day_of_week_id"	INTEGER NOT NULL DEFAULT 0,
	"memo1"	TEXT DEFAULT NULL,
	"memo2"	TEXT DEFAULT NULL,
	"created_at"	TEXT DEFAULT CURRENT_TIMESTAMP,
	"updated_at"	TEXT DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY("children_id","staff_id","day_of_week_id"),
	CONSTRAINT "FK_temp_notes_staffs" FOREIGN KEY("staff_id") REFERENCES "staffs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
	CONSTRAINT "FK_temp_notes_day_of_week" FOREIGN KEY("day_of_week_id") REFERENCES "day_of_week"("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
	CONSTRAINT "FK_temp_notes_children" FOREIGN KEY("children_id") REFERENCES "children"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
);
CREATE TABLE IF NOT EXISTS "child_records" (
	"id"	INTEGER NOT NULL,
	"children_id"	INTEGER NOT NULL,
	"record_type_id"	INTEGER NOT NULL,
	"date"	TEXT NOT NULL,
	"score"	INTEGER DEFAULT NULL,
	"mistakes"	INTEGER DEFAULT NULL,
	"facility_id"	INTEGER NOT NULL,
	"memo1"	TEXT DEFAULT NULL,
	"memo2"	TEXT DEFAULT NULL,
	"created_at"	TEXT DEFAULT CURRENT_TIMESTAMP,
	"updated_at"	TEXT DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY("id" AUTOINCREMENT),
	CONSTRAINT "FK_child_records_facilitys" FOREIGN KEY("facility_id") REFERENCES "facilitys"("id") ON DELETE CASCADE,
	CONSTRAINT "FK_child_records_record_types" FOREIGN KEY("record_type_id") REFERENCES "record_types"("id") ON DELETE CASCADE,
	CONSTRAINT "FK_child_records_children" FOREIGN KEY("children_id") REFERENCES "children"("id") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "service_record" (
	"id"	INTEGER NOT NULL,
	"children_id"	INTEGER NOT NULL,
	"day_of_week_id"	INTEGER NOT NULL,
	"item_id"	INTEGER NOT NULL,
	"served_date"	TEXT NOT NULL,
	"facility_id"	INTEGER NOT NULL,
	"note"	TEXT DEFAULT NULL,
	"is_copy"	INTEGER NOT NULL DEFAULT 0,
	"is_deleted"	INTEGER NOT NULL DEFAULT 0,
	"recorded_staff_id"	INTEGER NOT NULL DEFAULT -1,
	"created_at"	TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"updated_staff_id"	INTEGER NOT NULL DEFAULT -1,
	"updated_at"	TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY("id" AUTOINCREMENT),
	UNIQUE("children_id","day_of_week_id","item_id","served_date"),
	CONSTRAINT "FK_service_record_day_of_week" FOREIGN KEY("day_of_week_id") REFERENCES "day_of_week"("id") ON DELETE CASCADE,
	CONSTRAINT "service_record_ibfk_1" FOREIGN KEY("item_id") REFERENCES "m_service_items"("id") ON DELETE CASCADE,
	CONSTRAINT "FK_service_record_facilitys" FOREIGN KEY("facility_id") REFERENCES "facilitys"("id") ON DELETE CASCADE,
	CONSTRAINT "FK_service_record_children" FOREIGN KEY("children_id") REFERENCES "children"("id") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "refresh_tokens" (
    "id" INTEGER NOT NULL,
    "staff_id" INTEGER NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TEXT NOT NULL,
    "revoked_at" TEXT DEFAULT NULL,
    "created_at" TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY("id" AUTOINCREMENT),
    UNIQUE("token_hash"),
    CONSTRAINT "fk_refresh_tokens_staff"
        FOREIGN KEY("staff_id")
        REFERENCES "staffs"("id")
        ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "toolbox" (
	"id"	INTEGER NOT NULL,
	"title"	TEXT NOT NULL,
	"description"	TEXT DEFAULT NULL,
	"layout"	TEXT NOT NULL CHECK(json_valid("layout")),
	"is_tools"	INTEGER NOT NULL DEFAULT 1,
	"created_at"	TEXT DEFAULT CURRENT_TIMESTAMP,
	"updated_at"	TEXT DEFAULT CURRENT_TIMESTAMP,
	"permission"	INTEGER NOT NULL DEFAULT 0,
	"facility_id"	INTEGER NOT NULL,
	PRIMARY KEY("id" AUTOINCREMENT),
	CONSTRAINT "FK_toolbox_facilitys" FOREIGN KEY("facility_id") REFERENCES "facilitys"("id") ON UPDATE CASCADE
);
CREATE TABLE IF NOT EXISTS "individual_support" (
	"children_id"	INTEGER,
	"family_intention"	TEXT,
	"support_policy"	TEXT,
	"long_term_goal"	TEXT,
	"short_term_goal"	TEXT,
	"support_date"	TEXT,
	"created_at"	DATETIME DEFAULT CURRENT_TIMESTAMP,
	"updated_at"	DATETIME DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY("children_id")
);

CREATE INDEX IF NOT EXISTS "idx_children_pronunciation_id"
ON "children" ("pronunciation_id");

CREATE INDEX IF NOT EXISTS "idx_children_children_type_id"
ON "children" ("children_type_id");

CREATE INDEX IF NOT EXISTS "idx_child_records_children_id"
ON "child_records" ("children_id");

CREATE INDEX IF NOT EXISTS "idx_child_records_record_type_id"
ON "child_records" ("record_type_id");

CREATE INDEX IF NOT EXISTS "idx_child_records_facility_id"
ON "child_records" ("facility_id");

CREATE INDEX IF NOT EXISTS "idx_facility_children_children_id"
ON "facility_children" ("children_id");

CREATE INDEX IF NOT EXISTS "idx_facility_staff_staff_id"
ON "facility_staff" ("staff_id");

CREATE INDEX IF NOT EXISTS "idx_managers2_staff_id"
ON "managers2" ("staff_id");

CREATE INDEX IF NOT EXISTS "idx_managers2_day_of_week_id"
ON "managers2" ("day_of_week_id");

CREATE INDEX IF NOT EXISTS "idx_managers2_facility_id"
ON "managers2" ("facility_id");

CREATE INDEX IF NOT EXISTS "idx_pc_facility_id"
ON "pc" ("facility_id");

CREATE INDEX IF NOT EXISTS "idx_pc_to_children_children_id"
ON "pc_to_children" ("children_id");

CREATE INDEX IF NOT EXISTS "idx_pc_to_children_pc_id"
ON "pc_to_children" ("pc_id");

CREATE INDEX IF NOT EXISTS "idx_pc_to_children_day_of_week"
ON "pc_to_children" ("day_of_week");

CREATE INDEX IF NOT EXISTS "idx_refresh_tokens_staff_id"
ON "refresh_tokens" ("staff_id");

CREATE INDEX IF NOT EXISTS "idx_refresh_tokens_expires_at"
ON "refresh_tokens" ("expires_at");

CREATE INDEX IF NOT EXISTS "idx_refresh_tokens_revoked_at"
ON "refresh_tokens" ("revoked_at");

CREATE INDEX IF NOT EXISTS "idx_staffs_role_id"
ON "staffs" ("role_id");

CREATE INDEX IF NOT EXISTS "idx_service_record_item_id"
ON "service_record" ("item_id");

CREATE INDEX IF NOT EXISTS "idx_service_record_day_of_week_id"
ON "service_record" ("day_of_week_id");

CREATE INDEX IF NOT EXISTS "idx_service_record_facility_id"
ON "service_record" ("facility_id");

CREATE INDEX IF NOT EXISTS "idx_staff_facility_roles_staff_id"
ON "staff_facility_roles" ("staff_id");

CREATE INDEX IF NOT EXISTS "idx_staff_facility_roles_facility_id"
ON "staff_facility_roles" ("facility_id");

CREATE INDEX IF NOT EXISTS "idx_temp_notes_staff_id"
ON "temp_notes" ("staff_id");

CREATE INDEX IF NOT EXISTS "idx_temp_notes_day_of_week_id"
ON "temp_notes" ("day_of_week_id");

CREATE INDEX IF NOT EXISTS "idx_toolbox_facility_id"
ON "toolbox" ("facility_id");

CREATE INDEX IF NOT EXISTS "idx_temp_notes_children_day_lookup"
ON "temp_notes" ("children_id", "day_of_week_id");

CREATE UNIQUE INDEX IF NOT EXISTS "idx_temp_notes_children_staff_day" ON "temp_notes" ("children_id","staff_id","day_of_week_id");
CREATE UNIQUE INDEX IF NOT EXISTS "idx_facility_children_ids" ON "facility_children" ("facility_id","children_id");
CREATE UNIQUE INDEX IF NOT EXISTS "idx_facility_staff_ids" ON "facility_staff" ("facility_id","staff_id");
CREATE UNIQUE INDEX IF NOT EXISTS "idx_managers2_ids" ON "managers2" ("children_id","facility_id","staff_id","day_of_week_id");
CREATE UNIQUE INDEX IF NOT EXISTS "idx_pc_facility_pc_id" ON "pc" ("facility_id","pc_id");
CREATE UNIQUE INDEX IF NOT EXISTS "idx_service_record_unique" ON "service_record" ("children_id","day_of_week_id","item_id","served_date");
CREATE UNIQUE INDEX IF NOT EXISTS "idx_staff_facility_roles_unique" ON "staff_facility_roles" ("staff_id","facility_id","job_name","experience_label");

COMMIT;
`;

module.exports = { INIT_SQL };