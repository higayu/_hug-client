// renderer/src/sql/useManager/insertManager/parts/sqlite.js


export async function handleSQLiteInsert(
  child,
  {
    childrenData,
    managersData,
    FACILITY_ID,
    STAFF_ID,
    weekId,
  }
) {

  console.log("====== SQLite: handleSQLiteInsert START ======");
  console.log("処理する児童:", child);
  console.log("FACILITY_ID:", FACILITY_ID, "STAFF_ID:", STAFF_ID, "weekID:", weekId);

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

    const result = await window.electronAPI.sqlite_children_insert({
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

    const result2 = await window.electronAPI.sqlite_facility_children_insert({
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
    console.log("SQLite: managers_insert 実行 →", {
      children_id: child.children_id,
      staff_id: STAFF_ID,
      weekId:weekId,
    });

    const result3 = await window.electronAPI.sqlite_managers2_insert({
      children_id: child.children_id,
      staff_id: STAFF_ID,
      day_of_week_id: weekId,
    });

  console.log("SQLite: managers_insert 完了:", result3);
  console.log("====== SQLite: handleSQLiteInsert END ======");
}
