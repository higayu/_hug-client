// main/parts/handlers/mariadb/GetProcedure.js
const apiClient = require("../../../../src/apiClient");

async function manager_insert_procedure(data) {
  try {
    console.log("📡 [MAIN] managerInsertProcedure 呼び出しデータ:", data);

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

    console.log("📤 [MAIN] API 送信パラメータ:", params);

    const result = await apiClient.callProcedure("insert_manager_p", params);

    console.log("✅ [MAIN] manager_insert_procedure 成功:", result);
    return result;

  } catch (error) {
    console.error("❌ [MAIN] manager_insert_procedure API エラー:", {
      message: error.message,
      code: error.code,
      responseData: error.response?.data,
      responseStatus: error.response?.status,
      stack: error.stack,
    });
    throw error;
  }
}


module.exports = {
  manager_insert_procedure,
};
