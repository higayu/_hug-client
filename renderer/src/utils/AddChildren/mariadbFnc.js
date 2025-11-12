/**
 * MariaDB用：児童・施設・担当スタッフ情報を一括で登録する関数
 */
export async function mariadbFnc({
    child,
    childrenData,
    managersData,
    STAFF_ID,
    WEEK_DAY,
    FACILITY_ID,
  }) {
    try {
      // 既存チェック
      const existingChild = childrenData.find(
        (c) => String(c.id) === String(child.children_id)
      );
      const existingManager = managersData.find(
        (m) =>
          String(m.children_id) === String(child.children_id) &&
          String(m.staff_id) === String(STAFF_ID)
      );
  
      // day_of_week処理（JSON文字列で送信）
      let dayOfWeekJson = "";
      if (!existingManager) {
        dayOfWeekJson = JSON.stringify({ days: [WEEK_DAY] });
      } else {
        try {
          const parsed = JSON.parse(existingManager.day_of_week);
          const daysArray = parsed?.days ?? [];
          if (!daysArray.includes(WEEK_DAY)) {
            dayOfWeekJson = JSON.stringify({ days: [...daysArray, WEEK_DAY] });
          } else {
            // 既に登録済みならそのまま
            dayOfWeekJson = existingManager.day_of_week;
          }
        } catch {
          dayOfWeekJson = JSON.stringify({ days: [WEEK_DAY] });
        }
      }
  
      // MariaDB側に1回で送信するデータ
      const requestPayload = {
        child_id: child.children_id,
        child_name: child.children_name,
        notes: child.notes,
        pronunciation_id: child.pronunciation_id,
        children_type_id: child.children_type_id,
        staff_id: STAFF_ID,
        facility_id: FACILITY_ID,
        day_of_week: dayOfWeekJson,
        exists_child: !!existingChild,
        exists_manager: !!existingManager,
      };
  
      // 🚀 MariaDB APIに一括送信
      const result = await window.electronAPI.manager_insert_procedure(requestPayload);
  
      console.log("✅ MariaDB 登録処理完了:", result);
      return result;
  
    } catch (error) {
      console.error("❌ MariaDB登録エラー:", error);
    }
  }
  