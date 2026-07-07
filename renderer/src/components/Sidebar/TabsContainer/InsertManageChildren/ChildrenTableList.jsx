// renderer/src/components/Sidebar/Tools/InsertManageChildren/ChildrenTableList.jsx

import React, { useState, useEffect, useMemo } from "react";
import ConfirmModal from "./ConfirmModal.jsx";
import { store } from "@/store/store.js";
import { useToast } from "@/components/common/ToastContext.jsx";
import { useAppState } from "@/AppStateContext";
import { insertManager } from "./insertManager";
import { useDataBase } from "@/hooks/useDataBase";

/**
 * 出勤データを一覧表示するコンポーネント（managers2 対応）
 */
function ChildrenTableList({ childrenList = [] }) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const { loadDataBase } = useDataBase();

  const childrenTableData = store.getState().database.children;
  const managersData = store.getState().database.managers2;

  const {
    STAFF_ID,
    CURRENT_DAY_OF_WEEK,
    FACILITY_ID,
    appState,
    childrenData,
    setActiveSidebarTab: setActiveTab,
  } = useAppState();

  const { showErrorToast, showSuccessToast } = useToast();

  // AppState から取得済みの当日対応児童を読む
  const currentManagedChildren = Array.isArray(childrenData)
    ? childrenData
    : [];

  // =============================================================
  // readonly 対象 children_id を Set 化（children_id 一致のみ）
  // すでに当日の対応児童に含まれている児童は再登録不可
  // =============================================================
  const readonlyChildrenIdSet = useMemo(() => {
    return new Set(
      currentManagedChildren.map((cd) => Number(cd.children_id))
    );
  }, [currentManagedChildren]);

  // =============================================================
  // 選択済みIDから readonly 化されたものを除外
  // DB再取得後などに、登録済み児童が選択状態に残る事故を防ぐ
  // =============================================================
  useEffect(() => {
    setSelectedIds((prev) =>
      prev.filter((id) => !readonlyChildrenIdSet.has(Number(id)))
    );
  }, [readonlyChildrenIdSet]);

  // =============================================================
  // 初期ログ
  // =============================================================
  useEffect(() => {
    console.log("=== ChildrenTableList 初期化（managers2） ===");
    console.log("▶ props.childrenList:", childrenList);
    console.log("▶ 対応児童 childrenData:", currentManagedChildren);
    console.log("▶ STAFF_ID:", STAFF_ID);
    console.log("▶ CURRENT_DAY_OF_WEEK:", CURRENT_DAY_OF_WEEK);
    console.log("▶ readonlyChildrenIdSet:", [...readonlyChildrenIdSet]);
  }, [
    childrenList,
    currentManagedChildren,
    STAFF_ID,
    CURRENT_DAY_OF_WEEK,
    readonlyChildrenIdSet,
  ]);

  // =============================================================
  // データなし
  // =============================================================
  if (!Array.isArray(childrenList) || childrenList.length === 0) {
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
        CURRENT_DAY_OF_WEEK,
      });

      if (result) {
        showSuccessToast("追加完了しました");

        await loadDataBase({
          reason: "insert-manager/after-success",
        });

        setSelectedIds([]);
        setActiveTab("tools");
      } else {
        showErrorToast("失敗しました");
      }

      return result;
    } catch (err) {
      console.error("❌ ChildrenTableList handleConfirm エラー:", err);
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

  const selectableCount = childrenList.filter(
    (child) => !readonlyChildrenIdSet.has(Number(child.children_id))
  ).length;

  const isAllSelected =
    selectableCount > 0 && selectedIds.length === selectableCount;

  // =============================================================
  // JSX
  // =============================================================
  return (
    <div className="mt-6">
      {/* 登録ボタン */}
      <button
        type="button"
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
                checked={isAllSelected}
                disabled={selectableCount === 0}
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
            const isChecked = selectedIds.includes(cid);

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
                    checked={isChecked}
                    disabled={isReadonly}
                    onChange={() => {
                      if (!isReadonly) {
                        handleCheckboxChange(cid);
                      }
                    }}
                  />
                </td>

                <td className="border px-2 py-1">{cid}</td>

                <td className="border px-2 py-1">
                  {child.children_name}
                </td>

                <td className="border px-2 py-1 font-semibold">
                  {child.column5 || "-"}
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