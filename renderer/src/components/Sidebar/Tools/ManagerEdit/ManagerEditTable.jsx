// renderer/src/components/Sidebar/Tools/ManagerEdit/ManagerEditTable.jsx
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { managers_v } from "@/sql/useManager/getManager/managers_v.js";
import DeleteModal from "./Modals/DeleteModal.jsx";
import EditModal from "./Modals/EditModal.jsx";
import { useAppState } from '@/contexts/AppStateContext.jsx'

export default function ManagerEditTable() {
  const database = useSelector((state) => state.database);
  const [managers, setManagers] = useState([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedManager, setSelectedManager] = useState(null);
  const { STAFF_ID } = useAppState();

  console.log(STAFF_ID);

  const handleDelete = (manager) => {
    setSelectedManager(manager);
    setDeleteModalOpen(true);
  };

  const handleEdit = (manager) => {
    setSelectedManager(manager);
    setEditModalOpen(true);
  };

  const handleConfirmDelete = () => {
    console.log("削除モーダルを閉じます");
    setDeleteModalOpen(false);
  };

  const handleConfirmEdit = () => {
    console.log("編集モーダルを閉じます");
    setEditModalOpen(false);
  };

  useEffect(() => {
    async function load() {
      const data = await managers_v({ tables: database, staffId: STAFF_ID });
      setManagers(data);
    }
    load();
  }, [database]);

  // --- 曜日パース関数（Managers.jsx と同じ） ---
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

  // --- 曜日チップの色（Managers.jsx と同じ） ---
  const dayColor = {
    月: "bg-red-100 text-red-700 border-red-300",
    火: "bg-orange-100 text-orange-700 border-orange-300",
    水: "bg-yellow-100 text-yellow-700 border-yellow-300",
    木: "bg-green-100 text-green-700 border-green-300",
    金: "bg-blue-100 text-blue-700 border-blue-300",
    土: "bg-purple-100 text-purple-700 border-purple-300",
    日: "bg-pink-100 text-pink-700 border-pink-300",
  };

  return (
    <div className="p-2 bg-white shadow rounded-xl">
      <h4 className="text-lg font-bold mb-2">児童担当編集</h4>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="text-xs">削除ボタン</th>
              <th className="border px-4 py-2 text-xs">子どもID</th>
              <th className="border px-4 py-2 text-xs">子ども名</th>
              <th className="border px-4 py-2 text-xs">スタッフ名</th>
              <th className="border px-4 py-2 text-xs">曜日</th>
              <th className="text-xs">編集ボタン</th>
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

                {/* --- 曜日チップ表示部分 --- */}
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
                  <button className="bg-blue-500 text-xs text-white p-2 rounded-md"
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
    </div>
  );
}
