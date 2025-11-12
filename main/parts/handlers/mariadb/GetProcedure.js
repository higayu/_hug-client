// main/parts/handlers/mariadb/GetProcedure.js
const apiClient = require("../../../../src/apiClient");

async function managerInsertProcedure(data) {
  try {
    console.log("📡 [MAIN] managerInsertProcedure 呼び出し:", data);

    const params = [
      { name: "p_child_id", value: data.child_id },
      { name: "p_child_name", value: data.child_name },
      { name: "p_notes", value: data.notes },
      { name: "p_pronunciation_id", value: data.pronunciation_id },
      { name: "p_children_type_id", value: data.children_type_id },
      { name: "p_staff_id", value: data.staff_id },
      { name: "p_facility_id", value: data.facility_id },
      { name: "p_day_of_week_json", value: data.day_of_week },
      { name: "p_exists_child", value: data.exists_child },
      { name: "p_exists_manager", value: data.exists_manager },
    ];

    const result = await apiClient.callProcedure("manager_insert_procedure", params);

    console.log("✅ [MAIN] manager_insert_procedure 成功:", result);
    return result;
  } catch (error) {
    console.error("❌ [MAIN] manager_insert_procedure エラー:", error);
    throw error;
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
  GetChildrenByStaffAndDay,
  managerInsertProcedure,
};
