
import { useState, useEffect } from "react";


export default function EditModal({ open, onClose, manager, onConfirm }) {
  const [childrenId, setChildrenId] = useState("");
  const [childrenName, setChildrenName] = useState("");
  const [staffName, setStaffName] = useState("");
  const [days, setDays] = useState([]);

  const dayOptions = ["月", "火", "水", "木", "金", "土", "日"];

  useEffect(() => {
    if (manager) {
      setChildrenId(manager.children_id || "");
      setChildrenName(manager.children_name || "");
      setStaffName(manager.staff_name || "");
      setDays(manager.day_of_week ? JSON.parse(manager.day_of_week).days || [] : []);
    }
  }, [manager]);

  const toggleDay = (day) => {
    setDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSubmit = () => {
    const updated = {
      ...manager,
      children_id: childrenId,
      children_name: childrenName,
      staff_name: staffName,
      day_of_week: JSON.stringify({ days }),
    };
    onConfirm(updated);
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
              {dayOptions.map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={`px-3 py-1 text-xs rounded-full border font-semibold ${
                    days.includes(day)
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100"
                  }`}
                >
                  {day}
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
