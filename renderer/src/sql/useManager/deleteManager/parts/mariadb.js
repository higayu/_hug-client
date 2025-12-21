// renderer/src/sql/useManager/deleteManager/parts/mariadb.js

export async function handleMariaDBDelete(payload) {
  console.log("====== MariaDB: handleMariaDBDelete START ======");
  console.log("処理する担当:", payload);

  /**
   * payload 例:
   * {
   *   children_id: number,
   *   staff_id: number,
   *   day_of_week_id: number
   * }
   */

  try {
    const { children_id, staff_id, day_of_week_id } = payload;

    if (
      children_id == null ||
      staff_id == null ||
      day_of_week_id == null
    ) {
      console.error("❌ delete payload 不正:", payload);
      return false;
    }

    // ✅ preload.js で expose された CRUD API を使用
    const result = await window.electronAPI.managers2_delete(
      children_id,
      staff_id,
      day_of_week_id
    );

    console.log("✅ MariaDB: managers2_delete 成功:", result);
    return true;

  } catch (error) {
    console.error("❌ MariaDB: managers2_delete エラー:", error);
    return false;
  } finally {
    console.log("====== MariaDB: handleMariaDBDelete END ======");
  }
}
