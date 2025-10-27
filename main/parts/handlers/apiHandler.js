// main/parts/apiHandler.js
const apiClient = require("../../../src/apiClient");

function handleApiCalls(ipcMain) {
  ipcMain.handle("GetChildrenByStaffAndDay", async (event, args) => {
    const { staffId, date, facility_id } = args;
    //console.log("📡 GetChildrenByStaffAndDay:", { staffId, date });

    try {
      const result1 = await apiClient.callProcedure("GetChildrenByStaffAndDay", [
        { name: "staff_id", value: Number(staffId) },
        { name: "weekday", value: date },
      ]);

      const result2 = await apiClient.callProcedure("Get_waiting_children_pc", [
        { name: "facility_id", value: Number(facility_id) },
      ]);

      const result3 = await apiClient.getExperience_children_v();

      // プロシージャの値だけを取得
      return {week_children: result1, waiting_children: result2, Experience_children: result3}; //result.data || result;
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
