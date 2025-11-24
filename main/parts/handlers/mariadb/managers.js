// main/parts/handlers/mariadb/managers.js
const apiClient = require("../../../../src/apiClient");

module.exports = {
  async delete_manager(children_id, staff_id) {
    try {
      console.log("📨 main: delete_manager SEND:", { children_id, staff_id });

      // 🔥 DELETE API 呼び出し（houday 固定）
      const result = await apiClient.deleteByPk({
        table: "managers",
        pk: "children_id,staff_id",
        values: `${children_id},${staff_id}`,
      });

      console.log("🟢 main: delete_manager RESULT:", result);
      return result;

    } catch (error) {
      console.error("❌ delete_manager ERROR:", error);
      throw error;
    }
  },
};
