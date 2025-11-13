// renderer/src/sql/insertManager/parts/mariadb.js

export async function handleMariaDBInsert(
    child,
    {
      childrenData,
      managersData,
      FACILITY_ID,
      STAFF_ID,
      WEEK_DAY,
    }
  ) {
    console.log("MariaDB 処理開始:", child.children_id);
  
    const existingChild = childrenData.find(
      (c) => String(c.id) === String(child.children_id)
    );
  
    // -----------------------------
    // children テーブル
    // -----------------------------
    if (!existingChild) {
      console.log("MariaDB: 児童が存在しません:", child.children_id);
  
      const result = await window.electronAPI.children_insert({
        id: child.children_id,
        name: child.children_name,
        notes: child.notes,
        pronunciation_id: child.pronunciation_id,
        children_type_id: child.children_type_id,
      });
  
      console.log("MariaDB: 児童を追加しました:", result);
  
      const result2 = await window.electronAPI.facility_children_insert({
        children_id: child.children_id,
        facility_id: FACILITY_ID,
      });
  
      console.log("MariaDB: 児童を施設に追加しました:", result2);
    }
  
    // -----------------------------
    // managers テーブル
    // -----------------------------
    const existingManager = managersData.find((m) => {
      const sameChild = String(m.children_id) === String(child.children_id);
      const sameStaff = String(m.staff_id) === String(STAFF_ID);
      return sameChild && sameStaff;
    });
  
    if (!existingManager) {
      const result3 = await window.electronAPI.managers_insert({
        children_id: child.children_id,
        staff_id: STAFF_ID,
        day_of_week: JSON.stringify({ days: [WEEK_DAY] }),
      });
  
      console.log("MariaDB: 新規担当を追加しました:", result3);
  
    } else {
      try {
        const parsed = JSON.parse(existingManager.day_of_week);
        const daysArray = parsed?.days ?? [];
  
        if (daysArray.includes(WEEK_DAY)) {
          console.log("MariaDB: すでに同じ曜日が登録済み:", WEEK_DAY);
        } else {
          const updatedDays = [...daysArray, WEEK_DAY];
  
          const result4 = await window.electronAPI.managers_update({
            children_id: child.children_id,
            staff_id: STAFF_ID,
            day_of_week: JSON.stringify({ days: updatedDays }),
          });
  
          console.log("MariaDB: 曜日を追加:", updatedDays);
        }
      } catch (error) {
        console.error("MariaDB: JSON 解析に失敗:", error);
      }
    }
  }
  