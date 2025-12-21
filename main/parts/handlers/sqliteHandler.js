// main/parts/handlers/sqliteHandler.js
const fs = require("fs");
const path = require("path");
const { getDbPath } = require("../utils/pathResolver");
const { initializeDatabase } = require("../utils/initDatabase");

// ✅ デバッグ用ログ
const dbPath = getDbPath();

// DBが存在しない場合は作成＆テーブル構築
initializeDatabase();

// 各テーブルモジュールを読み込み
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
};

// ============================================================
// 📘 SQLite IPCハンドラ登録
// ============================================================
function registerSqliteHandlers(ipcMain) {
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
  };

  for (const [table, handler] of Object.entries(tables)) {
    if (handler.getAll)
      ipcMain.handle(`${table}:getAll`, async () => await handler.getAll());
    if (handler.getById)
      ipcMain.handle(`${table}:getById`, async (_, id) => await handler.getById(id));
    if (handler.insert)
      ipcMain.handle(`${table}:insert`, async (_, data) => await handler.insert(data));
    if (handler.update)
      ipcMain.handle(`${table}:update`, async (_, idOrData, maybeData) => {
        if (maybeData !== undefined) {
          return await handler.update(idOrData, maybeData);
        } else {
          return await handler.update(idOrData);
        }
      });
    if (handler.delete)
      ipcMain.handle(`${table}:delete`, async (_, ...args) => await handler.delete(...args));
  }

  // ============================================================
  // 🟢 ai_temp_notes 専用 IPC ハンドラー
  // ============================================================

  ipcMain.handle("saveAiTempNote", async (_, { childId, note }) => {
    try {
      return await ai_temp_notes.saveAiTempNote(childId, note);
    } catch (err) {
      console.error("❌ SQLite saveAiTempNote エラー:", err);
      throw err;
    }
  });

  ipcMain.handle("getAiTempNote", async (_, { childId }) => {
    try {
      return await ai_temp_notes.getAiTempNote(childId);
    } catch (err) {
      console.error("❌ SQLite getAiTempNote エラー:", err);
      throw err;
    }
  });

    // ============================================================
  // 🟢 temp_notes 専用 IPC ハンドラー
  // ============================================================
  ipcMain.handle("saveTempNote", async (_, data) => {
    try {
      return await temp_notes.upsert(data);
    } catch (err) {
      console.error("❌ SQLite saveTempNote エラー:", err);
      throw err;
    }
  });

  ipcMain.handle("getTempNote", async (_, data) => {
    try {
      const { children_id, staff_id, day_of_week_id } = data;
      const result = await temp_notes.getTempNote(children_id, staff_id, day_of_week_id);
      return { success: true, data: result };
    } catch (err) {
      console.error("❌ SQLite getTempNote エラー:", err);
      throw err;
    }
  });


}

module.exports = { registerSqliteHandlers };
