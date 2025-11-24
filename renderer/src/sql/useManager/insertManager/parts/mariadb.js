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
  console.log("====== MariaDB: handleMariaDBInsert START ======");
  console.log("処理する児童:", child);

  // -----------------------------
  // ① 児童の存在確認
  // -----------------------------
  const existingChild = childrenData.find(
    (c) => String(c.id) === String(child.children_id)
  );
  const existsChild = existingChild ? 1 : 0;

  console.log("MariaDB: existsChild =", existsChild);

  // -----------------------------
  // ② 担当者の存在確認
  // -----------------------------
  const existingManager = managersData.find((m) => {
    const sameChild = String(m.children_id) === String(child.children_id);
    const sameStaff = String(m.staff_id) === String(STAFF_ID);
    return sameChild && sameStaff;
  });
  const existsManager = existingManager ? 1 : 0;

  console.log("MariaDB: existsManager =", existsManager);

  // -----------------------------
  // ③ 曜日はフロント側で形成済みの値をそのまま使う
  // -----------------------------
  let dayOfWeekJson = null;

  if (child.day_of_week) {
    // ConfirmModal + updateManager() で計算済みの JSON を使用
    dayOfWeekJson = child.day_of_week;
    console.log("MariaDB: フロント側 day_of_week を使用:", dayOfWeekJson);

  } else {
    // フロント側が渡していない場合のフォールバック
    console.warn("MariaDB: child.day_of_week が未設定 → fallback");
    dayOfWeekJson = JSON.stringify({ days: [WEEK_DAY] });
  }

  // -----------------------------
  // ④ メインプロシージャ呼び出し
  // -----------------------------
  const payload = {
    child_id: child.children_id,
    child_name: child.children_name,
    notes: child.notes ?? "",
    pronunciation_id: child.pronunciation_id,
    children_type_id: child.children_type_id,
    staff_id: STAFF_ID,
    facility_id: FACILITY_ID,
    day_of_week: dayOfWeekJson,
    exists_child: existsChild,
    exists_manager: existsManager,
  };

  console.log("📡 renderer → main: manager_insert_procedure 呼び出し:", payload);

  try {
    const result = await window.electronAPI.insert_manager_p(payload);
    console.log("✅ MariaDB: manager_insert_procedure 成功:", result);
  } catch (error) {
    console.error("❌ MariaDB: manager_insert_procedure エラー:", error);
  }

  console.log("====== MariaDB: handleMariaDBInsert END ======");
}
