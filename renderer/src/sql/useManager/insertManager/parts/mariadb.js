// renderer/src/sql/insertManager/parts/mariadb.js

export async function handleMariaDBInsert(
  child,
  {
    STAFF_ID,
    weekId,
    priority = 0, // ← 通常対応 = 0
  }
) {
  console.log("====== MariaDB: handleMariaDBInsert START ======");
  console.log("処理する児童:", child);

  // ----------------------------------
  // ② managers2 レコードを順次 insert
  // ----------------------------------
  try {


    console.log("weekId:", weekId);
    console.log("STAFF_ID:", STAFF_ID);
    console.log("child.children_id:", child.children_id);

    const payload = {
      children_id: Number(child.children_id),
      staff_id: Number(STAFF_ID),
      day_of_week_id: weekId
    };

    console.log("📡 mariadb_managers2_insert:", payload);
      // ✅ ★ここだけ修正
    await window.electronAPI.mariadb_managers2_insert(payload);
    
    console.log("✅ MariaDB: managers2_insert 完了");
    return true;

  } catch (error) {
    console.error("❌ MariaDB: managers2_insert エラー:", error);
    return false;

  } finally {
    console.log("====== MariaDB: handleMariaDBInsert END ======");
  }
}
