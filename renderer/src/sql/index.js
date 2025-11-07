// renderer/src/sql/index.js
import { mariadbApi } from "./mariadbApi.js";
import { sqliteApi } from "./sqliteApi.js";
import { joinChildrenData } from "./getChildrenByStaffAndDay/childrenJoinProcessor.js";

let activeApi = sqliteApi; // デフォルトはSQLite

/**
 * DBモードを初期化（Electron側から判定）
 */
export async function initDatabase() {
  try {
    const dbType = (await window.electronAPI.getDatabaseType()) || "sqlite";
    activeApi = dbType === "mariadb" ? mariadbApi : sqliteApi;
    console.log(`⚙️ [index.js] DBモード: ${dbType}`);
  } catch (err) {
    console.warn("⚠️ [index.js] DBモード取得失敗: SQLiteを使用します", err);
    activeApi = sqliteApi;
  }
  return activeApi;
}

/**
 * DBモードに応じて子どもデータを取得する
 */
export async function getChildrenData({ staffId, date, facility_id }) {
  try {
    // ✅ SQLiteモード
    if (activeApi === sqliteApi) {
      console.log("🪶 [index.js] SQLiteモードで子どもデータ取得");
      const tables = await sqliteApi.getAllTables();
      return joinChildrenData({
        tables,
        staffId,
        date,
      });
    }

    // ✅ MariaDBモード
    console.log("🧩 [index.js] MariaDBモードで子どもデータ取得");
    return await mariadbApi.getChildrenByStaffAndDay({
      staffId,
      date,
      facility_id,
    });
  } catch (err) {
    console.error("❌ [index.js] 子どもデータ取得エラー:", err);
    throw err;
  }
}

export { activeApi };
