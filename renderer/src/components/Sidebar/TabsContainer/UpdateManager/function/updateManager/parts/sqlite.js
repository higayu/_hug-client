// renderer/src/sql/useManager/updateManager/parts/sqlite.js


export async function handleSQLiteUpdate(
  child,
) {

  console.log("====== SQLite: handleSQLiteUpdate START ======");
  console.log('更新データ',child);

    const result3 = await window.electronAPI.sqlite_managers2_update({
      children_id: child.children_id,
      staff_id:child.staff_id,
      day_of_week_id:child.day_of_week_id,
    });

    console.log("SQLite: managers_update 完了:", result3);
    console.log("====== SQLite: handleSQLiteUpdate END ======");
    return true;
}
