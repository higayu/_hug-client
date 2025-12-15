// renderer/src/components/Sidebar/Tools/UpdateManager/UpdateManagerTable.jsx
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { managers_v } from "@/sql/useManager/getManager/managers_v.js";
import EditModal from "./Modals/EditModal.jsx";
import DeleteModal from "./Modals/DeleteModal.jsx";
//import { useAppState } from "@/contexts/AppStateContext.jsx";
import { useAppState } from '@/contexts/appState';
import { updateManager } from "@/sql/useManager/updateManager/updateManager.js";
import { deleteManager } from "@/sql/useManager/deleteManager/deleteManager.js";
import { store } from "@/store/store.js";
import { useToast } from  '@/components/common/ToastContext.jsx'
import { useChildrenList } from "@/hooks/useChildrenList.js";
import WeekDayButton from "@/components/common/WeekDayButton.jsx";

const MODAL_COMPONENTS = {
  edit: EditModal,
  delete: DeleteModal,
};

export default function UpdateManagerTable() {
  const database = useSelector((state) => state.database);
  const { showInfoToast,showErrorToast } = useToast();
  const { loadChildren } = useChildrenList();

  // 🔥 day_of_week テーブルを取得（label_jp, id, sort_order）
  const dayOfWeekMaster = useSelector(
    (state) => state.database?.day_of_week ?? []
  );

  const [managers, setManagers] = useState([]);
  const [modal, setModal] = useState({ open: false, mode: "edit" });
  const [selectedManager, setSelectedManager] = useState(null);

  const childrenData = store.getState().database.children;
  const managersData = store.getState().database.managers;

  const { STAFF_ID, WEEK_DAY, FACILITY_ID, appState } = useAppState();

  const handleDelete = (manager) => {
    setSelectedManager(manager);
    setModal({ open: true, mode: "delete" });
  };

  const handleEdit = (manager) => {
    setSelectedManager(manager);
    setModal({ open: true, mode: "edit" });
  };

  const handleConfirm = async (managerOrUpdated, mode) => {
    if (mode === "edit") {
      const result = await updateManager(managerOrUpdated, appState.DATABASE_TYPE);
      if (result) {
        showInfoToast("更新完了");
        await loadChildren();
      } else {
        showErrorToast("エラー");
      }
    }

    if (mode === "delete") {
      const { children_id, staff_id } = managerOrUpdated;
      const result = await deleteManager({ children_id, staff_id }, appState.DATABASE_TYPE);

      if (result) {
        showInfoToast("更新完了");
        await loadChildren();
      } else {
        showErrorToast("エラー");
      }
    }

    setModal((prev) => ({ ...prev, open: false }));
  };

  const handleClose = () => {
    setModal((prev) => ({ ...prev, open: false }));
  };

  // ------------------------------------------
  // 🔥 曜日パース（ID配列にして返す）
  // ------------------------------------------
  const parseDays = (dayStr) => {
    if (!dayStr) return [];

    try {
      const s = String(dayStr).trim();

      // JSON形式 {"days":[1,3,5]}
      if (s.startsWith("{") && s.endsWith("}")) {
        const obj = JSON.parse(s);
        if (obj && Array.isArray(obj.days)) return obj.days;
      }

      // 文字列などその他形式 → 数字へ変換
      return s
        .replace(/[\[\]"'{}]/g, " ")
        .trim()
        .split(/\s+|,/)
        .map((v) => Number(v))
        .filter((n) => !Number.isNaN(n));
    } catch {
      return [];
    }
  };


  useEffect(() => {
    async function load() {
      const data = await managers_v({ tables: database, staffId: STAFF_ID });
      setManagers(data);
    }
    load();
  }, [database]);

  const DynamicModal = MODAL_COMPONENTS[modal.mode];

  return (
    <div className="p-2 bg-white shadow rounded-xl">
      <h4 className="text-lg font-bold mb-2">児童担当編集</h4>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="text-xs">削除</th>
              <th className="border px-4 py-2 text-xs">子どもID</th>
              <th className="border px-4 py-2 text-xs">子ども名</th>
              <th className="border px-4 py-2 text-xs">スタッフ名</th>
              <th className="border px-4 py-2 text-xs">曜日</th>
              <th className="text-xs">編集</th>
            </tr>
          </thead>

          <tbody>
            {managers.map((m, index) => {
              // 🔥 m.day_of_week → [1,3,5]（曜日ID）
              const dayIds = parseDays(m.day_of_week);

              return (
                <tr key={index}>
                  <td className="border px-4 py-2">
                    <button
                      className="bg-red-500 text-xs text-white p-2 rounded-md"
                      onClick={() => handleDelete(m)}
                    >
                      削除
                    </button>
                  </td>

                  <td className="border px-4 py-2 text-xs">{m.children_id}</td>
                  <td className="border px-4 py-2 text-xs">{m.children_name}</td>
                  <td className="border px-4 py-2 text-xs">{m.staff_name}</td>

                  {/* 🔥 曜日表示（ID → label_jp） */}
                  <td className="border px-4 py-2">
                    <div className="flex flex-wrap gap-1">
                      {dayIds.map((id) => {
                        const w = dayOfWeekMaster.find((d) => d.id === id);
                        const label = w?.label_jp ?? "？";

                        return (
                          <WeekDayButton 
                            key={id}
                            dayId={id}
                            label={label}
                          />
                        );
                      })}
                    </div>
                  </td>


                  <td className="border px-4 py-2">
                    <button
                      className="bg-blue-500 text-xs text-white p-2 rounded-md"
                      onClick={() => handleEdit(m)}
                    >
                      編集
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* --- 動的モーダル --- */}
      {modal.open && DynamicModal && (
      <DynamicModal
        open={modal.open}
        mode={modal.mode}   // ← 追加
        manager={selectedManager}
        onClose={handleClose}
        onConfirm={handleConfirm}
      />
      )}
    </div>
  );
}
