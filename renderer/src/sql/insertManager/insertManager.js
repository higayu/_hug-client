// renderer/src/sql/insertManager/insertManager.js

import { handleSQLiteInsert } from "./parts/sqlite.js";
import { handleMariaDBInsert } from "./parts/mariadb.js";
import { mariadbApi } from "@/sql/mariadbApi.js";
import { sqliteApi } from "@/sql/sqliteApi.js";

export async function insertManager(
  selectedChildren,
  {
    childrenData,
    managersData,
    activeApi,
    FACILITY_ID,
    STAFF_ID,
    WEEK_DAY,
  }
) {
  console.log("===== insertManager START =====");
  console.log("選択された児童数:", selectedChildren.length);
  console.log("activeApi:", activeApi);
  console.log("FACILITY_ID:", FACILITY_ID, "STAFF_ID:", STAFF_ID, "WEEK_DAY:", WEEK_DAY);

  if (!activeApi) {
    console.warn("⚠️ activeApi が設定されていません");
    console.log("===== insertManager END (error: no activeApi) =====");
    return;
  }

  for (const child of selectedChildren) {
    console.log("-------------------------------------------");
    console.log("▶ 児童処理開始:", child.children_id, child.children_name);

    if (activeApi === sqliteApi) {
      console.log("→ 使用DB: SQLite");
      await handleSQLiteInsert(child, {
        childrenData,
        managersData,
        FACILITY_ID,
        STAFF_ID,
        WEEK_DAY,
      });
      console.log("✔ SQLite 処理完了:", child.children_id);

    } else if (activeApi === mariadbApi) {
      console.log("→ 使用DB: MariaDB");
      await handleMariaDBInsert(child, {
        childrenData,
        managersData,
        FACILITY_ID,
        STAFF_ID,
        WEEK_DAY,
      });
      console.log("✔ MariaDB 処理完了:", child.children_id);

    } else {
      console.warn("⚠️ 不明な activeApi:", activeApi);
      console.warn("この児童の処理をスキップ:", child.children_id);
    }

    console.log("▶ 児童処理終了:", child.children_id);
    console.log("-------------------------------------------");
  }

  console.log("===== insertManager END =====");
}
