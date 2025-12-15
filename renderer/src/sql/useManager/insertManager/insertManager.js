// renderer/src/sql/useManager/insertManager/insertManager.js

import { handleSQLiteInsert } from "./parts/sqlite.js";
import { handleMariaDBInsert } from "./parts/mariadb.js";

export async function insertManager(
  selectedChildren,
  {
    childrenData,
    managersData,
    databaseType,
    FACILITY_ID,
    STAFF_ID,
    WEEK_DAY,
  }
) {
  console.log("===== insertManager START =====");

  try {
    // 単一オブジェクトなら配列に変換
    const childrenList = Array.isArray(selectedChildren)
      ? selectedChildren
      : [selectedChildren];

    console.log("選択された児童数:", childrenList.length);
    console.log("databaseType:", databaseType);
    console.log("FACILITY_ID:", FACILITY_ID, "STAFF_ID:", STAFF_ID, "WEEK_DAY:", WEEK_DAY);

    // activeApi がない場合は false
    if (!databaseType) {
      console.warn("⚠️ activeApi が設定されていません");
      console.log("===== insertManager END (error: no activeApi) =====");
      return false;
    }

    for (const child of childrenList) {
      console.log("-------------------------------------------");
      console.log("▶ 児童処理開始:", child.children_id, child.children_name);

      if (databaseType === 'sqlite') {
        console.log("→ 使用DB: SQLite");

        await handleSQLiteInsert(child, {
          childrenData,
          managersData,
          FACILITY_ID,
          STAFF_ID,
          WEEK_DAY,
        });

        console.log("✔ SQLite 処理完了:", child.children_id);

      } else if (databaseType === 'mariadb') {
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
        console.warn("⚠️ 不明な databaseType:", databaseType);
        console.warn("この児童の処理をスキップ:", child.children_id);
      }

      console.log("▶ 児童処理終了:", child.children_id);
      console.log("-------------------------------------------");
    }

    console.log("===== insertManager END (success) =====");
    return true;

  } catch (err) {
    console.error("❌ insertManager エラー:", err);
    console.log("===== insertManager END (failed) =====");
    return false;
  }
}

