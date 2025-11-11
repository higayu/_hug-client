// main/parts/handlers/mariadb/GetProcedure.js
const apiClient = require("../../../../src/apiClient");

/**
 * スタッフと施設の情報を取得
 */
async function getStaffAndFacility() {
  try {
    const staffAndFacility = await apiClient.getStaffAndFacility();
    const staffs = await apiClient.fetchStaff();
    const facilitys = await apiClient.getFacilitys();
    return { staffAndFacility, staffs, facilitys };
  } catch (err) {
    console.error("❌ getStaffAndFacility失敗:", err.message);
    throw err;
  }
}

/**
 * スタッフと曜日から子ども情報を取得
 */
async function GetChildrenByStaffAndDay(args) {
  const { staffId, date, facility_id } = args;
  try {
    const result1 = await apiClient.callProcedure("GetChildrenByStaffAndDay", [
      { name: "staff_id", value: Number(staffId) },
      { name: "weekday", value: date },
    ]);

    const result2 = await apiClient.callProcedure("Get_waiting_children_pc", [
      { name: "facility_id", value: Number(facility_id) },
    ]);

    const result3 = await apiClient.getExperience_children_v();

    return {
      week_children: result1,
      waiting_children: result2,
      Experience_children: result3,
    };
  } catch (err) {
    console.error("❌ GetChildrenByStaffAndDay失敗:", err.message);
    throw err;
  }
}

module.exports = {
  getStaffAndFacility,
  GetChildrenByStaffAndDay,
};
