// renderer\src\components\Sidebar\Tools\UpdateManager\Modals\EditModal.jsx
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";

export default function EditModal({ open, onClose, manager, onConfirm }) {
  const [childrenId, setChildrenId] = useState("");
  const [childrenName, setChildrenName] = useState("");
  const [staffName, setStaffName] = useState("");
  const [days, setDays] = useState([]); // ← ID配列

  // 🔥 DB の曜日マスタ
  const dayOfWeekMaster = useSelector(
    (state) => state.database?.day_of_week ?? []
  );

  useEffect(() => {
    if (manager) {
      setChildrenId(manager.children_id || "");
      setChildrenName(manager.children_name || "");
      setStaffName(manager.staff_name || "");

      try {
        const parsed = JSON.parse(manager.day_of_week);
        setDays(Array.isArray(parsed.days) ? parsed.days : []);
      } catch {
        setDays([]);
      }
    }
  }, [manager]);

  // トグル
  const toggleDay = (id) => {
    setDays((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  // 保存
  const handleSubmit = () => {
    const updated = {
      ...manager,
      children_id: childrenId,
      children_name: childrenName,
      staff_name: staffName,
      day_of_week: JSON.stringify({ days }),
    };

   onConfirm(updated, "edit");
  };

  return (
    open && (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-xl w-96 shadow-xl">
          <h2 className="text-lg font-bold mb-4">編集</h2>

          <div className="flex flex-col gap-3 mt-2">
            <label className="text-sm font-semibold">子どもID</label>
            <input
              value={childrenId}
              onChange={(e) => setChildrenId(e.target.value)}
              className="border p-2 rounded-md text-sm"
            />

            <label className="text-sm font-semibold">子ども名</label>
            <input
              value={childrenName}
              onChange={(e) => setChildrenName(e.target.value)}
              className="border p-2 rounded-md text-sm"
            />

            <label className="text-sm font-semibold">スタッフ名</label>
            <input
              value={staffName}
              onChange={(e) => setStaffName(e.target.value)}
              className="border p-2 rounded-md text-sm"
            />

            <label className="text-sm font-semibold">曜日</label>
            <div className="flex gap-2 flex-wrap">

              {/* 🔥 ここが修正点：sortする前にコピー */}
              {[...dayOfWeekMaster]
                .sort((a, b) => a.sort_order - b.sort_order)
                .map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => toggleDay(d.id)}
                    className={`px-3 py-1 text-xs rounded-full border font-semibold ${
                      days.includes(d.id)
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {d.label_jp}
                  </button>
                ))}
            </div>
          </div>

          <div className="mt-6 flex gap-3 justify-end">
            <button
              className="px-4 py-2 rounded-md text-sm text-gray-700 border border-gray-300"
              onClick={onClose}
            >
              キャンセル
            </button>

            <button
              className="px-4 py-2 rounded-md text-sm text-white bg-blue-500"
              onClick={handleSubmit}
            >
              保存
            </button>
          </div>
        </div>
      </div>
    )
  );
}

