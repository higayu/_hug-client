// main/parts/handlers/sqliteHandler/index.js

const { initializeDatabase } = require("./initDatabase");

// MariaDBからSqliteへデータを同期処理
const { connect } = require("./sqlite/base");

// ============================================================
// DB 初期化
// ============================================================
initializeDatabase();

// ============================================================
// 各テーブルモジュール
// ============================================================

// 既存テーブル
const children = require("./sqlite/children");
const staffs = require("./sqlite/staffs");
const facilitys = require("./sqlite/facilitys");
const facility_children = require("./sqlite/facility_children");
const facility_staff = require("./sqlite/facility_staff");
const managers2 = require("./sqlite/managers2");
const pc = require("./sqlite/pc");
const pc_to_children = require("./sqlite/pc_to_children");
const individual_support = require("./sqlite/individual_support");
const temp_notes = require("./sqlite/temp_notes");
const pronunciation = require("./sqlite/pronunciation");
const children_type = require("./sqlite/children_type");
const day_of_week = require("./sqlite/day_of_week");

// MariaDB 追加テーブル / SQLite フォールバック用
const record_types = require("./sqlite/record_types");
const child_records = require("./sqlite/child_records");
const m_service_items = require("./sqlite/m_service_items");
const service_record = require("./sqlite/service_record");
const staff_facility_roles = require("./sqlite/staff_facility_roles");
const text_data = require("./sqlite/text_data");
const toolbox = require("./sqlite/toolbox");
const memo = require("./sqlite/memo");

// ============================================================
// IPC 重複登録防止
// ============================================================

const registeredChannels = new Set();

function safeHandle(ipcMain, channel, handler) {
  if (registeredChannels.has(channel)) {
    console.warn(`⚠️ SQLite IPC handler already registered: ${channel}`);
    return;
  }

  ipcMain.handle(channel, handler);
  registeredChannels.add(channel);
}

// ============================================================
// SQLite Promise Helper
// ============================================================

function runSql(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);

      resolve({
        lastID: this.lastID,
        changes: this.changes,
      });
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

function closeDb(db) {
  return new Promise((resolve) => {
    if (!db) return resolve();

    db.close((err) => {
      if (err) {
        console.error("❌ SQLite close error:", err);
      }
      resolve();
    });
  });
}

async function getTableColumns(db, tableName) {
  const rows = await allSql(db, `PRAGMA table_info("${tableName}");`);
  return rows.map((row) => row.name);
}

function normalizeSyncValue(tableName, columnName, value) {
  if (value === undefined) return null;

  // day_of_week.days は getAll 側で配列に戻しているため、保存時は JSON 文字列に戻す
  if (
    tableName === "day_of_week" &&
    columnName === "days" &&
    Array.isArray(value)
  ) {
    return JSON.stringify(value);
  }

  // 万が一、配列やオブジェクトが来た場合は JSON 文字列として保存
  if (Array.isArray(value)) {
    return JSON.stringify(value);
  }

  if (value && typeof value === "object") {
    return JSON.stringify(value);
  }

  return value;
}

async function insertRows(db, tableName, rows) {
  if (!Array.isArray(rows)) {
    return {
      table: tableName,
      skipped: true,
      reason: "payload is not array",
    };
  }

  const tableColumns = await getTableColumns(db, tableName);

  if (!tableColumns || tableColumns.length === 0) {
    return {
      table: tableName,
      skipped: true,
      reason: "table not found or no columns",
    };
  }

  if (rows.length === 0) {
    return {
      table: tableName,
      inserted: 0,
    };
  }

  let inserted = 0;

  for (const row of rows) {
    if (!row || typeof row !== "object") continue;

    // SQLiteに実在するカラムだけ INSERT 対象にする
    const insertColumns = tableColumns.filter((columnName) =>
      Object.prototype.hasOwnProperty.call(row, columnName)
    );

    if (insertColumns.length === 0) {
      console.warn(`⚠️ ${tableName}: INSERT可能なカラムがありません`, row);
      continue;
    }

    const columnSql = insertColumns.map((col) => `"${col}"`).join(", ");
    const placeholders = insertColumns.map(() => "?").join(", ");

    const values = insertColumns.map((col) =>
      normalizeSyncValue(tableName, col, row[col])
    );

    const sql = `
      INSERT OR REPLACE INTO "${tableName}" (${columnSql})
      VALUES (${placeholders});
    `;

    await runSql(db, sql, values);
    inserted += 1;
  }

  return {
    table: tableName,
    inserted,
  };
}

// ============================================================
// 📘 SQLite IPCハンドラ登録（sqlite: プレフィックス付き）
// ============================================================

function registerSqliteHandlers(ipcMain) {
  console.log("🔥 registerSqliteHandlers (sqlite) CALLED");

  const tables = {
    // 既存テーブル
    children,
    staffs,
    facilitys,
    facility_children,
    facility_staff,
    managers2,
    pc,
    pc_to_children,
    individual_support,
    temp_notes,
    pronunciation,
    children_type,
    day_of_week,

    // MariaDB 追加テーブル / SQLite フォールバック用
    record_types,
    child_records,
    m_service_items,
    service_record,
    staff_facility_roles,
    text_data,
    toolbox,
    memo,
  };

  // databaseSlice から SQLite に同期する対象
  // loading / error / metadata は Redux 管理用なので同期しない
  const syncOrder = [
    // マスタ系
    "children_type",
    "pronunciation",
    "facilitys",
    "staffs",
    "children",
    "day_of_week",
    "pc",

    // MariaDB 追加マスタ系
    "record_types",
    "m_service_items",
    "staff_facility_roles",
    "text_data",
    "toolbox",

    // 関連テーブル
    "facility_staff",
    "facility_children",
    "managers2",
    "pc_to_children",

    // 記録系
    "individual_support",
    "service_record",
    "child_records",
    "memo",

    // temp_notes
     "temp_notes",
  ];

  // ============================================================
  // CRUD 共通
  // ============================================================

  for (const [table, handler] of Object.entries(tables)) {
    if (!handler) {
      console.warn(`⚠️ SQLite handler missing: ${table}`);
      continue;
    }

    if (handler.getAll) {
      safeHandle(ipcMain, `sqlite:${table}:getAll`, async () => {
        return handler.getAll();
      });
    }

    if (handler.getById) {
      safeHandle(ipcMain, `sqlite:${table}:getById`, async (_, id) => {
        return handler.getById(id);
      });
    }

    if (handler.insert) {
      safeHandle(ipcMain, `sqlite:${table}:insert`, async (_, data) => {
        return handler.insert(data);
      });
    }

    if (handler.update) {
      safeHandle(
        ipcMain,
        `sqlite:${table}:update`,
        async (_, idOrData, maybeData) => {
          if (maybeData !== undefined) {
            return handler.update(idOrData, maybeData);
          }

          return handler.update(idOrData);
        }
      );
    }

    if (handler.delete) {
      safeHandle(ipcMain, `sqlite:${table}:delete`, async (_, ...args) => {
        return handler.delete(...args);
      });
    }

    if (handler.upsert) {
      safeHandle(ipcMain, `sqlite:${table}:upsert`, async (_, data) => {
        return handler.upsert(data);
      });
    }

    if (handler.upsert1) {
      safeHandle(ipcMain, `sqlite:${table}:upsert1`, async (_, data) => {
        return handler.upsert1(data);
      });
    }

    if (handler.upsert2) {
      safeHandle(ipcMain, `sqlite:${table}:upsert2`, async (_, data) => {
        return handler.upsert2(data);
      });
    }
  }

  // ============================================================
  // 🟢 databaseSlice 全体を SQLite に同期
  // ============================================================

  safeHandle(ipcMain, "sqlite:database:sync", async (_, databaseState) => {
    const db = connect();

    try {
      if (!databaseState || typeof databaseState !== "object") {
        throw new Error("databaseState が不正です");
      }

      console.log("🔄 SQLite databaseState 同期開始");

      const deleteOrder = [...syncOrder].reverse();

      await runSql(db, "PRAGMA foreign_keys = OFF;");
      await runSql(db, "BEGIN TRANSACTION;");

      // 先に同期対象テーブルを空にする
      for (const tableName of deleteOrder) {
        const rows = databaseState[tableName];

        // databaseState に存在しないものは触らない
        if (!Array.isArray(rows)) {
          console.log(`⏭️ SQLite DELETE skip: ${tableName}`);
          continue;
        }

        console.log(`🧹 SQLite DELETE: ${tableName}`);
        await runSql(db, `DELETE FROM "${tableName}";`);
      }

      const results = [];

      // Redux の databaseState から SQLite へ INSERT
      for (const tableName of syncOrder) {
        const rows = databaseState[tableName];

        // databaseState に存在しないものは触らない
        if (!Array.isArray(rows)) {
          results.push({
            table: tableName,
            skipped: true,
            reason: "databaseState does not have array",
          });
          continue;
        }

        console.log(`📥 SQLite INSERT: ${tableName}`, rows.length);

        const result = await insertRows(db, tableName, rows);
        results.push(result);
      }

      await runSql(db, "COMMIT;");
      await runSql(db, "PRAGMA foreign_keys = ON;");

      console.log("✅ SQLite databaseState 同期完了:", results);

      return {
        success: true,
        results,
      };
    } catch (err) {
      console.error("❌ SQLite databaseState 同期エラー:", err);

      try {
        await runSql(db, "ROLLBACK;");
      } catch (rollbackErr) {
        console.error("❌ SQLite ROLLBACK エラー:", rollbackErr);
      }

      try {
        await runSql(db, "PRAGMA foreign_keys = ON;");
      } catch (pragmaErr) {
        console.error("❌ SQLite foreign_keys ON エラー:", pragmaErr);
      }

      throw err;
    } finally {
      await closeDb(db);
    }
  });

 
  // ============================================================
  // 🟢 temp_notes（SQLite 専用）
  // ============================================================

  safeHandle(ipcMain, "sqlite:saveTempNote", async (_, data) => {
    try {
      const result = await temp_notes.upsert(data);

      return {
        success: true,
        data: result,
      };
    } catch (err) {
      console.error("❌ SQLite saveTempNote エラー:", err);
      throw err;
    }
  });

  safeHandle(ipcMain, "sqlite:saveTempNote1", async (_, data) => {
    try {
      const result = await temp_notes.upsert1(data);

      return {
        success: true,
        data: result,
      };
    } catch (err) {
      console.error("❌ SQLite saveTempNote1 エラー:", err);
      throw err;
    }
  });

  safeHandle(ipcMain, "sqlite:saveTempNote2", async (_, data) => {
    try {
      const result = await temp_notes.upsert2(data);

      return {
        success: true,
        data: result,
      };
    } catch (err) {
      console.error("❌ SQLite saveTempNote2 エラー:", err);
      throw err;
    }
  });

  safeHandle(ipcMain, "sqlite:getTempNote", async (_, data) => {
    try {
      const { children_id, staff_id, day_of_week_id } = data;

      const result = await temp_notes.getTempNote(
        children_id,
        staff_id,
        day_of_week_id
      );

      return {
        success: true,
        data: result,
      };
    } catch (err) {
      console.error("❌ SQLite getTempNote エラー:", err);
      throw err;
    }
  });
}

module.exports = {
  registerSqliteHandlers,
};