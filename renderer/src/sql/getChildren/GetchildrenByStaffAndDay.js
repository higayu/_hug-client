import { joinChildrenData } from "./childrenJoinProcessor.js";

/**
 * スタッフ・曜日で子ども一覧を取得
 */
export async function GetchildrenByStaffAndDay({ tables, staffId, date }) {
  if (!tables) {
    console.error("❌ GetchildrenByStaffAndDay: テーブルデータが未定義です");
    return [];
  }

  const {
    children = [],
    staffs = [],
    managers = [],
    pc = [],
    pc_to_children = [],
    pronunciation = [],
    children_type = [],
    day_of_week = [],   // DB の曜日 master
  } = tables;

  console.group("🔗 [GetchildrenByStaffAndDay] JOIN処理開始");

  console.log("📋 day_of_week マスタ:", day_of_week);

  // ----------------------------------------
  // 🔥 ソートは破壊的なので必ずコピーする！！
  // ----------------------------------------
  const sortedWeekMaster = [...day_of_week].sort(
    (a, b) => a.sort_order - b.sort_order
  );

  const weekDayList =
    sortedWeekMaster.length > 0
      ? sortedWeekMaster.map((d) => d.label_jp)
      : ["日", "月", "火", "水", "木", "金", "土"];

  console.log("📅 使用する曜日リスト:", weekDayList);

  // ----------------------------------------
  // date が曜日名 or 日付か判定
  // ----------------------------------------
  const weekDay = weekDayList.includes(date)
    ? date
    : weekDayList[new Date(date).getDay()];

  console.log("📅 判定された weekDay:", weekDay);

  // 曜日IDを取得
  const targetWeek = sortedWeekMaster.find((d) => d.label_jp === weekDay);
  const targetWeekId = targetWeek?.id;

  console.log("📅 曜日ID:", targetWeekId);

  const staffIdNum = Number(staffId);

  // ----------------------------------------
  // 🔥 JOIN処理
  // ----------------------------------------
  const joined = managers
    .map((m) => {
      const child = children.find((c) => c.id === m.children_id);
      const staff = staffs.find((s) => s.id === m.staff_id);
      if (!child || !staff) return null;

      // 🔍 m.day_of_week: {"days":[1,3,5]} 判定
      let match = false;

      try {
        if (typeof m.day_of_week === "string" && m.day_of_week.startsWith("{")) {
          const parsed = JSON.parse(m.day_of_week);

          if (parsed.days && Array.isArray(parsed.days)) {
            match = parsed.days.includes(targetWeekId);
          }
        }
      } catch (err) {
        console.error("⚠️ m.day_of_week JSONパース失敗:", m.day_of_week, err);
      }

      if (!match) return null;

      // PC JOIN
      const ptc = pc_to_children.find((p) => p.children_id === child.id);
      const pcItem = ptc ? pc.find((p) => p.id === ptc.pc_id) : null;

      const pronun = pronunciation.find((p) => p.id === child.pronunciation_id);
      const ctype = children_type.find((t) => t.id === child.children_type_id);

      return {
        children_id: child.id,
        children_name: child.name,

        staff_id: staff.id,
        staff_name: staff.name,

        weekday_name: weekDay,
        weekday_id: targetWeekId,

        day_of_week_raw: m.day_of_week,

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
    .sort((a, b) => a.children_name.localeCompare(b.children_name, "ja"));

  console.log("🔍 担当児童全件:", joined);

  const myChildren = joined.filter((c) => Number(c.staff_id) === staffIdNum);

  console.log(`✅ 自分の担当: ${myChildren.length} 件`);
  console.log("🔍 抽出結果:", myChildren);

  console.groupEnd();
  return myChildren;
}
