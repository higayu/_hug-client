// renderer/src/components/Sidebar/Tools/InsertChildren/filterManagers2ByStaffAndWeekday.js

/**
 * managers2 から、指定スタッフID・曜日IDに一致するレコードだけ抽出する
 *
 * @param {Array} managers2 managers2 の配列
 * @param {number|string} staffId スタッフID
 * @param {number|string} weekdayId 曜日ID
 * @returns {Array}
 */
export function filterManagers2ByStaffAndWeekday(
  managers2,
  staffId,
  weekdayId
) {
  if (!Array.isArray(managers2)) {
    return [];
  }

  const targetStaffId = Number(staffId);
  const targetWeekdayId = Number(weekdayId);

  if (!Number.isFinite(targetStaffId) || !Number.isFinite(targetWeekdayId)) {
    console.warn("[filterManagers2ByStaffAndWeekday] 引数が不正です", {
      staffId,
      weekdayId,
      targetStaffId,
      targetWeekdayId,
    });

    return [];
  }

  return managers2.filter((manager) => {
    return (
      Number(manager?.staff_id) === targetStaffId &&
      Number(manager?.day_of_week_id) === targetWeekdayId
    );
  });
}

/**
 * 抽出結果から children_id だけを Set で返す
 * 次段階の「登録済み判定」に使える
 *
 * @param {Array} managers2 managers2 の配列
 * @param {number|string} staffId スタッフID
 * @param {number|string} weekdayId 曜日ID
 * @returns {Set<number>}
 */
export function getManagedChildrenIdSetByStaffAndWeekday(
  managers2,
  staffId,
  weekdayId
) {
  const filtered = filterManagers2ByStaffAndWeekday(
    managers2,
    staffId,
    weekdayId
  );

  return new Set(
    filtered
      .map((manager) => Number(manager?.children_id))
      .filter((id) => Number.isFinite(id))
  );
}