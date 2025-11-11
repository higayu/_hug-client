// renderer/src/sql/getChildren/childrenJoinProcessor.js
// ⚠️ sqliteApiとmariadbApiのimportを削除（使用していないため）
import { GetchildrenByStaffAndDay } from "./GetchildrenByStaffAndDay.js";
import { Get_waiting_children_pc } from "./Get_waiting_children_pc.js";
import { Experience_children_v } from "./Experience_children_v.js";

/**
 * 子どもデータを包括的に取得する（週／待機／体験）
 * @param {Object} params
 * @param {Object} params.tables - SQLiteモードの全テーブルデータ
 * @param {number|string} params.staffId - スタッフID
 * @param {string} params.date - 日付または曜日
 * @param {number|string|null} [params.facility_id] - 施設ID（省略可）
 * @returns {Promise<{ week_children:Array, waiting_children:Array, Experience_children:Array }>}
 */
export async function joinChildrenData({ tables, staffId, date, facility_id = null }) {
  
  let myChildren = [];
  let myWaitingChildren = [];
  let myExperienceChildren = [];

    // 各種データ取得
    myChildren = await GetchildrenByStaffAndDay({ tables, staffId, date });
    myWaitingChildren = await Get_waiting_children_pc({ tables, facility_id });
    myExperienceChildren = await Experience_children_v({ tables });

    console.log("✅ [joinChildrenData] 抽出完了:", {
      week_children: myChildren.length,
      waiting_children: myWaitingChildren.length,
      experience_children: myExperienceChildren.length,
    });

    console.log("✅ [joinChildrenData] 抽出完了:", myWaitingChildren);
    console.log("✅ [joinChildrenData] 抽出完了:", myExperienceChildren);
    console.log("✅ [joinChildrenData] 抽出完了:", myChildren);

  return {
    week_children: myChildren,
    waiting_children: myWaitingChildren,
    Experience_children: myExperienceChildren,
  };
}