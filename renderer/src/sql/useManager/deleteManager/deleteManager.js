// renderer/src/sql/useManager/deleteManager/deleteManager.js

import { handleSQLiteDelete } from "./parts/sqlite.js";
import { handleMariaDBDelete } from "./parts/mariadb.js";
import { mariadbApi } from "@/sql/mariadbApi.js";
import { sqliteApi } from "@/sql/sqliteApi.js";

export async function deleteManager(
  selectedChildren,
  activeApi
) {
  console.log("===== 削除Manager START =====");

  console.log("activeApi:", activeApi);

  if (!activeApi) {
    console.warn("⚠️ activeApi が設定されていません");
    console.log("===== 削除停止Manager END (error: no activeApi) =====");
    return false;
  }

    if (activeApi === sqliteApi) {
      return false;
    } else if (activeApi === mariadbApi) {
      console.log("→ 使用DB: MariaDB");
      const result =  await handleMariaDBDelete(selectedChildren);
      if(result){
          return true;
      }
    } else {
      console.warn("⚠️ 不明な activeApi:", activeApi);
    }
  console.log("===== 削除Manager END =====");
  return false;
}