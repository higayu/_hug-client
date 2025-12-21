// renderer/src/sql/useManager/deleteManager/parts/sqlite.js


export async function handleSQLiteDelete(
  child,
) {

  console.log("====== SQLite: handleSQLiteDelete START ======");
  console.log("処理する児童:", child);
  console.log("FACILITY_ID:", FACILITY_ID, "STAFF_ID:", STAFF_ID, "WEEK_DAY:", WEEK_DAY);

  // -----------------------------------------
  // ① children テーブルのチェック
  // -----------------------------------------
  console.log("SQLite: children テーブル検索中...");
  const existingChild = childrenData.find(
    (c) => String(c.id) === String(child.children_id)
  );

  console.log("SQLite: existingChild 結果:", existingChild);

  if (!existingChild) {
    console.log("SQLite: 児童が children テーブルに存在しません:", child.children_id);
    console.log("SQLite: children_insert 実行 →", {
      id: child.children_id,
      name: child.children_name,
      notes: child.notes,
      pronunciation_id: child.pronunciation_id,
      children_type_id: child.children_type_id,
    });

    const result = await window.electronAPI.children_insert({
      id: child.children_id,
      name: child.children_name,
      notes: child.notes,
      pronunciation_id: child.pronunciation_id,
      children_type_id: child.children_type_id,
    });

    console.log("SQLite: children_insert 完了:", result);

    console.log("SQLite: facility_children_insert 実行 →", {
      children_id: child.children_id,
      facility_id: FACILITY_ID,
    });

    const result2 = await window.electronAPI.facility_children_insert({
      children_id: child.children_id,
      facility_id: FACILITY_ID,
    });

    console.log("SQLite: facility_children_insert 完了:", result2);
  } else {
    console.log("SQLite: 児童はすでに children テーブルに存在します:", existingChild);
  }

  // -----------------------------------------
  // ② managers テーブルのチェック
  // -----------------------------------------
  console.log("SQLite: managers テーブル検索中...");

  const existingManager = managersData.find((m) => {
    const sameChild = String(m.children_id) === String(child.children_id);
    const sameStaff = String(m.staff_id) === String(STAFF_ID);
    return sameChild && sameStaff;
  });

  console.log("SQLite: existingManager:", existingManager);

  if (!existingManager) {
    console.log("SQLite: 担当者レコードなし → 新規作成");

    const dayOfWeekJson = JSON.stringify({ days: [WEEK_DAY] });

    console.log("SQLite: managers_delete 実行 →", {
      children_id: child.children_id,
      staff_id: STAFF_ID,
      day_of_week: dayOfWeekJson,
    });

    const result3 = await window.electronAPI.managers_delete({
      children_id: child.children_id,
      staff_id: STAFF_ID,
      day_of_week: dayOfWeekJson,
    });

    console.log("SQLite: managers_delete 完了:", result3);

  } else {
    console.log("SQLite: 既に担当レコードが存在します:", existingManager);

    try {
      console.log("SQLite: day_of_week JSON 解析中...");
      const parsed = JSON.parse(existingManager.day_of_week);
      const daysArray = parsed?.days ?? [];

      console.log("SQLite: 現在登録されている曜日:", daysArray);

      if (daysArray.includes(WEEK_DAY)) {
        console.log("SQLite: 既に同じ曜日が登録されています:", WEEK_DAY);
      } else {
        console.log("SQLite: 新しい曜日を追加:", WEEK_DAY);

        const updatedDays = [...daysArray, WEEK_DAY];
        const updatedJson = JSON.stringify({ days: updatedDays });

        console.log("SQLite: managers_delete 実行 →", {
          children_id: child.children_id,
          staff_id: STAFF_ID,
          day_of_week: updatedJson,
        });

        await window.electronAPI.sqlite_managers2_delete(
          children_id,
          staff_id,
          day_of_week_id
        );


        console.log("SQLite: managers_delete 完了:", result4);
      }
    } catch (error) {
      console.error("SQLite: JSON パースエラー:", error);
      console.error("SQLite: パース対象:", existingManager.day_of_week);
    }
  }

  console.log("====== SQLite: handleSQLiteDelete END ======");
}
