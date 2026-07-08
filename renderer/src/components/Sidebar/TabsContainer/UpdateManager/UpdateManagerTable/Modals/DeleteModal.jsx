// renderer/src/components/Sidebar/TabsContainer/UpdateManager/Modals/DeleteModal.jsx

import { ModalPortal } from "@/components/common/ModalPortal";

export default function DeleteModal({ open, onClose, onConfirm, manager }) {
  if (!open) return null;

  const facilityId = Number(manager?.facility_id);
  const childrenId = Number(manager?.children_id);
  const staffId = Number(manager?.staff_id);
  const dayOfWeekId = Number(manager?.day_of_week_id);

  const hasFacilityId = Number.isFinite(facilityId);
  const hasChildrenId = Number.isFinite(childrenId);
  const hasStaffId = Number.isFinite(staffId);
  const hasDayOfWeekId = Number.isFinite(dayOfWeekId);

  const canDelete = hasFacilityId && hasChildrenId && hasStaffId;

  const handleDelete = () => {
    if (!canDelete) {
      console.warn("⚠️ DeleteModal: 削除に必要なIDが不足しています", {
        manager,
        facilityId,
        childrenId,
        staffId,
        dayOfWeekId,
      });
      return;
    }

    onConfirm(
      {
        ...manager,
        facility_id: facilityId,
        children_id: childrenId,
        staff_id: staffId,
        day_of_week_id: hasDayOfWeekId ? dayOfWeekId : manager?.day_of_week_id,
      },
      "delete"
    );
  };

  return (
    <ModalPortal>
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-xl w-96 shadow-xl">
          <h2 className="text-lg font-bold mb-4">削除確認</h2>

          <p className="text-sm">以下の担当データを削除しますか？</p>

          <div className="mt-3 p-3 border rounded-md bg-gray-50 text-sm">
            <p>
              <b>施設ID:</b> {hasFacilityId ? facilityId : "-"}
            </p>
            <p>
              <b>児童ID:</b> {hasChildrenId ? childrenId : "-"}
            </p>
            <p>
              <b>子ども名:</b> {manager?.children_name ?? "-"}
            </p>
            <p>
              <b>スタッフID:</b> {hasStaffId ? staffId : "-"}
            </p>
            <p>
              <b>スタッフ:</b> {manager?.staff_name ?? "-"}
            </p>

            {hasDayOfWeekId && (
              <p>
                <b>曜日ID:</b> {dayOfWeekId}
              </p>
            )}
          </div>

          {!canDelete && (
            <p className="mt-3 text-xs text-red-500">
              facility_id / children_id / staff_id のいずれかが取得できないため削除できません。
            </p>
          )}

          <div className="mt-6 flex gap-3 justify-end">
            <button
              type="button"
              className="px-4 py-2 border rounded-md text-sm"
              onClick={onClose}
            >
              キャンセル
            </button>

            <button
              type="button"
              className={`px-4 py-2 rounded-md text-sm text-white ${
                canDelete
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-gray-300 cursor-not-allowed"
              }`}
              disabled={!canDelete}
              onClick={handleDelete}
            >
              削除
            </button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}