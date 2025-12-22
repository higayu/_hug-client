// main/parts/handlers/sqliteHandler.js
// main/parts/handlers/sqliteHandler.js
const fs = require("fs");
const path = require("path");
const { getDbPath } = require("../utils/pathResolver");
const { initializeDatabase } = require("../utils/initDatabase");

// DB 初期化
const dbPath = getDbPath();
initializeDatabase();

// 各テーブルモジュール
const {
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
} = {
  children: require("./sqlite/children"),
  staffs: require("./sqlite/staffs"),
  facilitys: require("./sqlite/facilitys"),
  facility_children: require("./sqlite/facility_children"),
  facility_staff: require("./sqlite/facility_staff"),
  managers2: require("./sqlite/managers2"),
  pc: require("./sqlite/pc"),
  pc_to_children: require("./sqlite/pc_to_children"),
  individual_support: require("./sqlite/individual_support"),
  temp_notes: require("./sqlite/temp_notes"),
  pronunciation: require("./sqlite/pronunciation"),
  children_type: require("./sqlite/children_type"),
  ai_temp_notes: require("./sqlite/ai_temp_notes"),
  day_of_week: require("./sqlite/day_of_week"), // ✅ 追加
};

// ============================================================
// 📘 SQLite IPCハンドラ登録（sqlite: プレフィックス付き）
// ============================================================
function registerSqliteHandlers(ipcMain) {
  console.log("🔥 registerSqliteHandlers (sqlite) CALLED");

  const tables = {
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
  };

  // CRUD 共通
  for (const [table, handler] of Object.entries(tables)) {
    if (handler.getAll) {
      ipcMain.handle(`sqlite:${table}:getAll`, async () => handler.getAll());
    }

    if (handler.getById) {
      ipcMain.handle(`sqlite:${table}:getById`, async (_, id) =>
        handler.getById(id)
      );
    }

    if (handler.insert) {
      ipcMain.handle(`sqlite:${table}:insert`, async (_, data) =>
        handler.insert(data)
      );
    }

    if (handler.update) {
      ipcMain.handle(
        `sqlite:${table}:update`,
        async (_, idOrData, maybeData) => {
          if (maybeData !== undefined) {
            return handler.update(idOrData, maybeData);
          } else {
            return handler.update(idOrData);
          }
        }
      );
    }

    if (handler.delete) {
      ipcMain.handle(`sqlite:${table}:delete`, async (_, ...args) =>
        handler.delete(...args)
      );
    }
  }

  // ============================================================
  // 🟢 ai_temp_notes（SQLite 専用）
  // ============================================================

  ipcMain.handle("sqlite:saveAiTempNote", async (_, { childId, note }) => {
    try {
      return await ai_temp_notes.saveAiTempNote(childId, note);
    } catch (err) {
      console.error("❌ SQLite saveAiTempNote エラー:", err);
      throw err;
    }
  });

  ipcMain.handle("sqlite:getAiTempNote", async (_, { childId }) => {
    try {
      return await ai_temp_notes.getAiTempNote(childId);
    } catch (err) {
      console.error("❌ SQLite getAiTempNote エラー:", err);
      throw err;
    }
  });

  // ============================================================
  // 🟢 temp_notes（SQLite 専用）
  // ============================================================

  ipcMain.handle("sqlite:saveTempNote", async (_, data) => {
    try {
      return await temp_notes.upsert(data);
    } catch (err) {
      console.error("❌ SQLite saveTempNote エラー:", err);
      throw err;
    }
  });

  ipcMain.handle("sqlite:getTempNote", async (_, data) => {
    try {
      const { children_id, staff_id, day_of_week_id } = data;
      const result = await temp_notes.getTempNote(
        children_id,
        staff_id,
        day_of_week_id
      );
      return { success: true, data: result };
    } catch (err) {
      console.error("❌ SQLite getTempNote エラー:", err);
      throw err;
    }
  });
}

module.exports = { registerSqliteHandlers };
