// src/components/Sidebar/Tools/TestTool/SendRoomTable.jsx
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  selectExtractedData,
  selectAttendanceLoading,
  selectAttendanceError,
} from "@/store/slices/attendanceSlice.js";
import { store } from "@/store/store.js";
import { insertManager } from "@/sql/useManager/insertManager/insertManager.js";
import { useToast } from "@/components/common/ToastContext.jsx";
import { useChildrenList } from "@/hooks/useChildrenList.js";
import { useAppState } from "@/contexts/appState";

/**
 * 出勤データを一覧表示するコンポーネント
 * @param {Array} childrenList - 抽出された児童データ配列
 */
function SendRoomTable() {
  const { appState } = useAppState();
  const [selectedIds, setSelectedIds] = useState([]);

  const extractedData = useSelector(selectExtractedData);
  const loading = useSelector(selectAttendanceLoading);
  const error = useSelector(selectAttendanceError);

  const { showErrorToast, showSuccessToast } = useToast();
  const { childrenData } = useChildrenList();

  const childrenList = extractedData?.data || [];

  useEffect(() => {
    if (!childrenData) return;
    console.log("初期化", childrenData, appState);
  }, [childrenData, appState]);

  if (loading) return <p>読み込み中...</p>;
  if (error) return <p>エラー: {error}</p>;

  // =============================================================
  // JSX
  // =============================================================
  return (
    <div className="mt-6">

      {/* テーブル */}
      <table className="min-w-full border border-gray-300 text-sm rounded-md overflow-hidden shadow-sm mt-4">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            <th className="border px-2 py-1">児童ID</th>
            <th className="border px-2 py-1">児童名</th>
            <th className="border px-2 py-1">入室</th>
            <th className="border px-2 py-1">退室</th>
          </tr>
        </thead>

        <tbody>
          {childrenList.map((child) => {
            const cid = Number(child.children_id);



            return (
              <tr
                key={cid}
              >

                <td className="border px-2 py-1">{cid}</td>
                <td className="border px-2 py-1">{child.children_name}</td>

                {/* 入室（色分け） */}
                <td
                  className={`border px-2 py-1 font-semibold ${
                    child.column5.includes("入室") && child.column5.includes("欠席")
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
    </div>
  );
}

export default SendRoomTable;
