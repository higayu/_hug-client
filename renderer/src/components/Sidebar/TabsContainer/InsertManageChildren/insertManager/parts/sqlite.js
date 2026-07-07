// renderer/src/sql/useManager/insertManager/parts/sqlite.js

export async function handleSQLiteInsert(
  child,
  {
    childrenData,
    managersData,
    FACILITY_ID,
    STAFF_ID,
    weekId,
    priority = 0,
  }
) {
  console.log("====== SQLite: handleSQLiteInsert START ======");
  console.log("処理する児童:", child);
  console.log("FACILITY_ID:", FACILITY_ID, "STAFF_ID:", STAFF_ID, "weekID:", weekId);

  try {
    // -----------------------------------------
    // ① children テーブルのチェック
    // -----------------------------------------
    console.log("SQLite: children テーブル検索中...");

    const existingChild = childrenData?.find(
      (c) => String(c.id) === String(child.children_id)
    );

    console.log("SQLite: existingChild 結果:", existingChild);

    if (!existingChild) {
      console.log("SQLite: 児童が children テーブルに存在しません:", child.children_id);

      const childPayload = {
        id: Number(child.children_id),
        name: child.children_name || "",
        notes: child.notes ?? null,
        notes2: child.notes2 ?? null,
        personal_tmp: child.personal_tmp ?? null,
        pronunciation_id: child.pronunciation_id ?? null,
        children_type_id: Number(child.children_type_id ?? 1),
        is_delete: Number(child.is_delete ?? 0),
        leaving_at: child.leaving_at ?? null,
      };

      console.log("SQLite: children_insert 実行 →", childPayload);

      const result = await window.electronAPI.sqlite_children_insert(childPayload);

      console.log("SQLite: children_insert 完了:", result);

      if (FACILITY_ID != null) {
        const facilityPayload = {
          children_id: Number(child.children_id),
          facility_id: Number(FACILITY_ID),
        };

        console.log("SQLite: facility_children_insert 実行 →", facilityPayload);

        const result2 = await window.electronAPI.sqlite_facility_children_insert(
          facilityPayload
        );

        console.log("SQLite: facility_children_insert 完了:", result2);
      }
    } else {
      console.log("SQLite: 児童はすでに children テーブルに存在します:", existingChild);
    }

    // -----------------------------------------
    // ② managers2 テーブルへ登録
    // -----------------------------------------
    const managerPayload = {
      children_id: Number(child.children_id),
      staff_id: Number(STAFF_ID),
      day_of_week_id: Number(weekId),

      // managers2
      priority: Number(child.priority ?? priority ?? 0),

      // 追加カラム
      // ConfirmModal 側で "09:00:00" の形式にして渡す
      // 未設定の場合は null
      support_start_time: child.support_start_time ?? null,
      support_end_time: child.support_end_time ?? null,
    };

    console.log("SQLite: managers2_insert 実行 →", managerPayload);

    const result3 = await window.electronAPI.sqlite_managers2_insert(
      managerPayload
    );

    console.log("SQLite: managers2_insert 完了:", result3);
    console.log("====== SQLite: handleSQLiteInsert END ======");

    return true;
  } catch (error) {
    console.error("❌ SQLite: handleSQLiteInsert エラー:", error);
    console.log("====== SQLite: handleSQLiteInsert END (failed) ======");
    return false;
  }
}