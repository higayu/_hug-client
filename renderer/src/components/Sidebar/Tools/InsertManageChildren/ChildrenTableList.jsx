// renderer/src/components/Sidebar/Tools/InsertManageChildren/ChildrenTableList.jsx
import React, { useState, useEffect, useMemo } from "react";
import ConfirmModal from "./ConfirmModal.jsx";
import { store } from "@/store/store.js";
import { insertManager } from "@/sql/useManager/insertManager/insertManager.js";
import { useToast } from "@/components/common/ToastContext.jsx";
import { useChildrenList } from "@/hooks/useChildrenList.js";
import { useAppState } from "@/contexts/appState";

/**
 * 出勤データを一覧表示するコンポーネント（managers2 対応）
 */
function ChildrenTableList({ childrenList = [] }) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  const childrenTableData = store.getState().database.children;
  const managersData = store.getState().database.managers2;

  const {
    STAFF_ID,
    CURRENT_DATE,
    FACILITY_ID,
    appState,
    activeSidebarTab: activeTab,
    setActiveSidebarTab: setActiveTab,
  } = useAppState();

  const { showErrorToast, showSuccessToast } = useToast();

  // 当日の対応児童（managers2 構造）
  const { childrenData } = useChildrenList();

  // =============================================================
  // readonly 対象 children_id を Set 化（children_id 一致のみ）
  // =============================================================
  const readonlyChildrenIdSet = useMemo(() => {
    if (!childrenData) return new Set();

    return new Set(
      childrenData.map((cd) => Number(cd.children_id))
    );
  }, [childrenData]);

  // =============================================================
  // 初期ログ
  // =============================================================
  useEffect(() => {
    if (!childrenData) return;

    console.log("=== ChildrenTableList 初期化（managers2） ===");
    console.log("▶ props.childrenList:", childrenList);
    console.log("▶ 対応児童 childrenData:", childrenData);
    console.log("▶ STAFF_ID:", STAFF_ID, "CURRENT_DATE:", CURRENT_DATE);
    console.log("▶ readonlyChildrenIdSet:", [...readonlyChildrenIdSet]);
  }, [childrenData, childrenList, STAFF_ID, CURRENT_DATE, readonlyChildrenIdSet]);

  // =============================================================
  // データなし
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
      prev.includes(numId)
        ? prev.filter((x) => x !== numId)
        : [...prev, numId]
    );
  };

  // =============================================================
  // 全選択（readonly 行は除外）
  // =============================================================
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const selectableIds = childrenList
        .map((child) => Number(child.children_id))
        .filter((cid) => !readonlyChildrenIdSet.has(cid));

      setSelectedIds(selectableIds);
    } else {
      setSelectedIds([]);
    }
  };

  // =============================================================
  // 登録（確認モーダル）
  // =============================================================
  const handleConfirm = async (selectedChildren) => {
    const databaseType = appState?.DATABASE_TYPE;

    if (!databaseType) {
      showErrorToast("API設定が未選択です");
      setShowConfirmModal(false);
      return false;
    }

    try {
      const result = await insertManager(selectedChildren, {
        childrenData: childrenTableData,
        managersData,
        databaseType,
        FACILITY_ID,
        STAFF_ID,
        CURRENT_DATE,
      });

      if (result) {
        showSuccessToast("追加完了しました");
        setActiveTab("tools");
      } else {
        showErrorToast("失敗しました");
      }

      return result;
    } catch (err) {
      console.error(err);
      showErrorToast("失敗しました");
      return false;
    } finally {
      setShowConfirmModal(false);
    }
  };

  // =============================================================
  // 選択された児童
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
            const isReadonly = readonlyChildrenIdSet.has(cid);

            return (
              <tr
                key={cid}
                className={`transition-colors ${
                  isReadonly
                    ? "bg-blue-200 cursor-not-allowed"
                    : "hover:bg-blue-50"
                }`}
              >
                <td className="border px-2 py-1 text-center">
                  <input
                    className={isReadonly ? "hidden" : ""}
                    type="checkbox"
                    checked={selectedIds.includes(cid)}
                    disabled={isReadonly}
                    onChange={() => {
                      if (!isReadonly) handleCheckboxChange(cid);
                    }}
                  />
                </td>

                <td className="border px-2 py-1">{cid}</td>

                <td className="border px-2 py-1">
                  {child.children_name}
                </td>

                <td className="border px-2 py-1 font-semibold">
                  {child.column5}
                </td>

                <td className="border px-2 py-1 text-blue-700 font-semibold">
                  {child.column6 || "-"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* 確認モーダル */}
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
