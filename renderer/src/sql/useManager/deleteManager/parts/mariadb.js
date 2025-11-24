// renderer/src/sql/useManager/deleteManager/parts/mariadb.js

export async function handleMariaDBDelete(
  payload,
) {
  console.log("====== MariaDB: handleMariaDBDelete START ======");
  console.log("処理する児童:", payload);

 // console.log("📡 renderer → main: insert_manager_p 呼び出し:", payload);

  try {
    const result = await window.electronAPI.delete_manager(payload);
   
    console.log("✅ MariaDB: delete_manager 成功:", result);
    return true;
  } catch (error) {
    console.error("❌ MariaDB: delete_manager エラー:", error);
  }

  console.log("====== MariaDB: handleMariaDBDelete END ======");
}
