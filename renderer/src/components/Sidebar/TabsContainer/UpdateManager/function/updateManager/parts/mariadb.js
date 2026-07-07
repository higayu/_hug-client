// renderer/src/commponents/Sidebar/TabsContainer/UpdateManager/function/updateManager/parts/mariadb.js

const formatTimeForDb = (value) => {
  if (value === "" || value == null) return null;

  if (String(value).length === 5) {
    return `${value}:00`;
  }

  return value;
};

export async function handleMariaDBUpdate(payload) {
  console.log("====== MariaDB: handleMariaDBUpdate START ======");
  console.log("[handleMariaDBUpdate] 処理する担当:", payload);

  try {
    const {
      children_id,
      staff_id,
      day_of_week_id,
      priority = 0,
      support_start_time = null,
      support_end_time = null,
    } = payload;

    if (
      children_id == null ||
      staff_id == null ||
      day_of_week_id == null
    ) {
      console.error("[handleMariaDBUpdate] update payload 不正:", payload);
      return false;
    }

    const pk = ["children_id", "staff_id", "day_of_week_id"];

    const values = [
      Number(children_id),
      Number(staff_id),
      Number(day_of_week_id),
    ];

    const data = {
      priority: Number(priority ?? 0),
      support_start_time: formatTimeForDb(support_start_time),
      support_end_time: formatTimeForDb(support_end_time),
    };

    console.log("[handleMariaDBUpdate] UPDATE args:", {
      pk,
      values,
      data,
    });

    console.log(
      "[handleMariaDBUpdate] SQL preview:",
      `
      UPDATE managers2
      SET
        priority = ${data.priority},
        support_start_time = ${
          data.support_start_time == null
            ? "NULL"
            : `'${data.support_start_time}'`
        },
        support_end_time = ${
          data.support_end_time == null
            ? "NULL"
            : `'${data.support_end_time}'`
        }
      WHERE
        children_id = ${values[0]}
        AND staff_id = ${values[1]}
        AND day_of_week_id = ${values[2]};
      `
    );

    const result = await window.electronAPI.mariadb_managers2_update({
      pk,
      values,
      data,
    });

    console.log("[handleMariaDBUpdate] managers2_update result:", result);
    console.log("✅ MariaDB: managers2_update 成功");

    return true;
  } catch (error) {
    console.error("❌ MariaDB: managers2_update エラー:", error);
    return false;
  } finally {
    console.log("====== MariaDB: handleMariaDBUpdate END ======");
  }
}