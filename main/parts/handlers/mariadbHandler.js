// main/parts/handlers/mariadbHandler.js
const apiClient = require("../../../src/apiClient");
const { insert_manager_p, update_manager_p } = require("./mariadb/GetProcedure");
const { delete_manager } = require("./mariadb/managers");   // ★ 追加

function registerMariadbHandlers(ipcMain) {
  // ============================================================
  // 📘 fetchTableAll
  // ============================================================
  ipcMain.handle("fetchTableAll", async () => {
    try {
      const allTables = await apiClient.fetchTableAll();
      const normalizedTables = normalizeTableData(allTables);
      return normalizedTables;
    } catch (err) {
      console.error("error:", err);
      throw err;
    }
  });

  // ============================================================
  // 📘 insert_manager_p
  // ============================================================
  ipcMain.handle("insert_manager_p", async (event, data) => {
    return await insert_manager_p(data);
  });

  // ============================================================
  // 📘 update_manager_p
  // ============================================================
  ipcMain.handle("update_manager_p", async (event, data) => {
    return await update_manager_p(data);
  });

  // ============================================================
  // 📘 delete_manager（★新規追加）
  // ============================================================
  ipcMain.handle("delete_manager", async (event, { children_id, staff_id }) => {
    return await delete_manager(children_id, staff_id);
  });
}

/**
 * APIから返されるデータ構造をSQLiteと同じ形式に正規化
 */
function normalizeTableData(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    console.warn("⚠️ [mariadbHandler] 予期しないデータ構造:", data);
    return {
      children: [],
      staffs: [],
      managers: [],
      facility_children: [],
      facility_staff: [],
      facilitys: [],
      pc: [],
      pc_to_children: [],
      pronunciation: [],
      children_type: [],
      day_of_week: [],
    };
  }

  const tableMapping = {
    'Children': 'children',
    'Staffs': 'staffs',
    'Managers': 'managers',
    'Facility_children': 'facility_children',
    'Facility_staff': 'facility_staff',
    'Facilitys': 'facilitys',
    'Pc': 'pc',
    'Pc_to_children': 'pc_to_children',
    'Pronunciation': 'pronunciation',
    'Children_type': 'children_type',
    'Day_of_week': 'day_of_week',

    'children': 'children',
    'staffs': 'staffs',
    'managers': 'managers',
    'facility_children': 'facility_children',
    'facility_staff': 'facility_staff',
    'facilitys': 'facilitys',
    'pc': 'pc',
    'pc_to_children': 'pc_to_children',
    'pronunciation': 'pronunciation',
    'children_type': 'children_type',
    'day_of_week': 'day_of_week',
  };

  const normalized = {
    children: [],
    staffs: [],
    managers: [],
    facility_children: [],
    facility_staff: [],
    facilitys: [],
    pc: [],
    pc_to_children: [],
    pronunciation: [],
    children_type: [],
    day_of_week: [],
  };

  for (const [key, value] of Object.entries(data)) {
    const normalizedKey = tableMapping[key] || key.toLowerCase();
    if (normalized[normalizedKey] !== undefined) {
      normalized[normalizedKey] = Array.isArray(value) ? value : (value ? [value] : []);
    } else {
      console.warn(`⚠️ [mariadbHandler] 未知のテーブル名: ${key}`);
    }
  }

  return normalized;
}

module.exports = { registerMariadbHandlers };
