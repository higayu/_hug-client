// src/components/Sidebar/Tools/TestTool/SendRoomTable.jsx
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import {
  selectExtractedData,
  selectAttendanceLoading,
  selectAttendanceError,
} from "@/store/slices/attendanceSlice.js";
import { useChildrenList } from "@/hooks/useChildrenList.js";
import { useAppState } from "@/contexts/appState";

import {
  clickEnterButton,
  clickAbsenceButton,
  clickExitButton,
} from "@/utils/attendance/index.js";

import { useToast } from "@/components/common/ToastContext.jsx";

function SendRoomTable() {
  /* ===============================
   * Hooks（順序固定）
   * =============================== */
  const { appState, attendanceData } = useAppState();
  const { childrenData } = useChildrenList();

  const extractedData = useSelector(selectExtractedData);
  const loading = useSelector(selectAttendanceLoading);
  const error = useSelector(selectAttendanceError);

  const childrenList = extractedData?.data || [];
  const attendanceList = attendanceData?.data || [];

  const {
    showSuccessToast,
    showErrorToast,
    showWarningToast,
    showInfoToast,
  } = useToast();

  /* ===============================
   * 初期ログ
   * =============================== */
  useEffect(() => {
    if (!childrenData) return;
    console.log("🟢 SendRoomTable 初期化", {
      childrenData,
      appState,
      attendanceData,
    });
  }, [childrenData, appState, attendanceData]);

  if (loading) return <p>読み込み中...</p>;
  if (error) return <p>エラー: {error}</p>;

  /* ===============================
   * 共通判定関数
   * =============================== */
  const isTimeFormat = (v) =>
    typeof v === "string" && /^\d{2}:\d{2}/.test(v.trim());

  /* ===============================
   * 入室ボタン
   * =============================== */
  const nyushituButton = async (column5Html, cid) => {
    console.group("🟦 入室クリック");
    console.log("cid:", cid);
    console.log("column5Html:", column5Html);

    if (!column5Html) {
      console.warn("❌ column5Html が null / undefined");
      showErrorToast("入室情報が取得できません");
      console.groupEnd();
      return;
    }

    try {
      console.log("➡ clickEnterButton 実行開始");
      const res = await clickEnterButton(column5Html, Number(cid));
      console.log("⬅ clickEnterButton 結果:", res);

      if (res?.success === true) {
        showSuccessToast("入室　実行完了");
      } else {
        showErrorToast("入室　失敗");
      }
    } catch (e) {
      console.error("💥 入室処理例外:", e);
      showErrorToast("入室　例外発生");
    } finally {
      console.groupEnd();
    }
  };

  /* ===============================
   * 退室ボタン
   * =============================== */
  const taishituButton = async (column6Html, cid) => {
    console.group("🟥 退室クリック");
    console.log("cid:", cid);
    console.log("column6Html:", column6Html);

    if (!column6Html) {
      console.warn("❌ column6Html が null / undefined");
      showErrorToast("退室情報が取得できません");
      console.groupEnd();
      return;
    }

    try {
      console.log("➡ clickExitButton 実行開始");
      const res = await clickExitButton(column6Html, Number(cid));
      console.log("⬅ clickExitButton 結果:", res);

      if (res?.success === true) {
        showSuccessToast("退室　実行完了");
      } else {
        showErrorToast("退室　失敗");
      }
    } catch (e) {
      console.error("💥 退室処理例外:", e);
      showErrorToast("退室　例外発生");
    } finally {
      console.groupEnd();
    }
  };

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
            const targetChildrenId = Number(cid);

            const attendanceItem =
              attendanceList.find(
                (i) => String(i.children_id) === cid
              ) || null;

            const isUIEnabled = !!attendanceItem;

            const column5 = attendanceItem?.column5 ?? null;
            const column5Html = attendanceItem?.column5Html ?? null;
            const column6 = attendanceItem?.column6 ?? null;
            const column6Html = attendanceItem?.column6Html ?? null;

            const isAbsent = column5 === "欠席";
            const hasEntered = isTimeFormat(column5);
            const hasExited = isTimeFormat(column6);

            return (
              <tr key={cid}>
                <td className="border px-2 py-1">{cid}</td>
                <td className="border px-2 py-1">
                  {child.children_name}
                </td>

                <td className="border px-2 py-1">
                  <div
                    className="flex flex-col gap-2"
                    style={{
                      pointerEvents: isUIEnabled ? "auto" : "none",
                      opacity: isUIEnabled ? 1 : 0.4,
                    }}
                  >
                    {isAbsent ? (
                      <div className="text-xs font-bold text-red-600">
                        欠席
                      </div>
                    ) : hasEntered ? (
                      <>
                        <div className="text-sm">
                          入室: {column5}
                        </div>

                        {hasExited ? (
                          <div className="text-sm">
                            退室: {column6}
                          </div>
                        ) : (
                          <button
                            className="btn-green"
                            onClick={() =>
                              taishituButton(column6Html, cid)
                            }
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
                          onClick={() =>
                            nyushituButton(column5Html, cid)
                          }
                          disabled={!isUIEnabled}
                        >
                          入室
                        </button>

                        <button
                          className="btn-red"
                          onClick={() =>
                            clickAbsenceButton(
                              column5Html,
                              targetChildrenId
                            )
                          }
                          disabled={!isUIEnabled}
                        >
                          欠席
                        </button>
                      </>
                    )}
                  </div>
                </td>

                <td className="border px-2 py-1 text-blue-700 font-semibold">
                  {column6 || "-"}
                </td>
                <td className="border px-2 py-1">
                  {column5Html}
                </td>
                <td className="border px-2 py-1">
                  {column6Html || "-"}
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
