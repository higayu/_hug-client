import { mariadbFnc } from './mariadbFnc.js';
import { sqliteFnc } from './sqliteFnc.js';

/**
 * 児童・施設・担当スタッフの登録をまとめて実行
 */
export async function saveChildrenData({
  selectedChildren,
  appState,
  childrenData,
  managersData,
  STAFF_ID,
  WEEK_DAY,
  FACILITY_ID,
}) {
  const { activeApi, mariadbApi, sqliteApi } = appState || {};

  if (!activeApi) {
    console.warn("⚠️ activeApiが設定されていません。");
    return;
  }

  const dbHandler = activeApi === mariadbApi ? mariadbFnc : sqliteFnc;

  for (const child of selectedChildren) {
    await dbHandler({
      child,
      childrenData,
      managersData,
      STAFF_ID,
      WEEK_DAY,
      FACILITY_ID,
    });
  }

  console.log("✅ 全ての児童データ登録が完了しました。");
}
