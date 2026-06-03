// src/utils/managersUtils.js

/**
 * 特定の児童ID & スタッフID の manager レコードを取得
 * 見つからない場合は day_of_week={"days":[]} を返す
 */
export const getManagerRecord = (childrenId, staffId, managersList) => {
  if (!Array.isArray(managersList)) {
    return { children_id: childrenId, staff_id: staffId, day_of_week: JSON.stringify({ days: [] }) };
  }

  const record = managersList.find(
    (m) =>
      Number(m.children_id) === Number(childrenId) &&
      Number(m.staff_id) === Number(staffId)
  );

  if (!record) {
    // ★ 見つからない場合の返却
    return {
      children_id: childrenId,
      staff_id: staffId,
      day_of_week: JSON.stringify({ days: [] })
    };
  }

  return record;
};


/**
 * day_of_week JSON に曜日IDを追加して返す
 * @param {string|object} WeekDate - {"days":[2]} の JSON 文字列 または オブジェクト
 * @param {number} weekID - 追加したい曜日 ID
 * @returns {string} 更新された JSON 文字列
 */
export const updateManager = (WeekDate, weekID) => {
  if (!WeekDate) return JSON.stringify({ days: [weekID] });

  // 文字列ならパース、すでにオブジェクトならそのまま使う
  const parsed = typeof WeekDate === "string"
    ? JSON.parse(WeekDate)
    : WeekDate;

  if (!Array.isArray(parsed.days)) {
    parsed.days = [];
  }

  // 重複チェックして追加
  if (!parsed.days.includes(Number(weekID))) {
    parsed.days.push(Number(weekID));
  }

  return JSON.stringify(parsed);
};
