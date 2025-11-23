// renderer/src/sql/useManager/updateManager/parts/mariadb.js

export async function handleMariaDBUpdate(
 SelectChild
) {
  console.log("====== MariaDB Update START ======");
  console.log("曜日の追加内容",SelectChild);
  
  const payload = {
    children_id: SelectChild.children_id,
    staff_id: SelectChild.staff_id,
    day_of_week: SelectChild.day_of_week,  // 完全に数値JSON
  };

  console.log("📡 Renderer → Main:", payload);

  try {
    const result = await window.electronAPI.update_manager_p(payload);
    console.log("✅ update success", result);

  } catch (err) {
    console.error("❌ update failed", err);
  }

  console.log("====== MariaDB Update END ======");
}
