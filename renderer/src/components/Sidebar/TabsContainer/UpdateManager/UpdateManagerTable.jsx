// renderer/src/components/Sidebar/Tools/UpdateManager/UpdateManagerTable.jsx
import { useEffect, useState, useMemo } from "react";
import EditModal from "./Modals/EditModal.jsx";
import DeleteModal from "./Modals/DeleteModal.jsx";
import { deleteManager } from "./function/deleteManager";
import { updateManager } from "./function/updateManager";
import { useToast } from "@/components/common/ToastContext.jsx";
import { useDataBase } from "@/hooks/useDataBase";
import { selectManagersFull } from "./selectManagersFull.js";
import { useAppState } from "@/AppStateContext";

const MODAL_COMPONENTS = {
  edit: EditModal,
  delete: DeleteModal,
};

export default function UpdateManagerTable() {
  const { showInfoToast, showErrorToast } = useToast();
  const { loadDataBase } = useDataBase();

  const {
    STAFF_ID,
    appState,
    CURRENT_DAY_OF_WEEK,
    databaseState,
  } = useAppState();

  // ------------------------------------------
  // DB から取得済みのテーブル
  // ------------------------------------------
  const database = useMemo(() => {
    return databaseState ?? {};
  }, [databaseState]);

  // console.log("[UpdateManagerTable] databaseState:", databaseState);
  // console.log("[UpdateManagerTable] databaseState.managers2:", databaseState?.managers2);
  // console.table(databaseState?.managers2 ?? []);

  const dayOfWeekMaster = useMemo(() => {
    return database.day_of_week ?? [];
  }, [database]);

  const managers = useMemo(() => {
    return selectManagersFull(database);
  }, [database]);

  const [activeDayId, setActiveDayId] = useState(null);

  const [modal, setModal] = useState({
    open: false,
    mode: "edit",
  });

  const [selectedManager, setSelectedManager] = useState(null);

  // ------------------------------------------
  // 初期表示する曜日をセット
  // ------------------------------------------
  useEffect(() => {
    if (dayOfWeekMaster.length === 0) return;
    if (activeDayId != null) return;

    const today = dayOfWeekMaster.find(
      (d) => Number(d.id) === Number(CURRENT_DAY_OF_WEEK?.weekdayId)
    );

    if (today) {
      setActiveDayId(today.id);
      return;
    }

    const firstDay = [...dayOfWeekMaster].sort(
      (a, b) => Number(a.sort_order) - Number(b.sort_order)
    )[0];

    setActiveDayId(firstDay?.id ?? null);
  }, [
    dayOfWeekMaster,
    CURRENT_DAY_OF_WEEK?.weekdayId,
    activeDayId,
  ]);

  const formatTimeForDisplay = (value) => {
    if (!value) return "-";
  
    return String(value).slice(0, 5);
  };

  // ------------------------------------------
  // 表示用：曜日で絞り込み
  // ------------------------------------------
  const filteredManagers = useMemo(() => {
    if (activeDayId == null) return [];
  
    const result = managers
      .filter(
        (m) =>
          Number(m.day_of_week_id) === Number(activeDayId) &&
          Number(m.staff_id) === Number(STAFF_ID)
      )
      .sort((a, b) =>
        String(a.children_name ?? "").localeCompare(
          String(b.children_name ?? ""),
          "ja"
        )
      );
  
    console.log("[UpdateManagerTable] filter debug:", {
      activeDayId,
      STAFF_ID,
      managersCount: managers.length,
      resultCount: result.length,
      managersSample: managers[0],
      result,
    });
  
    console.table(
      result.map((m) => ({
        children_id: m.children_id,
        children_name: m.children_name,
        staff_id: m.staff_id,
        staff_name: m.staff_name,
        day_of_week_id: m.day_of_week_id,
        support_start_time: m.support_start_time,
        support_end_time: m.support_end_time,
        priority: m.priority,
      }))
    );
  
    return result;
  }, [managers, activeDayId, STAFF_ID]);

  // ------------------------------------------
  // 操作系
  // ------------------------------------------
  const handleEdit = (manager) => {
    setSelectedManager(manager);

    setModal({
      open: true,
      mode: "edit",
    });
  };

  const handleDelete = (manager) => {
    setSelectedManager(manager);

    setModal({
      open: true,
      mode: "delete",
    });
  };

  const handleConfirm = async (managerOrUpdated, mode) => {
    try {
      if (mode === "delete") {
        const { children_id, staff_id, day_of_week_id } = managerOrUpdated;

        const result = await deleteManager(
          {
            children_id,
            staff_id,
            day_of_week_id,
          },
          appState.DATABASE_TYPE
        );

        if (!result) {
          throw new Error("削除に失敗しました");
        }
      }

      if (mode === "edit") {
        // EditModal 側で保存処理をしているならここは空でOK
        // 親側で保存するなら updateManager(...) をここに追加
      }

      showInfoToast("更新完了");
      await loadDataBase();
    } catch (error) {
      console.error("[UpdateManagerTable] handleConfirm error:", error);
      showErrorToast("エラー");
    } finally {
      setModal({
        open: false,
        mode: "edit",
      });

      setSelectedManager(null);
    }
  };

  const handleClose = () => {
    setModal((prev) => ({
      ...prev,
      open: false,
    }));

    setSelectedManager(null);
  };

  const DynamicModal = MODAL_COMPONENTS[modal.mode];

  return (
    <div className="p-2 bg-white shadow rounded-xl">
      <h4 className="text-lg font-bold mb-2">児童担当編集</h4>

      <div className="flex gap-2 mb-3">
        {[...dayOfWeekMaster]
          .sort((a, b) => Number(a.sort_order) - Number(b.sort_order))
          .map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => setActiveDayId(d.id)}
              className={`px-3 py-1 rounded-full text-sm font-semibold border ${
                Number(activeDayId) === Number(d.id)
                  ? "bg-blue-500 text-white border-blue-500"
                  : "bg-gray-100 text-gray-700 border-gray-300"
              }`}
            >
              {d.label_jp}
            </button>
          ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
            <th className="border px-4 text-xs">編集</th>
            <th className="border px-4 text-xs">削除</th>
            <th className="border px-4 py-2 text-xs">子どもID</th>
            <th className="border px-4 py-2 text-xs">子ども名</th>
            <th className="border px-4 py-2 text-xs">スタッフ名</th>
            <th className="border px-4 py-2 text-xs">支援開始</th>
            <th className="border px-4 py-2 text-xs">支援終了</th>
            </tr>
          </thead>

          <tbody>
            {filteredManagers.length > 0 ? (
              filteredManagers.map((m) => (
                <tr
                  key={`${m.children_id}-${m.staff_id}-${m.day_of_week_id}`}
                >
                  <td className="border px-4 py-2">
                    <button
                      type="button"
                      className="bg-blue-500 text-xs text-white p-2 rounded-md"
                      onClick={() => handleEdit(m)}
                    >
                      編集
                    </button>
                  </td>

                  <td className="border px-4 py-2">
                    <button
                      type="button"
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

                  <td className="border px-4 py-2 text-xs">
                    {formatTimeForDisplay(m.support_start_time)}
                  </td>

                  <td className="border px-4 py-2 text-xs">
                    {formatTimeForDisplay(m.support_end_time)}
                  </td>

                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={5}
                  className="text-center text-gray-400 py-6 text-sm"
                >
                  この曜日の担当はありません
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

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