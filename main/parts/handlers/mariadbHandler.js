const apiClient = require("../../../src/apiClient");
const { getStaffAndFacility, GetChildrenByStaffAndDay } = require("./mariadb/GetProcedure");

function registerMariadbHandlers(ipcMain) {
  // ============================================================
  // 📘 fetchTableAll
  // ============================================================
  ipcMain.handle("fetchTableAll", async () => {
    try {
      const allTables = await apiClient.fetchTableAll();
      return allTables;
    } catch (err) {
      console.error("❌ fetchTableAll失敗:", err.message);
      throw err;
    }
  });

  // ============================================================
  // 📘 getStaffAndFacility
  // ============================================================
  ipcMain.handle("getStaffAndFacility", async () => {
    return await getStaffAndFacility();
  });

  // ============================================================
  // 📘 GetChildrenByStaffAndDay
  // ============================================================
  ipcMain.handle("GetChildrenByStaffAndDay", async (event, args) => {
    return await GetChildrenByStaffAndDay(args);
  });

  console.log("✅ MariaDB IPCハンドラ登録完了");
}

module.exports = { registerMariadbHandlers };
