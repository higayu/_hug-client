import React, { useState } from "react";
import ConfirmModal from "./ConfirmModal.jsx";
import { useAppState } from '@/contexts/AppStateContext.jsx'
import {store} from '@/store/store.js'
import { insertManager } from "@/sql/useManager/insertManager/insertManager.js";

/**
 * 出勤データを一覧表示するコンポーネント
 * @param {Array} childrenList - 抽出された児童データ配列
 */
function ChildrenTableList({ childrenList = [] }) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]); // ✅ 選択された児童ID
  const childrenData = store.getState().database.children;
  const managersData = store.getState().database.managers;
  const { STAFF_ID, WEEK_DAY, FACILITY_ID, appState } = useAppState();


  if (!childrenList || childrenList.length === 0) {
    return <p className="text-gray-500 mt-4">データがありません。</p>;
  }

  // ✅ 個別チェックの切り替え
  const handleCheckboxChange = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // ✅ 全選択・全解除
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(childrenList.map((child) => child.children_id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleConfirm = async (selectedChildren) => {

    await insertManager(selectedChildren, {
      childrenData,
      managersData,
      activeApi: appState.activeApi,
      FACILITY_ID,
      STAFF_ID,
      WEEK_DAY,
    });

    setShowConfirmModal(false);
  };

  // ✅ チェックされた児童だけ抽出
  const selectedChildren = childrenList.filter((child) =>
    selectedIds.includes(child.children_id)
  );

  return (
    <div className="mt-6">
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        onClick={() => {
          if (selectedIds.length === 0) {
            alert("児童を選択してください。");
            return;
          }
          setShowConfirmModal(true);
        }}
      >
        登録
      </button>

      <table className="min-w-full border border-gray-300 text-sm rounded-md overflow-hidden shadow-sm mt-4">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            <th className="border px-2 py-1">
              <input
                id="select-all"
                type="checkbox"
                checked={selectedIds.length === childrenList.length}
                onChange={handleSelectAll}
              />
            </th>
            <th className="border px-2 py-1">児童ID</th>
            <th className="border px-2 py-1">児童名</th>
            <th className="border px-2 py-1">入室</th>
            <th className="border px-2 py-1">退室</th>
          </tr>
        </thead>
        <tbody>
          {childrenList.map((child) => (
            <tr
              key={child.children_id}
              className="hover:bg-blue-50 transition-colors"
            >
              <td className="border px-2 py-1 text-center">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(child.children_id)}
                  onChange={() => handleCheckboxChange(child.children_id)}
                />
              </td>
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

      {/* ✅ チェックした児童だけモーダルに渡す */}
      <ConfirmModal
        show={showConfirmModal}
        message="以下の児童を登録しますか？"
        list={selectedChildren}
        onConfirm={handleConfirm}
        onCancel={() => setShowConfirmModal(false)}
      />
    </div>
  );
}

export default ChildrenTableList;
