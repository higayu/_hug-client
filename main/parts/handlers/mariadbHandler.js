const apiClient = require("../../../src/apiClient");
const { insert_manager_p, update_manager_p } = require("./mariadb/GetProcedure");

function registerMariadbHandlers(ipcMain) {
  // ============================================================
  // 📘 fetchTableAll
  // ============================================================
  ipcMain.handle("fetchTableAll", async () => {
    try {
      const allTables = await apiClient.fetchTableAll();
      
      // ⚠️ データ構造をSQLiteと同じ形式に変換
      // APIが返すデータ構造に応じて変換処理を追加
      // 例: { Children: [...], Staffs: [...] } → { children: [...], staffs: [...] }
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

}

/**
 * APIから返されるデータ構造をSQLiteと同じ形式に正規化
 * @param {*} data - APIから返されるデータ
 * @returns {Object} 正規化されたテーブルデータ
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
      day_of_week: [],  // ← 必ず返す
    };
  }

  const tableMapping = {
    // 大文字始まり
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
    'Day_of_week': 'day_of_week',     // ★ 追加

    // 小文字
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
    'day_of_week': 'day_of_week',     // ★ 追加
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
    day_of_week: [],                  // ★ 最初から用意
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
