export async function insertOrUpdateManager(child, managersData, STAFF_ID, CURRENT_DATE) {
  
      const weekId = CURRENT_DATE.weekdayId;
      const result = await window.electronAPI.sqlite_managers2_insert({
        children_id: child.children_id,
        staff_id: STAFF_ID,
        day_of_week: weekId,
      });
      console.log("👩‍🏫担当スタッフを新規登録:", result);
      return true;

  }
  