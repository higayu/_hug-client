// components/Sidebar/Tools/UpdateManager/selectManagersFull.js

export function selectManagersFull(database) {
  const managers2 = database.managers2 ?? [];
  const children = database.children ?? [];
  const staffs = database.staffs ?? [];
  const dayOfWeek = database.day_of_week ?? [];

  // 検索用 Map を作る（高速）
  const childrenMap = new Map(
    children
      .filter(c => c.is_delete === 0)
      .map(c => [Number(c.id), c])
  );

  const staffMap = new Map(
    staffs.map(s => [Number(s.id), s])
  );

  const dayMap = new Map(
    dayOfWeek.map(d => [Number(d.id), d])
  );

  // JOIN
  return managers2
    .map(m => {
      const child = childrenMap.get(Number(m.children_id));
      const staff = staffMap.get(Number(m.staff_id));
      const day = dayMap.get(Number(m.day_of_week_id));

      // JOIN 失敗は除外（SQL の INNER JOIN 相当）
      if (!child || !staff || !day) return null;

      return {
        children_id: m.children_id,
        children_name: child.name,

        staff_id: m.staff_id,
        staff_name: staff.name,

        day_of_week_id: m.day_of_week_id,
        day_of_week_label: day.label_jp,
        day_of_week_sort_order: day.sort_order,

        priority: m.priority ?? 0,
      };
    })
    .filter(Boolean);
}
