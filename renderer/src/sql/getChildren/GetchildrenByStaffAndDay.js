// renderer/src/sql/getChildren/GetchildrenByStaffAndDay.js
import { sqliteApi } from "../sqliteApi.js";
import { mariadbApi } from "../mariadbApi.js";
import { joinChildrenData } from "./childrenJoinProcessor.js";

/**
 * DBの種類に応じて、子ども一覧データを取得
 * @param {Object} params
 * @param {number|string} params.staffId - スタッフID
 * @param {string} params.date - 対象日（または曜日）
 * @param {Object} params.tables - テーブルデータ
 * @returns {Promise<Array>}
 */
export async function GetchildrenByStaffAndDay({ tables, staffId, date }) {
  if (!tables) {
    console.error("❌ joinChildrenData: テーブルデータが未定義です");
    return { week_children: [], waiting_children: [], Experience_children: [] };
  }
  const {
    children,
    staffs,
    managers,
    pc,
    pc_to_children,
    pronunciation,
    children_type,
  } = tables;

  console.group("🔗 [GetchildrenByStaffAndDay] JOIN処理開始");
  console.log("👤 staffId:", staffId, "📅 date:", date);

  const staffIdNum = typeof staffId === "string" ? parseInt(staffId, 10) : Number(staffId);

  // --- SQL相当の結合 ---
  const joined = managers
    .map((m) => {
      const child = children.find((c) => c.id === m.children_id);
      const staff = staffs.find((s) => s.id === m.staff_id);
      if (!child || !staff) return null;

      const weekDayList = ["日", "月", "火", "水", "木", "金", "土"];
      const weekDay = weekDayList.includes(date)
        ? date
        : weekDayList[new Date(date).getDay()];

      // 曜日判定
      let match = false;
      try {
        if (typeof m.day_of_week === "string" && m.day_of_week.trim().startsWith("{")) {
          const parsed = JSON.parse(m.day_of_week);
          match = parsed.days?.includes(weekDay);
        } else if (typeof m.day_of_week === "string") {
          match = m.day_of_week.includes(weekDay);
        }
      } catch {
        match = false;
      }

      if (!match) return null;

      // PC情報のJOIN
      const ptc = pc_to_children.find((p) => p.children_id === child.id);
      const pcItem = ptc ? pc.find((p) => p.id === ptc.pc_id) : null;
      const pronun = pronunciation.find((p) => p.id === child.pronunciation_id);
      const ctype = children_type.find((t) => t.id === child.children_type_id);

      return {
        children_id: child.id,
        children_name: child.name,
        staff_id: staff.id,
        staff_name: staff.name,
        day_of_week: m.day_of_week,
        children_pronunciation_id: child.pronunciation_id,
        children_pronunciation: pronun?.pronunciation || "",
        notes: child.notes || "",
        children_type_id: child.children_type_id,
        children_type_name: ctype?.name || "",
        pc_id: pcItem?.id || null,
        pc_name: pcItem?.name || "",
        pc_day_of_week: ptc?.day_of_week || "",
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.children_name.localeCompare(b.children_name, "ja"));

  console.log("🔍 担当児童全件:", joined);

  // --- 自分のスタッフIDで絞り込み ---
  const myChildren = joined.filter((child) => {
    const match = Number(child.staff_id) === staffIdNum;
    console.log(
      `👤 staff check: ${child.children_name} → child.staff_id=${child.staff_id} vs staffId=${staffIdNum} → ${match}`
    );
    return match;
  });

  console.log(`✅ 自分の担当のみ: ${myChildren.length}件`);
  console.log("🔍 抽出結果:", myChildren);

  console.groupEnd();

  return myChildren;
}
