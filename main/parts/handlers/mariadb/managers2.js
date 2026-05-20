// main/parts/handlers/mariadb/managers2.js
const apiClient = require("../../../../src/apiClient");

/**
 * managers2 削除
 * - day_of_week_id があれば 1レコード削除
 * - なければ children_id + staff_id の全曜日削除
 */
async function delete_manager(children_id, staff_id, day_of_week_id = null) {
  try {
    console.log("📨 main: delete_manager SEND:", {
      children_id,
      staff_id,
      day_of_week_id,
    });

    let pk;
    let values;

    if (day_of_week_id !== null && day_of_week_id !== undefined) {
      // 単一曜日削除
      pk = "children_id,staff_id,day_of_week_id";
      values = `${children_id},${staff_id},${day_of_week_id}`;
    } else {
      // 全曜日削除
      pk = "children_id,staff_id";
      values = `${children_id},${staff_id}`;
    }

    const result = await apiClient.delete("managers2", {
      params: { pk, values },
    });

    console.log("🟢 main: delete_manager RESULT:", result);
    return result;

  } catch (error) {
    console.error("❌ delete_manager ERROR:", error);
    throw error;
  }
}

module.exports = {
  delete_manager,
};
