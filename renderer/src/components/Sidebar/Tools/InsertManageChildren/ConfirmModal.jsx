import React, { useState } from "react";
import { useAppState } from "@/contexts/AppStateContext.jsx";
import { store } from "@/store/store.js";

/**
 * 確認モーダルコンポーネント
 * @param {boolean} show - モーダルを表示するかどうか
 * @param {string} message - 表示メッセージ
 * @param {Array} list - 表示する児童リスト（任意）
 * @param {function} onConfirm - 「はい」クリック時
 * @param {function} onCancel - 「いいえ」クリック時
 */
function ConfirmModal({ show, message, list = [], onConfirm, onCancel }) {
  if (!show) return null;

  const pronunciation = store.getState().database.pronunciation;
  const childrenType = store.getState().database.children_type;
  const childrenData = store.getState().database.children;
  const { STAFF_ID, WEEK_DAY, FACILITY_ID } = useAppState();

  // ✅ 各児童の選択内容を管理
  const [selectedValues, setSelectedValues] = useState({});

  const handleSelectChange = (children_id, key, value) => {
    setSelectedValues((prev) => ({
      ...prev,
      [children_id]: { ...prev[children_id], [key]: value },
    }));
  };

  const handleConfirm = () => {
    // ✅ 選択結果を list にマージ
    const updatedList = list.map((child) => {
      const existingChild = childrenData.find(
        (c) => String(c.id) === String(child.children_id)
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
      };
    });

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

                const isExisting = !!existingChild; // ✅ 児童テーブルに存在するか判定

                return (
                  <tr key={child.children_id} className="hover:bg-blue-50">
                    <td className="border px-2 py-1">{child.children_id}</td>
                    <td className="border px-2 py-1">{child.children_name}</td>

                    {/* ✅ 検索文字（既存なら固定） */}
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

                    {/* ✅ 利用種別（既存なら固定） */}
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
