// main/parts/apiHandler.js
const apiClient = require("../../src/apiClient");

function handleApiCalls(ipcMain) {
  ipcMain.handle("GetChildrenByStaffAndDay", async (event, args) => {
    const { staffId, date } = args;
    //console.log("📡 GetChildrenByStaffAndDay:", { staffId, date });

    try {
      const result = await apiClient.callProcedure("GetChildrenByStaffAndDay", [
        { name: "staff_id", value: Number(staffId) },
        { name: "weekday", value: date },
      ]);
      // プロシージャの値だけを取得
      return result.data || result;
    } catch (err) {
      console.error("❌ API失敗:", err.message);
      throw err;
    }
  });

  ipcMain.handle("getStaffAndFacility", async (event) => {
    try {
      const staffAndFacility = await apiClient.getStaffAndFacility();
      const staffs = await apiClient.fetchStaff();
      const facilitys = await apiClient.getFacilitys();
      return {staffAndFacility: staffAndFacility, staffs: staffs, facilitys: facilitys };
    } catch (err) {
      console.error("❌ getStaffAndFacility失敗:", err.message);
      throw err;
    }
  });

}

module.exports = { handleApiCalls };
