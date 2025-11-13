const apiClient = require("../../../src/apiClient");
const { insert_manager_p } = require("./mariadb/GetProcedure");

function registerMariadbHandlers(ipcMain) {
  // ============================================================
  // 📘 fetchTableAll
  // ============================================================
  ipcMain.handle("fetchTableAll", async () => {
    try {
      const allTables = await apiClient.fetchTableAll();
      
      // ⚠️ デバッグ: データ構造を確認
      console.log("🔍 [mariadbHandler] fetchTableAll レスポンス:", {
        type: typeof allTables,
        isArray: Array.isArray(allTables),
        keys: allTables ? Object.keys(allTables) : null,
        sample: allTables ? JSON.stringify(allTables).substring(0, 500) : null
      });
      
      // ⚠️ データ構造をSQLiteと同じ形式に変換
      // APIが返すデータ構造に応じて変換処理を追加
      // 例: { Children: [...], Staffs: [...] } → { children: [...], staffs: [...] }
      const normalizedTables = normalizeTableData(allTables);
      
      console.log("✅ [mariadbHandler] 正規化後のデータ:", {
        children: normalizedTables.children?.length || 0,
        staffs: normalizedTables.staffs?.length || 0,
        managers: normalizedTables.managers?.length || 0,
        pc: normalizedTables.pc?.length || 0,
        pc_to_children: normalizedTables.pc_to_children?.length || 0,
        pronunciation: normalizedTables.pronunciation?.length || 0,
        children_type: normalizedTables.children_type?.length || 0,
      });
      
      return normalizedTables;
    } catch (err) {
      console.error("❌ fetchTableAll失敗:", err.message);
      throw err;
    }
  });

    // ============================================================
  // 📘 insert_manager_p
  // ============================================================
  ipcMain.handle("insert_manager_p", async (event, data) => {
    return await insert_manager_p(data);
  });


  console.log("✅ MariaDB IPCハンドラ登録完了");
}

/**
 * APIから返されるデータ構造をSQLiteと同じ形式に正規化
 * @param {*} data - APIから返されるデータ
 * @returns {Object} 正規化されたテーブルデータ
 */
function normalizeTableData(data) {
  // ⚠️ データが配列の場合は空オブジェクトを返す
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
    };
  }
  
  // ⚠️ テーブル名のマッピング（大文字小文字や命名規則の違いに対応）
  const tableMapping = {
    // 大文字始まりの場合
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
    // 小文字の場合（そのまま）
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
  };
  
  // ⚠️ データを正規化
  for (const [key, value] of Object.entries(data)) {
    const normalizedKey = tableMapping[key] || key.toLowerCase();
    if (normalized[normalizedKey] !== undefined) {
      // ⚠️ 配列でない場合は配列に変換
      normalized[normalizedKey] = Array.isArray(value) ? value : (value ? [value] : []);
    } else {
      console.warn(`⚠️ [mariadbHandler] 未知のテーブル名: ${key}`);
    }
  }
  
  return normalized;
}

module.exports = { registerMariadbHandlers };
