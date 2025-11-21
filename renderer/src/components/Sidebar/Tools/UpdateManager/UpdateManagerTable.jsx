// renderer/src/components/Sidebar/Tools/UpdateManager/UpdateManagerTable.jsx
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { managers_v } from "@/sql/useManager/getManager/managers_v.js";
import EditModal from "./Modals/EditModal.jsx";
import DeleteModal from "./Modals/DeleteModal.jsx";
import { useAppState } from "@/contexts/AppStateContext.jsx";
import { updateManager } from "@/sql/useManager/updateManager/updateManager.js";
import {store} from '@/store/store.js'

const MODAL_COMPONENTS = {
  edit: EditModal,
  delete: DeleteModal,
};

export default function UpdateManagerTable() {
  const database = useSelector((state) => state.database);
  const [managers, setManagers] = useState([]);

  const [modal, setModal] = useState({
    open: false,
    mode: "edit", // "edit" | "delete"
  });

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

  const handleConfirm = async (updatedManager) => {
    console.log("保存をクリック", updatedManager);
    await updateManager(updatedManager, {
        childrenData,
        managersData,
        activeApi: appState.activeApi,
        FACILITY_ID,
        STAFF_ID,
        WEEK_DAY,
      });
    setModal((prev) => ({ ...prev, open: false }));
  };
  

  const handleClose = () => {
    setModal((prev) => ({ ...prev, open: false }));
  };

  useEffect(() => {
    async function load() {
      const data = await managers_v({ tables: database, staffId: STAFF_ID });
      setManagers(data);
    }
    load();
  }, [database]);

  const parseDays = (dayStr) => {
    if (!dayStr) return [];

    try {
      const trimmed = String(dayStr).trim();

      if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
        const obj = JSON.parse(trimmed);
        if (obj && Array.isArray(obj.days)) return obj.days;
      }

      return trimmed
        .replace(/[\[\]"'{}]/g, " ")
        .trim()
        .split(/\s+|,/)
        .filter(Boolean);
    } catch {
      return [];
    }
  };

  const dayColor = {
    月: "bg-red-100 text-red-700 border-red-300",
    火: "bg-orange-100 text-orange-700 border-orange-300",
    水: "bg-yellow-100 text-yellow-700 border-yellow-300",
    木: "bg-green-100 text-green-700 border-green-300",
    金: "bg-blue-100 text-blue-700 border-blue-300",
    土: "bg-purple-100 text-purple-700 border-purple-300",
    日: "bg-pink-100 text-pink-700 border-pink-300",
  };

  // ← 動的モーダル
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
            {managers.map((m, index) => (
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

                <td className="border px-4 py-2">
                  <div className="flex flex-wrap gap-1">
                    {parseDays(m.day_of_week).map((day, i) => (
                      <span
                        key={i}
                        className={`p-2 text-xs rounded-xl font-semibold border ${
                          dayColor[day] ||
                          "bg-gray-100 text-gray-700 border-gray-300"
                        }`}
                      >
                        {day}
                      </span>
                    ))}
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
            ))}
          </tbody>
        </table>
      </div>

      {/* --- 動的モーダル --- */}
      {modal.open && DynamicModal && (
<DynamicModal
  open={modal.open}
  manager={selectedManager}
  onClose={handleClose}
  onConfirm={handleConfirm}
/>

      )}
    </div>
  );
}
