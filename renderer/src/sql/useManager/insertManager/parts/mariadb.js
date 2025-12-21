// renderer/src/sql/insertManager/parts/mariadb.js

export async function handleMariaDBInsert(
  child,
  {
    STAFF_ID,
    WEEK_DAY,
    priority = 0, // ← 通常対応 = 0
  }
) {
  console.log("====== MariaDB: handleMariaDBInsert START ======");
  console.log("処理する児童:", child);

  /**
   * child 例:
   * {
   *   children_id,
   *   day_of_week: [1,2,5] | undefined
   * }
   */

  // ----------------------------------
  // ① 曜日ID配列を確定
  // ----------------------------------
  let dayIds = [];

  if (Array.isArray(child.day_of_week)) {
    dayIds = child.day_of_week;

  } else if (typeof child.day_of_week === "string") {
    try {
      const parsed = JSON.parse(child.day_of_week);
      if (Array.isArray(parsed.days)) {
        dayIds = parsed.days;
      }
    } catch {
      dayIds = [];
    }
  }

  // フォールバック：当日曜日
  if (dayIds.length === 0 && WEEK_DAY != null) {
    dayIds = [WEEK_DAY];
  }

  if (dayIds.length === 0) {
    console.warn("❌ 曜日が確定できないため insert 中断");
    return false;
  }

  console.log("📅 insert 対象 dayIds:", dayIds);

  // ----------------------------------
  // ② managers2 レコードを順次 insert
  // ----------------------------------
  try {
    for (const dayId of dayIds) {
      const payload = {
        children_id: Number(child.children_id),
        staff_id: Number(STAFF_ID),
        day_of_week_id: Number(dayId),
        priority: Number(priority),
      };

      console.log("📡 mariadb_managers2_insert:", payload);

      // ✅ ★ここだけ修正
      await window.electronAPI.mariadb_managers2_insert(payload);
    }

    console.log("✅ MariaDB: managers2_insert 完了");
    return true;

  } catch (error) {
    console.error("❌ MariaDB: managers2_insert エラー:", error);
    return false;

  } finally {
    console.log("====== MariaDB: handleMariaDBInsert END ======");
  }
}
