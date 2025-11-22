// main/parts/handlers/mariadb/GetProcedure.js
const apiClient = require("../../../../src/apiClient");

// =======================================================
//  INSERT（変更なし、必要なら後で same logic を適用）
// =======================================================
async function insert_manager_p(data) {
  let params = []; 

  try {
    params = [
      { name: "p_child_id",         value: data.child_id },
      { name: "p_child_name",       value: data.child_name },
      { name: "p_notes",            value: data.notes },
      { name: "p_pronunciation_id", value: data.pronunciation_id },
      { name: "p_children_type_id", value: data.children_type_id },
      { name: "p_staff_id",         value: data.staff_id },
      { name: "p_facility_id",      value: data.facility_id },
      // この部分も後で修正する予定（※今は現状維持）
      { name: "p_day_of_week_json", value: data.day_of_week },
    ];

    const result = await apiClient.callProcedure("insert_manager_p", params);
    return result;

  } catch (error) {
    throw error;
  }
}

// =======================================================
//  UPDATE（★数値 → 日本語 に変換して DB に保存）
// =======================================================
async function update_manager_p(data) {
  try {
    console.log("📨 main: update_manager_p SEND:", data);

    const NUM_TO_WDAY = {
      1:"月", 2:"火", 3:"水",
      4:"木", 5:"金", 6:"土", 7:"日"
    };

    let parsed;
    try {
      parsed = JSON.parse(data.day_of_week);
    } catch (e) {
      console.error("day_of_week parse error:", data.day_of_week);
      parsed = { days: [] };
    }

    const jpDays = parsed.days
      .map(n => NUM_TO_WDAY[n])
      .filter(Boolean);

    const jpJson = JSON.stringify({ days: jpDays });

    console.log("📝 DB に保存する JSON:", jpJson);

    const params = [
      { value: data.children_id },
      { value: data.staff_id },
      { value: jpJson },  // ← DB には日本語で保存
    ];

    const result = await apiClient.callProcedure("update_manager", params);
    return result;

  } catch (error) {
    console.error("❌ update_manager_p ERROR:", error);
    throw error;
  }
}


module.exports = {
  insert_manager_p,
  update_manager_p,
};
