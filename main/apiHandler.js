// main/apiHandler.js
const apiClient = require("../src/apiClient");

function handleApiCalls(ipcMain) {
  ipcMain.handle("GetChildrenByStaffAndDay", async (event, args) => {
    const { staffId, date } = args;
    console.log("📡 GetChildrenByStaffAndDay:", { staffId, date });

    try {
      const result = await apiClient.callProcedure("GetChildrenByStaffAndDay", [
        { name: "staff_id", value: Number(staffId) },
        { name: "weekday", value: date },
      ]);
      return result;
    } catch (err) {
      console.error("❌ API失敗:", err.message);
      throw err;
    }
  });
}

module.exports = { handleApiCalls };
