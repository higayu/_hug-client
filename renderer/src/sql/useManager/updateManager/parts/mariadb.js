// renderer/src/sql/useManager/updateManager/parts/mariadb.js

export async function handleMariaDBUpdate(
  child,
  {
    childrenData,
    managersData,
    FACILITY_ID,
    STAFF_ID,
    WEEK_DAY,
  }
) {
  console.log("====== MariaDB: handleMariaDBUpdate START ======");
  console.log("処理する児童:", child);
  console.log("FACILITY_ID:", FACILITY_ID, "STAFF_ID:", STAFF_ID, "WEEK_DAY:", WEEK_DAY);

  // ----------------------------------------------------
  // ① 現在の曜日(JSON)を取得
  // ----------------------------------------------------
  const existingManager = managersData.find((m) => {
    return (
      String(m.children_id) === String(child.children_id) &&
      String(m.staff_id) === String(STAFF_ID)
    );
  });

  let dayOfWeekJson = null;

  if (existingManager) {
    // すでに担当がある → JSON に曜日追加または維持
    try {
      const parsed = JSON.parse(existingManager.day_of_week);
      const daysArray = parsed?.days ?? [];

      if (daysArray.includes(WEEK_DAY)) {
        console.log("既に同じ曜日が登録されています → 維持");
        dayOfWeekJson = existingManager.day_of_week;
      } else {
        console.log("曜日を追加:", WEEK_DAY);
        dayOfWeekJson = JSON.stringify({ days: [...daysArray, WEEK_DAY] });
      }

    } catch (err) {
      console.error("day_of_week JSON パース失敗 → 初期値設定");
      dayOfWeekJson = JSON.stringify({ days: [WEEK_DAY] });
    }
  } else {
    // 担当がない → 新規登録の曜日
    console.log("担当が存在しません → 新規曜日設定");
    dayOfWeekJson = JSON.stringify({ days: [WEEK_DAY] });
  }

  // ----------------------------------------------------
  // ② update_manager に渡す payload（SQL に合わせて3項目のみ）
  // ----------------------------------------------------
  const payload = {
    child_id: child.children_id,
    staff_id: STAFF_ID,
    day_of_week: dayOfWeekJson,
  };

  console.log("📡 renderer → main update_manager_p:", payload);

  // ----------------------------------------------------
  // ③ Electron(main)へ処理依頼
  // ----------------------------------------------------
  try {
    const result = await window.electronAPI.update_manager_p(payload);
    console.log("✅ MariaDB: update_manager_p 成功:", result);
  } catch (error) {
    console.error("❌ MariaDB: update_manager_p エラー:", error);
  }

  console.log("====== MariaDB: handleMariaDBUpdate END ======");
}
