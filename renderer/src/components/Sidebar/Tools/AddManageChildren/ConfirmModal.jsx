import React from "react";

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-[500px] max-h-[80vh] overflow-y-auto text-center">
        <p className="text-lg font-medium mb-4">{message}</p>

        {/* ✅ 児童一覧の表示 */}
        {list.length > 0 && (
          <table className="w-full border border-gray-300 text-sm mb-4">
            <thead className="bg-gray-100 text-gray-700 sticky top-0">
              <tr>
                <th className="border px-2 py-1">児童ID</th>
                <th className="border px-2 py-1">児童名</th>
                <th className="border px-2 py-1">入室</th>
                <th className="border px-2 py-1">退室</th>
              </tr>
            </thead>
            <tbody>
              {list.map((child) => (
                <tr key={child.children_id} className="hover:bg-blue-50">
                  <td className="border px-2 py-1">{child.children_id}</td>
                  <td className="border px-2 py-1">{child.children_name}</td>
                  <td className="border px-2 py-1 text-green-700 font-semibold">
                    {child.column5}
                  </td>
                  <td className="border px-2 py-1 text-blue-700 font-semibold">
                    {child.column6 || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="flex justify-around">
          <button
            onClick={() => onConfirm(list)}
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
