// renderer/src/sql/useManager/insertManager/insertManager.js

import { handleSQLiteUpdate } from "./parts/sqlite.js";
import { handleMariaDBUpdate } from "./parts/mariadb.js";
import { mariadbApi } from "@/sql/mariadbApi.js";
import { sqliteApi } from "@/sql/sqliteApi.js";

export async function updateManager(
  selectedChildren,
  activeApi
) {
  console.log("===== updateManager START =====");

  console.log("activeApi:", activeApi);

  if (!activeApi) {
    console.warn("⚠️ activeApi が設定されていません");
    console.log("===== updateManager END (error: no activeApi) =====");
    return;
  }

    if (activeApi === sqliteApi) {
      return false;
    } else if (activeApi === mariadbApi) {
      console.log("→ 使用DB: MariaDB");
      await handleMariaDBUpdate(selectedChildren);
      return true;
    } else {
      console.warn("⚠️ 不明な activeApi:", activeApi);
    }

  console.log("===== updateManager END =====");
}
