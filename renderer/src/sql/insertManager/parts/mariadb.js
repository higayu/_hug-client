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
  // ③ 曜日の追加または初回設定
  // -----------------------------
  let dayOfWeekJson = null;

  if (!existsManager) {
    console.log("MariaDB: 新規担当 → 曜日は初期値");
    dayOfWeekJson = JSON.stringify({ days: [WEEK_DAY] });

  } else {
    try {
      const parsed = JSON.parse(existingManager.day_of_week);
      const daysArray = parsed?.days ?? [];

      if (daysArray.includes(WEEK_DAY)) {
        console.log("MariaDB: 同じ曜日が既に登録済み:", WEEK_DAY);
        dayOfWeekJson = existingManager.day_of_week; // 変更なし
      } else {
        console.log("MariaDB: 曜日追加:", WEEK_DAY);
        const updatedDays = [...daysArray, WEEK_DAY];
        dayOfWeekJson = JSON.stringify({ days: updatedDays });
      }

    } catch (err) {
      console.error("MariaDB: day_of_week JSON パースに失敗:", err);
      dayOfWeekJson = JSON.stringify({ days: [WEEK_DAY] }); // フォールバック
    }
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
    const result = await window.electronAPI.managerInsertProcedure(payload);
    console.log("✅ MariaDB: manager_insert_procedure 成功:", result);
  } catch (error) {
    console.error("❌ MariaDB: manager_insert_procedure エラー:", error);
  }

  console.log("====== MariaDB: handleMariaDBInsert END ======");
}
