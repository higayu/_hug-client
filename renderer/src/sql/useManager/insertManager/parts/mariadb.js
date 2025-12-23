// renderer/src/sql/insertManager/parts/mariadb.js

export async function handleMariaDBInsert(
  child,
  {
    STAFF_ID,
    CURRENT_DATE,
    priority = 0, // ← 通常対応 = 0
  }
) {
  console.log("====== MariaDB: handleMariaDBInsert START ======");
  console.log("処理する児童:", child);

  // ----------------------------------
  // ② managers2 レコードを順次 insert
  // ----------------------------------
  try {

    const weekId =  CURRENT_DATE.weekdayId;

    const payload = {
      children_id: Number(child.children_id),
      staff_id: Number(STAFF_ID),
      day_of_week_id: weekId,
      priority: Number(priority),
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
