// renderer/src/sql/useManager/insertManager/insertManager.js

import { handleSQLiteUpdate } from "./parts/sqlite.js";
import { handleMariaDBUpdate } from "./parts/mariadb.js";

export async function updateManager(
  selectedChildren,
  databaseType
) {
  console.log("===== updateManager START =====");

  console.log("databaseType:", databaseType);

  if (!databaseType) {
    console.warn("⚠️ databaseType が設定されていません");
    console.log("===== updateManager END (error: no databaseType) =====");
    return false;
  }

    if (databaseType === 'sqlite') {
      return false;
    } else if (databaseType === 'mariadb') {
      console.log("→ 使用DB: MariaDB");
      const result =  await handleMariaDBUpdate(selectedChildren);
      if(result){
          return true;
      }
    } else {
      console.warn("⚠️ 不明な databaseType:", databaseType);
    }
  console.log("===== updateManager END =====");
  return false;
}
