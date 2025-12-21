import { joinChildrenData } from "./childrenJoinProcessor.js";

/**
 * スタッフ・曜日で子ども一覧を取得（managers2 対応）
 */
export async function GetchildrenByStaffAndDay({ tables, staffId, date }) {
  if (!tables) {
    console.error("❌ GetchildrenByStaffAndDay: テーブルデータが未定義です");
    return [];
  }

  const {
    children = [],
    staffs = [],
    managers2 = [],
    pc = [],
    pc_to_children = [],
    pronunciation = [],
    children_type = [],
    day_of_week = [],
  } = tables;

  console.group("🔗 [GetchildrenByStaffAndDay / managers2] JOIN処理開始");

  // ----------------------------------------
  // 曜日マスタ（sort_order 順）
  // ----------------------------------------
  const sortedWeekMaster = [...day_of_week].sort(
    (a, b) => a.sort_order - b.sort_order
  );

  const weekDayList =
    sortedWeekMaster.length > 0
      ? sortedWeekMaster.map((d) => d.label_jp)
      : ["日", "月", "火", "水", "木", "金", "土"];

  // ----------------------------------------
  // date → 曜日名
  // ----------------------------------------
  const weekDay = weekDayList.includes(date)
    ? date
    : weekDayList[new Date(date).getDay()];

  // ----------------------------------------
  // 曜日ID取得
  // ----------------------------------------
  const targetWeek = sortedWeekMaster.find(
    (d) => d.label_jp === weekDay
  );
  const targetWeekId = targetWeek?.id;

  if (!targetWeekId) {
    console.warn("⚠️ 対象曜日IDが取得できません:", weekDay);
    return [];
  }

  const staffIdNum = Number(staffId);

  // ----------------------------------------
  // 🔥 JOIN処理（managers2 前提）
  // ----------------------------------------
  const joined = managers2
    // 曜日一致のみ抽出（最重要）
    .filter((m) => m.day_of_week_id === targetWeekId)
    .map((m) => {
      const child = children.find((c) => c.id === m.children_id);
      const staff = staffs.find((s) => s.id === m.staff_id);
      if (!child || !staff) return null;

      // PC JOIN
      const ptc = pc_to_children.find(
        (p) => p.children_id === child.id
      );
      const pcItem = ptc ? pc.find((p) => p.id === ptc.pc_id) : null;

      const pronun = pronunciation.find(
        (p) => p.id === child.pronunciation_id
      );
      const ctype = children_type.find(
        (t) => t.id === child.children_type_id
      );

      return {
        children_id: child.id,
        children_name: child.name,

        staff_id: staff.id,
        staff_name: staff.name,

        weekday_name: weekDay,
        weekday_id: targetWeekId,

        // managers2 は生IDをそのまま
        day_of_week_id: m.day_of_week_id,
        priority: m.priority ?? 0,

        children_type_id: child.children_type_id,
        children_type_name: ctype?.name || "",

        children_pronunciation_id: child.pronunciation_id,
        children_pronunciation: pronun?.pronunciation || "",

        pc_id: pcItem?.id || null,
        pc_name: pcItem?.name || "",
        pc_day_of_week: ptc?.day_of_week || "",

        notes: child.notes || "",
      };
    })
    .filter(Boolean)
    .sort((a, b) =>
      a.children_name.localeCompare(b.children_name, "ja")
    );

  // ----------------------------------------
  // 自分の担当のみ
  // ----------------------------------------
  const myChildren = joined.filter(
    (c) => Number(c.staff_id) === staffIdNum
  );

  console.log(`✅ 自分の担当: ${myChildren.length} 件`);
  console.log("🔍 抽出結果:", myChildren);

  console.groupEnd();
  return myChildren;
}
