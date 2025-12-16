// src/components/Sidebar/Tools/TestTool/SendRoomTable.jsx
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import {
  selectExtractedData,
  selectAttendanceLoading,
  selectAttendanceError,
} from "@/store/slices/attendanceSlice.js";
import { useToast } from "@/components/common/ToastContext.jsx";
import { useChildrenList } from "@/hooks/useChildrenList.js";
import { useAppState } from "@/contexts/appState";

import { clickEnterButton, clickAbsenceButton, clickExitButton }
  from "@/utils/attendance/index.js"; // or "@/utils/attendance"


function SendRoomTable() {
  /* ===============================
   * Hooks（順序固定）
   * =============================== */
  const { appState, attendanceData } = useAppState();
  const { showErrorToast, showSuccessToast } = useToast();
  const { childrenData } = useChildrenList();

  const extractedData = useSelector(selectExtractedData);
  const loading = useSelector(selectAttendanceLoading);
  const error = useSelector(selectAttendanceError);

  const childrenList = extractedData?.data || [];
  const attendanceList = attendanceData?.data || [];

  /* ===============================
   * 初期ログ
   * =============================== */
  useEffect(() => {
    if (!childrenData) return;
    console.log("SendRoomTable 初期化", { childrenData, appState });
  }, [childrenData, appState]);

  if (loading) return <p>読み込み中...</p>;
  if (error) return <p>エラー: {error}</p>;

  /* ===============================
   * 共通判定関数（元に戻す）
   * =============================== */
  const isTimeFormat = (v) => /^\d{2}:\d{2}$/.test(v || "");

  /* ===============================
   * JSX
   * =============================== */
  return (
    <div className="mt-6">
      <table className="min-w-full border border-gray-300 text-sm rounded-md shadow-sm">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            <th className="border px-2 py-1">児童ID</th>
            <th className="border px-2 py-1">児童名</th>
            <th className="border px-2 py-1">入退室操作</th>
            <th className="border px-2 py-1">退室時刻</th>
            <th className="border px-2 py-1">column5Html</th>
            <th className="border px-2 py-1">column6Html</th>
          </tr>
        </thead>

        <tbody>
          {childrenList.map((child) => {
            const cid = String(child.children_id);
            const targetChildrenId = Number(cid); // ✅ 欠席クリック用

            /* ===============================
             * attendanceItem 解決（行単位）
             * =============================== */
            const attendanceItem =
              attendanceList.find((i) => String(i.children_id) === cid) || null;

            const isUIEnabled = !!attendanceItem;

            const column5 = attendanceItem?.column5 ?? null;
            const column5Html = attendanceItem?.column5Html ?? null;
            const column6 = attendanceItem?.column6 ?? null;
            const column6Html = attendanceItem?.column6Html ?? null;

            // ✅ 表示判定は元のまま
            const isAbsent = column5 === "欠席";
            const hasEntered = isTimeFormat(column5);
            const hasExited = isTimeFormat(column6);

            return (
              <tr key={cid}>
                <td className="border px-2 py-1">{cid}</td>
                <td className="border px-2 py-1">{child.children_name}</td>

                {/* 入退室UI */}
                <td className="border px-2 py-1">
                  <div
                    className="flex flex-col gap-2"
                    style={{
                      pointerEvents: isUIEnabled ? "auto" : "none",
                      opacity: isUIEnabled ? 1 : 0.4,
                    }}
                  >
                    {isAbsent ? (
                      <div className="text-xs font-bold text-red-600">欠席</div>
                    ) : hasEntered ? (
                      <>
                        <div className="text-sm">入室: {column5}</div>

                        {hasExited ? (
                          <div className="text-sm">退室: {column6}</div>
                        ) : (
                          <button
                            className="btn-green"
                            onClick={() => clickExitButton(column6Html, Number(cid))}
                            disabled={!isUIEnabled}
                          >
                            退室
                          </button>
                        )}
                      </>
                    ) : (
                      <>
                        <button
                          className="btn-blue"
                          onClick={() => clickEnterButton(column5Html, Number(cid))}
                          disabled={!isUIEnabled}
                        >
                          入室
                        </button>

                        <button
                          className="btn-red"
                          // ✅ 欠席は安全チェック用に児童IDを渡す
                          onClick={() => clickAbsenceButton(column5Html, targetChildrenId)}
                          disabled={!isUIEnabled}
                        >
                          欠席
                        </button>
                      </>
                    )}
                  </div>
                </td>

                {/* 退室時刻 */}
                <td className="border px-2 py-1 text-blue-700 font-semibold">
                  {column6 || "-"}
                </td>

                <td className="border px-2 py-1">{column5Html}</td>
                <td className="border px-2 py-1">{column6Html || "-"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default SendRoomTable;
