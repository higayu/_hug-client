// renderer/src/sql/useManager/updateManager/parts/mariadb.js

export async function handleMariaDBUpdate(payload) {
  console.log("====== MariaDB: handleMariaDBUpdate START ======");
  console.log("処理する担当:", payload);

  try {
    const { children_id, staff_id, day_of_week_id } = payload;

    if (
      children_id == null ||
      staff_id == null ||
      day_of_week_id == null
    ) {
      console.error("❌ update payload 不正:", payload);
      return false;
    }

    // ✅ ★ここが唯一の正解
    await window.electronAPI.mariadb_managers2_update({
      pk: ["children_id", "staff_id", "day_of_week_id"],
      values: [children_id, staff_id, day_of_week_id],
    });

    console.log("✅ MariaDB: managers2_update 成功");
    return true;

  } catch (error) {
    console.error("❌ MariaDB: managers2_update エラー:", error);
    return false;

  } finally {
    console.log("====== MariaDB: handleMariaDBUpdate END ======");
  }
}
