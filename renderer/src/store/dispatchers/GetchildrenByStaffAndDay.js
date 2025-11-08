// renderer/src/store/dispatchers/childrenDispatcher.js
import store from "../store.js"; // Reduxのstore本体を直接import
import { setChildren, setStaff, setFacility } from "../slices/childrenSlice.js";
import { getSQLData, initDatabase } from "../../sql/index.js";

/**
 * DBからデータを取得してReduxストアに格納する関数
 */
export async function fetchAndStoreChildrenData({ staffId, date, facility_id }) {
  try {
    // DBモード判定
    await initDatabase();

    // DBからデータ取得
    const result = await getSQLData({ staffId, date, facility_id });

    // store に格納
    store.dispatch(setChildren(result.children || []));
    store.dispatch(setStaff(result.staff?.staff || []));
    store.dispatch(setFacility(result.staff?.facility || []));

    console.log("✅ [childrenDispatcher] Redux store にデータ格納完了", result);
    return result;
  } catch (err) {
    console.error("❌ [childrenDispatcher] データ取得・格納エラー:", err);
    throw err;
  }
}

