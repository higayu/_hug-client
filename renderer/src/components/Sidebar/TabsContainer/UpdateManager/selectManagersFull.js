// components/Sidebar/Tools/UpdateManager/selectManagersFull.js

export function selectManagersFull(database = {}) {
  const managers2 = database.managers2 ?? [];
  const children = database.children ?? [];
  const staffs = database.staffs ?? [];
  const dayOfWeek = database.day_of_week ?? [];

  // ------------------------------------------
  // 検索用 Map を作る（高速）
  // ------------------------------------------
  const childrenMap = new Map(
    children
      .filter((c) => Number(c.is_delete ?? 0) === 0)
      .map((c) => [Number(c.id), c])
  );

  const staffMap = new Map(
    staffs.map((s) => [Number(s.id), s])
  );

  const dayMap = new Map(
    dayOfWeek.map((d) => [Number(d.id), d])
  );

  // ------------------------------------------
  // managers2 + children + staffs + day_of_week を JOIN
  // SQL の INNER JOIN 相当
  // ------------------------------------------
  return managers2
    .map((m) => {
      const child = childrenMap.get(Number(m.children_id));
      const staff = staffMap.get(Number(m.staff_id));
      const day = dayMap.get(Number(m.day_of_week_id));

      // JOIN 失敗は除外
      if (!child || !staff || !day) return null;

      return {
        // managers2
        children_id: m.children_id,
        staff_id: m.staff_id,
        day_of_week_id: m.day_of_week_id,

        priority: Number(m.priority ?? 0),
        support_start_time: m.support_start_time ?? null,
        support_end_time: m.support_end_time ?? null,

        // children
        children_name: child.name ?? "",

        // staffs
        staff_name: staff.name ?? "",

        // day_of_week
        day_of_week_label: day.label_jp ?? "",
        day_of_week_sort_order: Number(day.sort_order ?? 0),
      };
    })
    .filter(Boolean);
}