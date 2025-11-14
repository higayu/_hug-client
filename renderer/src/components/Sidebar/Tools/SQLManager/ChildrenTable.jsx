// renderer/src/components/Sidebar/Tools/SQLManager/ChildrenTable.jsx
import React, { useEffect, useState } from "react";
import { useChildrenList } from "@/hooks/useChildrenList";
import { useToast } from "@/contexts/ToastContext.jsx";

export default function ChildrenTable() {
  const { childrenData, loadChildren } = useChildrenList();
  const { showInfoToast } = useToast(); // ✅ ← コンポーネント内に移動！

  const [editingId, setEditingId] = useState(null);
  const [editedData, setEditedData] = useState({});

  useEffect(() => {
    loadChildren();
  }, []);

  const handleEdit = (child) => {
    setEditingId(child.children_id);
    setEditedData({ ...child });
  };

  const handleChange = (e) => {
    setEditedData({
      ...editedData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    try {
      await window.electronAPI.children_update(editedData.children_id, editedData);
      setEditingId(null);
      await loadChildren();
      showInfoToast(`✅ ${editedData.children_name} を保存しました`);
    } catch (err) {
      console.error("❌ 保存エラー:", err);
      showInfoToast("❌ 保存に失敗しました");
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditedData({});
    showInfoToast("キャンセルしました");
  };

  return (
    <div className="p-4 bg-white shadow rounded-xl">
      <h2 className="text-xl font-bold mb-4">👧 子どもデータ管理</h2>

      {childrenData.length === 0 ? (
        <p className="text-gray-500">データがありません。</p>
      ) : (
        <table className="w-full border-collapse text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">ID</th>
              <th className="border p-2">名前</th>
              <th className="border p-2">種類</th>
              <th className="border p-2">メモ</th>
              <th className="border p-2 w-32">操作</th>
            </tr>
          </thead>
          <tbody>
            {childrenData.map((child) => (
              <tr key={child.children_id}>
                <td className="border p-2">{child.children_id}</td>

                {/* 名前 */}
                <td className="border p-2">
                  {editingId === child.children_id ? (
                    <input
                      name="children_name"
                      value={editedData.children_name || ""}
                      onChange={handleChange}
                      className="border px-2 py-1 w-full"
                    />
                  ) : (
                    child.children_name
                  )}
                </td>

                {/* 種類 */}
                <td className="border p-2">
                  {editingId === child.children_id ? (
                    <input
                      name="children_type_name"
                      value={editedData.children_type_name || ""}
                      onChange={handleChange}
                      className="border px-2 py-1 w-full"
                    />
                  ) : (
                    child.children_type_name
                  )}
                </td>

                {/* メモ */}
                <td className="border p-2">
                  {editingId === child.children_id ? (
                    <input
                      name="notes"
                      value={editedData.notes || ""}
                      onChange={handleChange}
                      className="border px-2 py-1 w-full"
                    />
                  ) : (
                    child.notes
                  )}
                </td>

                {/* 操作ボタン */}
                <td className="border p-2 text-center">
                  {editingId === child.children_id ? (
                    <>
                      <button
                        className="px-3 py-1 bg-green-500 text-white rounded mr-2 hover:bg-green-600"
                        onClick={handleSave}
                      >
                        保存
                      </button>
                      <button
                        className="px-3 py-1 bg-gray-400 text-white rounded hover:bg-gray-500"
                        onClick={handleCancel}
                      >
                        キャンセル
                      </button>
                    </>
                  ) : (
                    <button
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                      onClick={() => handleEdit(child)}
                    >
                      編集
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
