export async function insertOrUpdateManager(child, managersData, STAFF_ID, WEEK_DAY) {
    const existingManager = managersData.find(
      (m) =>
        String(m.children_id) === String(child.children_id) &&
        String(m.staff_id) === String(STAFF_ID)
    );
  
    if (!existingManager) {
      const dayOfWeekJson = JSON.stringify({ days: [WEEK_DAY] });
      const result = await window.electronAPI.managers_insert({
        children_id: child.children_id,
        staff_id: STAFF_ID,
        day_of_week: dayOfWeekJson,
      });
      console.log("👩‍🏫担当スタッフを新規登録:", result);
      return;
    }
  
    try {
      const parsed = JSON.parse(existingManager.day_of_week);
      const daysArray = parsed?.days ?? [];
  
      if (!daysArray.includes(WEEK_DAY)) {
        const updatedDays = [...daysArray, WEEK_DAY];
        const updatedJson = JSON.stringify({ days: updatedDays });
  
        const result = await window.electronAPI.managers_update({
          children_id: child.children_id,
          staff_id: STAFF_ID,
          day_of_week: updatedJson,
        });
  
        console.log("🔄曜日情報を更新:", updatedDays);
      } else {
        console.log("⏭既に登録済みの曜日:", WEEK_DAY);
      }
    } catch (e) {
      console.error("⚠️ JSON解析失敗:", e);
    }
  }
  