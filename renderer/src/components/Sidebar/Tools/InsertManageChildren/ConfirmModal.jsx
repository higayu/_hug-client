import React, { useState, useEffect } from "react";
import { useAppState } from "@/contexts/appState";
import { store } from "@/store/store.js";
import { useSelector } from "react-redux";
import { updateManager, getManagerRecord } from "@/utils/managersUtils.js";

/**
 * 確認モーダルコンポーネント
 */
function ConfirmModal({ show, message, list = [], onConfirm, onCancel }) {
  const database = useSelector((state) => state.database);

  const pronunciation = store.getState().database.pronunciation;
  const childrenType = store.getState().database.children_type;
  const childrenData = store.getState().database.children;

  // ✅ 新仕様：CURRENT_DATE から weekdayId を直接取得
  const { STAFF_ID, FACILITY_ID, CURRENT_DATE } = useAppState();
  const weekdayId = CURRENT_DATE?.weekdayId;

  const [selectedValues, setSelectedValues] = useState({});

  useEffect(() => {
    console.log("職員ID", STAFF_ID);
    console.log("曜日ID", weekdayId);
    console.log("day_of_week マスタ", database["day_of_week"]);
    console.log("managers データ", database["managers"]);
  }, [database, STAFF_ID, weekdayId]);

  // モーダル非表示
  if (!show) return null;

  const handleSelectChange = (children_id, key, value) => {
    setSelectedValues((prev) => ({
      ...prev,
      [children_id]: { ...prev[children_id], [key]: value },
    }));
  };

  const handleConfirm = () => {
    const managersList = database["managers"];

    if (!weekdayId) {
      console.error("❌ weekdayId が未設定です");
      return;
    }

    const updatedList = list.map((child) => {
      const existingChild = childrenData.find(
        (c) => String(c.id) === String(child.children_id)
      );

      // ① 既存の manager レコード取得
      const managerRecord = getManagerRecord(
        child.children_id,
        STAFF_ID,
        managersList
      );

      // ② weekdayId をそのまま使う（変換不要）
      const updatedDayJson = updateManager(
        managerRecord?.day_of_week,
        weekdayId
      );

      return {
        ...child,
        pronunciation_id:
          existingChild?.pronunciation_id ??
          selectedValues[child.children_id]?.pronunciation_id ??
          null,

        children_type_id:
          existingChild?.children_type_id ??
          selectedValues[child.children_id]?.children_type_id ??
          null,

        // ★ 更新後の day_of_week JSON
        day_of_week: updatedDayJson,
      };
    });

    console.log("送信データ(updatedList):", updatedList);
    onConfirm(updatedList);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-[500px] max-h-[80vh] overflow-y-auto text-center">
        <p className="text-lg font-medium mb-4">{message}</p>

        {list.length > 0 && (
          <table className="w-full border border-gray-300 text-sm mb-4">
            <thead className="bg-gray-100 text-gray-700 sticky top-0">
              <tr>
                <th className="border px-2 py-1">児童ID</th>
                <th className="border px-2 py-1">児童名</th>
                <th className="border px-2 py-1">検索文字</th>
                <th className="border px-2 py-1">利用種別</th>
              </tr>
            </thead>
            <tbody>
              {list.map((child) => {
                const existingChild = childrenData.find(
                  (c) => String(c.id) === String(child.children_id)
                );

                const isExisting = !!existingChild;

                return (
                  <tr key={child.children_id} className="hover:bg-blue-50">
                    <td className="border px-2 py-1">{child.children_id}</td>
                    <td className="border px-2 py-1">{child.children_name}</td>

                    <td className="border px-2 py-1">
                      <select
                        className={`border px-2 py-1 w-full ${
                          isExisting ? "bg-gray-100 text-gray-600" : ""
                        }`}
                        value={
                          existingChild?.pronunciation_id ??
                          selectedValues[child.children_id]?.pronunciation_id ??
                          ""
                        }
                        disabled={isExisting}
                        onChange={(e) =>
                          handleSelectChange(
                            child.children_id,
                            "pronunciation_id",
                            e.target.value
                          )
                        }
                      >
                        <option value="">未選択</option>
                        {pronunciation.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.pronunciation}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="border px-2 py-1">
                      <select
                        className={`border px-2 py-1 w-full ${
                          isExisting ? "bg-gray-100 text-gray-600" : ""
                        }`}
                        value={
                          existingChild?.children_type_id ??
                          selectedValues[child.children_id]?.children_type_id ??
                          ""
                        }
                        disabled={isExisting}
                        onChange={(e) =>
                          handleSelectChange(
                            child.children_id,
                            "children_type_id",
                            e.target.value
                          )
                        }
                      >
                        <option value="">未選択</option>
                        {childrenType.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        <div className="flex justify-around">
          <button
            onClick={handleConfirm}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            はい
          </button>
          <button
            onClick={onCancel}
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
          >
            いいえ
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
