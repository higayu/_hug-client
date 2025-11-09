import store from "../../store/store.js";

/**
 * facility_staff, staffs, facilitys を結合して
 * SQLと同等のデータ構造を生成する関数
 */
export function getJoinedStaffFacilityData() {
  const state = store.getState().sqlite;
  const staffs = state.staffs || [];
  const facilityStaff = state.facility_staff || [];
  const facilitys = state.facilitys || [];

  console.log("🧾 データ確認:", { staffs, facilityStaff, facilitys });

  // スタッフごとの施設情報をまとめる
  const result = staffs
    .filter((s) => s.id !== -1 && s.is_delete !== 1) // WHERE句
    .map((s) => {
      // このスタッフに紐づく施設レコードを抽出
      const relatedFs = facilityStaff.filter((fs) => fs.staff_id === s.id);

      // 紐づく施設のIDと名前を取得
      const relatedFacilities = relatedFs
        .map((fs) => facilitys.find((f) => f.id === fs.facility_id))
        .filter(Boolean); // null除外

      // group_concatの代替: join(',')
      const facility_ids = relatedFacilities.map((f) => f.id).join(",");
      const facility_names = relatedFacilities.map((f) => f.name).join(", ");

      return {
        staff_id: s.id,
        staff_name: s.name,
        notes: s.notes,
        is_delete: s.is_delete,
        facility_ids,
        facility_names,
      };
    });

  console.log("✅ 結合結果:", result);
  return result;
}
