// renderer/src/sql/useManager/insertManager/parts/mariadb.js

export async function handleMariaDBInsert(
  child,
  {
    childrenData,
    FACILITY_ID,
    STAFF_ID,
    weekId,
    priority = 0,
  }
) {
  console.log("====== MariaDB: handleMariaDBInsert START ======");
  console.log("処理する児童:", child);

  try {
    // -----------------------------------------
    // ① children テーブル存在チェック（MariaDB）
    // -----------------------------------------
    const existingChild = childrenData?.find(
      (c) => String(c.id) === String(child.children_id)
    );

    if (!existingChild) {
      const childPayload = {
        id: Number(child.children_id),
        name: child.children_name || "",
        notes: child.notes ?? null,
        notes2: child.notes2 ?? null,
        personal_tmp: child.personal_tmp ?? null,
        pronunciation_id: child.pronunciation_id ?? null,
        children_type_id: Number(child.children_type_id ?? 1),
        is_delete: Number(child.is_delete ?? 0),
        leaving_at: child.leaving_at ?? null,
      };

      console.log("📡 mariadb_children_insert:", childPayload);

      await window.electronAPI.mariadb_children_insert(childPayload);

      console.log("✅ MariaDB: children_insert 完了");

      if (FACILITY_ID != null) {
        const facilityPayload = {
          children_id: Number(child.children_id),
          facility_id: Number(FACILITY_ID),
        };

        console.log("📡 mariadb_facility_children_insert:", facilityPayload);

        await window.electronAPI.mariadb_facility_children_insert(
          facilityPayload
        );

        console.log("✅ MariaDB: facility_children_insert 完了");
      }
    } else {
      console.log(
        "ℹ️ MariaDB: 児童は既に children テーブルに存在:",
        child.children_id
      );
    }

    // ----------------------------------
    // ② managers2 レコードを insert
    // ----------------------------------
    console.log("weekId:", weekId);
    console.log("STAFF_ID:", STAFF_ID);
    console.log("child.children_id:", child.children_id);

    const payload = {
      children_id: Number(child.children_id),
      staff_id: Number(STAFF_ID),
      day_of_week_id: Number(weekId),

      // managers2
      priority: Number(child.priority ?? priority ?? 0),

      // 追加カラム
      // MariaDB 側は TIME 型想定
      // "09:00:00" / null を渡す
      support_start_time: child.support_start_time ?? null,
      support_end_time: child.support_end_time ?? null,
    };

    console.log("📡 mariadb_managers2_insert:", payload);

    await window.electronAPI.mariadb_managers2_insert(payload);

    console.log("✅ MariaDB: managers2_insert 完了");

    return true;
  } catch (error) {
    console.error("❌ MariaDB: managers2_insert エラー:", error);
    return false;
  } finally {
    console.log("====== MariaDB: handleMariaDBInsert END ======");
  }
}