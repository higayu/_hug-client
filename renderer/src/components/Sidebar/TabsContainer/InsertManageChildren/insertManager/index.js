// renderer/src/sql/useManager/insertManager/insertManager.js

import { handleSQLiteInsert } from "./parts/sqlite.js";
import { handleMariaDBInsert } from "./parts/mariadb.js";

/**
 * 児童の manager 登録処理
 *
 * 方針:
 * - activeApi は使わない
 * - Redux / AppState の DATABASE_TYPE を呼び出し元から databaseType として受け取る
 * - databaseType に応じて SQLite / MariaDB の処理を分岐する
 *
 * @param {Object|Object[]} selectedChildren 選択された児童、または児童配列
 * @param {Object} params
 * @param {Array} params.childrenData 子どもデータ
 * @param {Array} params.managersData manager データ
 * @param {string} params.databaseType "sqlite" | "mariadb"
 * @param {string|number} params.FACILITY_ID 施設ID
 * @param {string|number} params.STAFF_ID スタッフID
 * @param {Object} params.CURRENT_DAY_OF_WEEK 現在の曜日情報
 * @returns {Promise<boolean>} 成功なら true
 */
export async function insertManager(
  selectedChildren,
  {
    childrenData,
    managersData,
    databaseType,
    FACILITY_ID,
    STAFF_ID,
    CURRENT_DAY_OF_WEEK,
  }
) {
  console.log("===== insertManager START =====");
  console.log("🔥 CURRENT_DAY_OF_WEEK:", CURRENT_DAY_OF_WEEK);

  try {
    // =============================================================
    // databaseType 正規化
    // =============================================================
    const resolvedDatabaseType =
      databaseType === "mariadb" ? "mariadb" : "sqlite";

    console.log("databaseType:", databaseType);
    console.log("resolvedDatabaseType:", resolvedDatabaseType);
    console.log("FACILITY_ID:", FACILITY_ID, "STAFF_ID:", STAFF_ID);

    // =============================================================
    // 必須値チェック
    // =============================================================
    if (!databaseType) {
      console.warn("⚠️ databaseType が設定されていません");
      console.log("===== insertManager END (error: no databaseType) =====");
      return false;
    }

    if (!CURRENT_DAY_OF_WEEK?.weekdayId) {
      console.warn("⚠️ CURRENT_DAY_OF_WEEK.weekdayId が取得できません");
      console.log("===== insertManager END (error: no weekdayId) =====");
      return false;
    }

    if (!STAFF_ID) {
      console.warn("⚠️ STAFF_ID が設定されていません");
      console.log("===== insertManager END (error: no STAFF_ID) =====");
      return false;
    }

    if (!FACILITY_ID) {
      console.warn("⚠️ FACILITY_ID が設定されていません");
      console.log("===== insertManager END (error: no FACILITY_ID) =====");
      return false;
    }

    if (!selectedChildren) {
      console.warn("⚠️ selectedChildren が空です");
      console.log("===== insertManager END (error: no selectedChildren) =====");
      return false;
    }

    // 単一オブジェクトなら配列に変換
    const childrenList = Array.isArray(selectedChildren)
      ? selectedChildren
      : [selectedChildren];

    if (childrenList.length === 0) {
      console.warn("⚠️ 選択された児童がありません");
      console.log("===== insertManager END (error: empty childrenList) =====");
      return false;
    }

    const weekId = CURRENT_DAY_OF_WEEK.weekdayId;

    console.log("選択された児童数:", childrenList.length);
    console.log("曜日のID:", weekId);

    // =============================================================
    // DB種別ごとの処理関数を決定
    // =============================================================
    const insertHandler =
      resolvedDatabaseType === "mariadb"
        ? handleMariaDBInsert
        : handleSQLiteInsert;

    const dbLabel =
      resolvedDatabaseType === "mariadb" ? "MariaDB" : "SQLite";

    // =============================================================
    // 児童ごとに登録処理
    // =============================================================
    for (const child of childrenList) {
      console.log("-------------------------------------------");
      console.log("▶ 児童処理開始:", child?.children_id, child?.children_name);
      console.log("→ 使用DB:", dbLabel);

      if (!child?.children_id) {
        console.warn("⚠️ children_id がないため、この児童をスキップします:", child);
        console.log("▶ 児童処理スキップ");
        console.log("-------------------------------------------");
        continue;
      }

      await insertHandler(child, {
        childrenData,
        managersData,
        FACILITY_ID,
        STAFF_ID,
        weekId,
      });

      console.log(`✔ ${dbLabel} 処理完了:`, child.children_id);
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