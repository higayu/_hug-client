// main/parts/handlers/mariadb/GetProcedure.js
const apiClient = require("../../../../src/apiClient");

async function insert_manager_p(data) {
  let params = []; 

  try {
    console.log("📡 [MAIN] managerInsertProcedure 呼び出しデータ:", data);

    params = [
      { name: "p_child_id",            value: data.child_id },
      { name: "p_child_name",          value: data.child_name },
      { name: "p_notes",               value: data.notes },
      { name: "p_pronunciation_id",    value: data.pronunciation_id },
      { name: "p_children_type_id",    value: data.children_type_id },
      { name: "p_staff_id",            value: data.staff_id },
      { name: "p_facility_id",         value: data.facility_id },
      // day_of_week_json は **そのまま JSON 文字列で渡す**
      { name: "p_day_of_week_json",    value: data.day_of_week },
    ];

    console.log("📤 [MAIN] API 送信パラメータ:", params);

    const result = await apiClient.callProcedure("insert_manager_p", params);

    console.log("✅ [MAIN] insert_manager_p 成功:", result);
    return result;

  } catch (error) {
    console.error("❌ [MAIN] insert_manager_p API エラー:", {
      sentParams: params,
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
  insert_manager_p,
};



module.exports = {
  insert_manager_p,
};
