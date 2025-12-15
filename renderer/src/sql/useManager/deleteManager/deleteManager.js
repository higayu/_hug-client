// renderer/src/sql/useManager/deleteManager/deleteManager.js

import { handleSQLiteDelete } from "./parts/sqlite.js";
import { handleMariaDBDelete } from "./parts/mariadb.js";

export async function deleteManager(
  selectedChildren,
  databaseType
) {
  console.log("===== 削除Manager START =====");

  console.log("databaseType:", databaseType);

  if (!databaseType) {
    console.warn("⚠️ databaseType が設定されていません");
    console.log("===== 削除停止Manager END (error: no databaseType) =====");
    return false;
  }

    if (databaseType === 'sqlite') {
      return false;
    } else if (databaseType === 'mariadb') {
      console.log("→ 使用DB: MariaDB");
      const result =  await handleMariaDBDelete(selectedChildren);
      if(result){
          return true;
      }
    } else {
      console.warn("⚠️ 不明な databaseType:", databaseType);
    }
  console.log("===== 削除Manager END =====");
  return false;
}