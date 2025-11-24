import React, { useState, useEffect } from "react";
import ConfirmModal from "./ConfirmModal.jsx";
import { store } from "@/store/store.js";
import { insertManager } from "@/sql/useManager/insertManager/insertManager.js";
import { useToast } from "@/components/common/ToastContext.jsx";
import { useChildrenList } from "@/hooks/useChildrenList.js";
import { useAppState } from "@/contexts/AppStateContext.jsx";

/**
 * 出勤データを一覧表示するコンポーネント
 * @param {Array} childrenList - 抽出された児童データ配列
 */
function ChildrenTableList({ childrenList = [] }) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]); // 選択された児童ID

  const childrenTableData = store.getState().database.children;
  const managersData = store.getState().database.managers;

  const { STAFF_ID, WEEK_DAY, FACILITY_ID, appState } = useAppState();
  const { showErrorToast, showSuccessToast } = useToast();

  // ← サイドバーのタブ切り替え
  const { activeSidebarTab: activeTab, setActiveSidebarTab: setActiveTab } = useAppState();

  // 当日の対応児童（＝既に追加されている児童）
  const { childrenData } = useChildrenList();

  // =============================================================
  // 初期化処理：チェックはしない（disabled のみ管理）
  // =============================================================
  useEffect(() => {
    if (!childrenData) return;

    console.log("=== ChildrenTableList 初期化 ===");
    console.log("▶ props.childrenList:", childrenList);
    console.log("▶ 対応児童 childrenData:", childrenData);
    console.log("▶ childrenTableData:", childrenTableData);
  }, [childrenData]);

  // =============================================================
  // UI：データなし表示
  // =============================================================
  if (!childrenList || childrenList.length === 0) {
    return <p className="text-gray-500 mt-4">データがありません。</p>;
  }

  // =============================================================
  // 個別チェック
  // =============================================================
  const handleCheckboxChange = (id) => {
    const numId = Number(id);
    setSelectedIds((prev) =>
      prev.includes(numId) ? prev.filter((x) => x !== numId) : [...prev, numId]
    );
  };

  // =============================================================
  // 全選択・全解除（readonly 行は対象外）
  // =============================================================
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const selectableIds = childrenList
        .filter(
          (child) =>
            !childrenTableData.some(
              (c) => Number(c.children_id) === Number(child.children_id)
            )
        )
        .map((child) => Number(child.children_id));

      setSelectedIds(selectableIds);
    } else {
      setSelectedIds([]);
    }
  };

  // =============================================================
  // 登録（確認モーダルからの実行）
  // =============================================================
  const handleConfirm = async (selectedChildren) => {
    const result = await insertManager(selectedChildren, {
      childrenData: childrenTableData,
      managersData,
      activeApi: appState.activeApi,
      FACILITY_ID,
      STAFF_ID,
      WEEK_DAY,
    });

    if (result) {
      showSuccessToast("追加完了しました");

      // ★ 保存完了後タブ切り替え
      setActiveTab("tools");
    } else {
      showErrorToast("失敗しました");
    }

    setShowConfirmModal(false);
  };

  // =============================================================
  // 選択された児童を抽出
  // =============================================================
  const selectedChildren = childrenList.filter((child) =>
    selectedIds.includes(Number(child.children_id))
  );

  // =============================================================
  // JSX
  // =============================================================
  return (
    <div className="mt-6">
      {/* 登録ボタン */}
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

      {/* テーブル */}
      <table className="min-w-full border border-gray-300 text-sm rounded-md overflow-hidden shadow-sm mt-4">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            <th className="border px-2 py-1">
              <input
                id="select-all"
                type="checkbox"
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
          {childrenList.map((child) => {
            const cid = Number(child.children_id);

            // childrenData に含まれる → readonly 行
            const isReadonly = childrenData.some(
              (cd) => Number(cd.children_id) === cid
            );

            return (
              <tr
                key={cid}
                className={`transition-colors ${
                  isReadonly
                    ? "bg-blue-200 cursor-not-allowed"
                    : "hover:bg-blue-50"
                }`}
              >
                {/* チェックボックス */}
                <td className="border px-2 py-1 text-center">
                  <input
                    className={`${
                     isReadonly
                      ? "hidden"
                      : ""
                    }`}
                    type="checkbox"
                    checked={selectedIds.includes(cid)}
                    onChange={() => {
                      if (!isReadonly) handleCheckboxChange(cid);
                    }}
                    disabled={isReadonly}
                  />
                </td>

                <td className="border px-2 py-1">{cid}</td>
                <td className="border px-2 py-1">{child.children_name}</td>

                {/* 入室（色分け） */}
                <td
                  className={`border px-2 py-1 font-semibold ${
                    child.column5.includes("入室") &&
                    child.column5.includes("欠席")
                      ? "text-black"
                      : child.column5 === "欠席" ||
                        child.column5 === "欠席(欠席時対応加算を取らない)"
                      ? "text-red-600"
                      : "text-green-700"
                  }`}
                >
                  {child.column5}
                </td>

                {/* 退室 */}
                <td className="border px-2 py-1 text-blue-700 font-semibold">
                  {child.column6 || "-"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* モーダル */}
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
