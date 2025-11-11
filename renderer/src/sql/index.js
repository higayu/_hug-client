// renderer/src/sql/index.js
import { useAppState } from "../contexts/AppStateContext.jsx";
import { joinChildrenData } from "./getChildren/childrenJoinProcessor.js";

const { appState } = useAppState();
/**
 * DBモードに応じて子どもデータを取得する
 */
export async function getSQLData({ staffId, date, facility_id }) {
  try {
    // ✅ SQLiteモード
    if (appState.activeApi === sqliteApi) {
      console.log("🪶 [index.js] SQLiteモードで子どもデータ取得");
      const tables = await sqliteApi.getAllTables();
      return await joinChildrenData({
        tables,
        staffId,
        date,
        facility_id,
      });
    }else if (appState.activeApi === mariadbApi) {
      // ✅ MariaDBモード
      console.log("🧩 [index.js] MariaDBモードで子どもデータ取得");
      const tables = await mariadbApi.getAllTables();

      return await joinChildrenData({
        tables,
        staffId,
        date,
        facility_id,
      });
    }else {
      console.log("❌ [index.js] 不正なAPIモードです");
      return;
    }
  } catch (err) {
    console.error("❌ [index.js] 子どもデータ取得エラー:", err);
    throw err;
  }
}
