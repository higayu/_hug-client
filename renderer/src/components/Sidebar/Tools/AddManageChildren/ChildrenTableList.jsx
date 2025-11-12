import React, { useState } from "react";
import ConfirmModal from "./ConfirmModal.jsx";
import { useAppState } from '@/contexts/AppStateContext.jsx'
import {store} from '@/store/store.js'

/**
 * 出勤データを一覧表示するコンポーネント
 * @param {Array} childrenList - 抽出された児童データ配列
 */
function ChildrenTableList({ childrenList = [] }) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]); // ✅ 選択された児童ID
  const childrenData = store.getState().database.children;
  const managersData = store.getState().database.managers;
  const { STAFF_ID, WEEK_DAY, FACILITY_ID } = useAppState();


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

    // ここで登録処理などを実行できる
    selectedChildren.forEach(async (child) => {
      console.log("登録:", child.children_name);
      // まず、選んだ児童のidがすでにchildrenテーブルに存在するか確認する（存在しなければテーブルに追加する必要がある）
      const existingChild = childrenData.find(
        (c) => String(c.id) === String(child.children_id)
      );
      
      if (!existingChild) {
        console.log("児童が存在しません:", child.children_id);
        // 児童が存在しない場合はテーブルに追加する
        const result = await window.electronAPI.children_insert({
          id: child.children_id,
          name: child.children_name,
          notes: child.notes,
          pronunciation_id: child.pronunciation_id,
          children_type_id: child.children_type_id,
        });
        console.log("児童をテーブルに追加しました:", result);
      
        const result2 = await window.electronAPI.facility_children_insert({
          children_id: child.children_id,
          facility_id: FACILITY_ID,
        });
        console.log("児童をファシリティに追加しました:", result2);
      }

      const existingManager = managersData.find((m) => {
        const sameChild = String(m.children_id) === String(child.children_id);
        const sameStaff = String(m.staff_id) === String(STAFF_ID);
        return sameChild && sameStaff;
      });
      
      if (!existingManager) {
        // ✅ ① レコードが存在しない → 新規追加
        const dayOfWeekJson = JSON.stringify({ days: [WEEK_DAY] });
      
        const result3 = await window.electronAPI.managers_insert({
          children_id: child.children_id,
          staff_id: STAFF_ID,
          day_of_week: dayOfWeekJson,
        });
      
        console.log("✅ 新しい担当スタッフを追加しました:", result3);
      } else {
        // ✅ 既に同じ児童・スタッフの組み合わせが存在する場合
        try {
          // JSON文字列をオブジェクトに変換
          const parsed = JSON.parse(existingManager.day_of_week);
          const daysArray = parsed?.days ?? [];
      
          if (daysArray.includes(WEEK_DAY)) {
            // ✅ ③ 今の曜日がすでに登録済み → 何もしない
            console.log("⏭ すでに同じ曜日が登録されています:", WEEK_DAY);
          } else {
            // ✅ ② 今の曜日が未登録 → JSONを更新
            const updatedDays = [...daysArray, WEEK_DAY];
            const updatedJson = JSON.stringify({ days: updatedDays });
      
            const result4 = await window.electronAPI.managers_update({
              children_id: child.children_id,
              staff_id: STAFF_ID,
              day_of_week: updatedJson,
            });
      
            console.log("🔄 曜日を追加更新しました:", updatedDays);
          }
        } catch (error) {
          console.error("⚠️ day_of_week の JSON 解析に失敗:", error);
        }
      }
      

      
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
