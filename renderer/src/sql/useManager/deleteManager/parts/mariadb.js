// renderer/src/sql/useManager/deleteManager/parts/mariadb.js

export async function handleMariaDBDelete(
  child,
  {
    childrenData,
    managersData,
    FACILITY_ID,
    STAFF_ID,
    WEEK_DAY,
  }
) {
  console.log("====== MariaDB: handleMariaDBDelete START ======");
  console.log("処理する児童:", child);

 // console.log("📡 renderer → main: insert_manager_p 呼び出し:", payload);

  try {
    const result = await window.electronAPI.delete_manager_p(payload);
    console.log("✅ MariaDB: delete_manager_p 成功:", result);
  } catch (error) {
    console.error("❌ MariaDB: delete_manager_p エラー:", error);
  }

  console.log("====== MariaDB: handleMariaDBDelete END ======");
}
