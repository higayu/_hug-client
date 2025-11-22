// renderer/src/sql/useManager/insertManager/insertManager.js

import { handleSQLiteUpdate } from "./parts/sqlite.js";
import { handleMariaDBUpdate } from "./parts/mariadb.js";
import { mariadbApi } from "@/sql/mariadbApi.js";
import { sqliteApi } from "@/sql/sqliteApi.js";

export async function updateManager(
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
  console.log("===== updateManager START =====");
    // 単一オブジェクトなら配列に変換
    const childrenList = Array.isArray(selectedChildren)
    ? selectedChildren
    : [selectedChildren];
  console.log("選択された児童数:", childrenList.length);
  console.log("activeApi:", activeApi);
  console.log("FACILITY_ID:", FACILITY_ID, "STAFF_ID:", STAFF_ID, "WEEK_DAY:", WEEK_DAY);

  if (!activeApi) {
    console.warn("⚠️ activeApi が設定されていません");
    console.log("===== updateManager END (error: no activeApi) =====");
    return;
  }

  for (const child of childrenList) {
    console.log("-------------------------------------------");
    console.log("▶ 児童処理開始:", child.children_id, child.children_name);

    if (activeApi === sqliteApi) {
      console.log("→ 使用DB: SQLite");
      await handleSQLiteUpdate(child, {
        childrenData,
        managersData,
        FACILITY_ID,
        STAFF_ID,
        WEEK_DAY,
      });
      console.log("✔ SQLite 処理完了:", child.children_id);

    } else if (activeApi === mariadbApi) {
      console.log("→ 使用DB: MariaDB");
      await handleMariaDBUpdate(child, {
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

  console.log("===== updateManager END =====");
}
