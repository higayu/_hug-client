// renderer/src/sql/useManager/getManager/managers_v.js
export async function managers_v({ tables, staffId = null }) {
  if (!tables) return [];

  const {
    children = [],
    staffs = [],
    managers = [],
  } = tables;

  // SQL と完全に同じ JOIN
  const joined = managers
    .map((m) => {
      const c = children.find((x) => x.id === m.children_id);
      const s = staffs.find((x) => x.id === m.staff_id);
      if (!c || !s) return null;

      return {
        children_id: c.id,
        children_name: c.name,
        staff_id: s.id,
        staff_name: s.name,
        day_of_week: m.day_of_week,
      };
    })
    .filter(Boolean)
    .sort((a, b) => {
      if (a.children_id !== b.children_id) return a.children_id - b.children_id;
      return a.staff_id - b.staff_id;
    });

  // --- ✅ 追加：ログインスタッフで抽出 ---
  if (staffId !== null && staffId !== "" && !isNaN(staffId)) {
    const idNum = Number(staffId);
    return joined.filter((r) => Number(r.staff_id) === idNum);
  }

  // staffId が未指定なら全件返す
  return joined;
}

