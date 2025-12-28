/**
 * MariaDB用：児童・施設・担当スタッフ情報を一括で登録する関数
 */
export async function mariadbFnc({
  child,
  childrenData,
  managersData,
  STAFF_ID,
  CURRENT_DAY_OF_WEEK,
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

    const weekId = CURRENT_DAY_OF_WEEK.weekdayId;

    // -----------------------------------
    // MariaDBに送信するペイロード
    // -----------------------------------
    const requestPayload = {
      child_id: child.children_id,
      child_name: child.children_name,
      notes: child.notes,
      pronunciation_id: child.pronunciation_id,
      children_type_id: child.children_type_id,
      staff_id: STAFF_ID,
      facility_id: FACILITY_ID,
      day_of_week: weekId,     // ← JSON オブジェクトで送る
      exists_child: !!existingChild,
      exists_manager: !!existingManager,
    };

    console.log("📤 送信データ(MariaDB):", requestPayload);

    // 🚀 MariaDB APIに一括送信
    const result = await window.electronAPI.insert_manager_p(requestPayload);

    console.log("✅ MariaDB 登録処理完了:", result);
    return result;

  } catch (error) {
    console.error("❌ MariaDB登録エラー:", error);
  }
}
