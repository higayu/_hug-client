// renderer/src/sql/index.js
// ⚠️ このファイルはuseAppStateを直接呼び出しているが、Reactフックはコンポーネント内でしか使えない
// このファイルが実際に使用されているかを確認し、使用されていない場合は削除するか、
// パラメータでactiveApiを受け取るように修正する

import { joinChildrenData } from "./getChildren/childrenJoinProcessor.js";
import { sqliteApi } from "./sqliteApi.js";
import { mariadbApi } from "./mariadbApi.js";

/**
 * DBモードに応じて子どもデータを取得する
 * @param {Object} params
 * @param {number|string} params.staffId - スタッフID
 * @param {string} params.date - 日付または曜日
 * @param {number|string|null} [params.facility_id] - 施設ID（省略可）
 * @param {Object} params.activeApi - 使用するAPI（sqliteApiまたはmariadbApi）
 */
export async function getSQLData({ staffId, date, facility_id, activeApi }) {
  try {
    // ⚠️ activeApiパラメータを使用
    if (!activeApi) {
      console.error("❌ [index.js] activeApiが指定されていません");
      return null;
    }

    // ✅ SQLiteモード
    if (activeApi === sqliteApi) {
      console.log("🪶 [index.js] SQLiteモードで子どもデータ取得");
      const tables = await sqliteApi.getAllTables();
      return await joinChildrenData({
        tables,
        staffId,
        date,
        facility_id,
      });
    } else if (activeApi === mariadbApi) {
      // ✅ MariaDBモード
      console.log("🧩 [index.js] MariaDBモードで子どもデータ取得");
      const tables = await mariadbApi.getAllTables();

      return await joinChildrenData({
        tables,
        staffId,
        date,
        facility_id,
      });
    } else {
      console.log("❌ [index.js] 不正なAPIモードです");
      return null;
    }
  } catch (err) {
    console.error("❌ [index.js] 子どもデータ取得エラー:", err);
    throw err;
  }
}
