// main/parts/handlers/sqliteHandler.js

const { initializeDatabase } = require("../utils/initDatabase");

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
const ai_temp_notes = require("./sqlite/ai_temp_notes");
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
    ai_temp_notes,
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
  // 🟢 ai_temp_notes（SQLite 専用）
  // ============================================================

  safeHandle(ipcMain, "sqlite:saveAiTempNote", async (_, { childId, note }) => {
    try {
      if (typeof ai_temp_notes.saveAiTempNote === "function") {
        return await ai_temp_notes.saveAiTempNote(childId, note);
      }

      if (typeof ai_temp_notes.saveAiNote === "function") {
        return await ai_temp_notes.saveAiNote(childId, note);
      }

      throw new Error(
        "ai_temp_notes.saveAiTempNote / saveAiNote が見つかりません"
      );
    } catch (err) {
      console.error("❌ SQLite saveAiTempNote エラー:", err);
      throw err;
    }
  });

  safeHandle(ipcMain, "sqlite:getAiTempNote", async (_, { childId }) => {
    try {
      if (typeof ai_temp_notes.getAiTempNote === "function") {
        return await ai_temp_notes.getAiTempNote(childId);
      }

      if (typeof ai_temp_notes.getAiNote === "function") {
        return await ai_temp_notes.getAiNote(childId);
      }

      throw new Error(
        "ai_temp_notes.getAiTempNote / getAiNote が見つかりません"
      );
    } catch (err) {
      console.error("❌ SQLite getAiTempNote エラー:", err);
      throw err;
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