// renderer/src/components/Sidebar/Tools/UpdateManager/UpdateManagerTable.jsx
import { useSelector } from "react-redux";
import { useEffect, useState, useMemo } from "react";
import EditModal from "./Modals/EditModal.jsx";
import DeleteModal from "./Modals/DeleteModal.jsx";
import { useAppState } from "@/contexts/appState";
import { deleteManager } from "@/sql/useManager/deleteManager/deleteManager.js";
import { store } from "@/store/store.js";
import { useToast } from "@/components/common/ToastContext.jsx";
import { useChildrenList } from "@/hooks/useChildrenList.js";
import { selectManagersFull } from "./selectManagersFull.js";

const MODAL_COMPONENTS = {
  edit: EditModal,
  delete: DeleteModal,
};

export default function UpdateManagerTable() {
  const { showInfoToast, showErrorToast } = useToast();
  const { loadChildren } = useChildrenList();
  const { STAFF_ID, appState } = useAppState();

  // DB から取得済みのテーブル
  const database = useSelector((state) => state.database);
  const dayOfWeekMaster =
    useSelector((state) => state.database?.day_of_week) ?? [];

  const [managers, setManagers] = useState([]);
  const [activeDayId, setActiveDayId] = useState(null);

  const [modal, setModal] = useState({ open: false, mode: "edit" });
  const [selectedManager, setSelectedManager] = useState(null);

  // ------------------------------------------
  // 初期ロード
  // ------------------------------------------
  useEffect(() => {
    const data = selectManagersFull(database);
    setManagers(data);

    // 初期タブ（最小 sort_order の曜日）
    if (dayOfWeekMaster.length > 0 && activeDayId == null) {
      const firstDay = [...dayOfWeekMaster].sort(
        (a, b) => a.sort_order - b.sort_order
      )[0];
      setActiveDayId(firstDay.id);
    }
  }, [database, dayOfWeekMaster]);

  // ------------------------------------------
  // 表示用：曜日で絞り込み
  // ------------------------------------------
  const filteredManagers = useMemo(() => {
    if (!activeDayId) return [];

    return managers
      .filter(
        (m) =>
          m.day_of_week_id === activeDayId &&
          Number(m.staff_id) === Number(STAFF_ID)
      )
      .sort((a, b) =>
        a.children_name.localeCompare(b.children_name, "ja")
      );
  }, [managers, activeDayId, STAFF_ID]);

  // ------------------------------------------
  // 操作系
  // ------------------------------------------
  const handleDelete = (manager) => {
    setSelectedManager(manager);
    setModal({ open: true, mode: "delete" });
  };


  const handleConfirm = async (managerOrUpdated, mode) => {
    try {
      if (mode === "delete") {
        const { children_id, staff_id, day_of_week_id } = managerOrUpdated;
        const result = await deleteManager(
          { children_id, staff_id, day_of_week_id },
          appState.DATABASE_TYPE
        );
        if (!result) throw new Error();
      }

      showInfoToast("更新完了");
      await loadChildren();
    } catch {
      showErrorToast("エラー");
    } finally {
      setModal((prev) => ({ ...prev, open: false }));
    }
  };

  const handleClose = () => {
    setModal((prev) => ({ ...prev, open: false }));
  };

  const DynamicModal = MODAL_COMPONENTS[modal.mode];

  // ------------------------------------------
  // UI
  // ------------------------------------------
  return (
    <div className="p-2 bg-white shadow rounded-xl">
      <h4 className="text-lg font-bold mb-2">児童担当編集</h4>

      {/* ===== 曜日タブ ===== */}
      <div className="flex gap-2 mb-3">
        {[...dayOfWeekMaster]
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((d) => (
            <button
              key={d.id}
              onClick={() => setActiveDayId(d.id)}
              className={`px-3 py-1 rounded-full text-sm font-semibold border
                ${
                  activeDayId === d.id
                    ? "bg-blue-500 text-white border-blue-500"
                    : "bg-gray-100 text-gray-700 border-gray-300"
                }`}
            >
              {d.label_jp}
            </button>
          ))}
      </div>

      {/* ===== テーブル ===== */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="text-xs">削除</th>
              <th className="border px-4 py-2 text-xs">子どもID</th>
              <th className="border px-4 py-2 text-xs">子ども名</th>
              <th className="border px-4 py-2 text-xs">スタッフ名</th>
            </tr>
          </thead>

          <tbody>
            {filteredManagers.length > 0 ? (
              filteredManagers.map((m, index) => (
                <tr key={index}>
                  <td className="border px-4 py-2">
                    <button
                      className="bg-red-500 text-xs text-white p-2 rounded-md"
                      onClick={() => handleDelete(m)}
                    >
                      削除
                    </button>
                  </td>

                  <td className="border px-4 py-2 text-xs">
                    {m.children_id}
                  </td>
                  <td className="border px-4 py-2 text-xs">
                    {m.children_name}
                  </td>
                  <td className="border px-4 py-2 text-xs">
                    {m.staff_name}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={4}
                  className="text-center text-gray-400 py-6 text-sm"
                >
                  この曜日の担当はありません
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ===== モーダル ===== */}
      {modal.open && DynamicModal && (
        <DynamicModal
          open={modal.open}
          mode={modal.mode}
          manager={selectedManager}
          onClose={handleClose}
          onConfirm={handleConfirm}
        />
      )}
    </div>
  );
}
