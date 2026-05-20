import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { useAppState } from "@/contexts/appState";
import { useToast } from "@/components/common/ToastContext.jsx";
import { fetchAttendanceViaHugTab } from "@/utils/attendance/fetchAttendanceViaHugTab.js";
import { extractColumnData } from "@/utils/ToDayChildrenList/attendanceTable.js";
import {
  setExtractedData,
  setTableData,
} from "@/store/slices/attendanceSlice.js";

/**
 * 勤怠データ取得（Cookie 付きリクエスト）の共通ロジック
 * @param {string} [logTag]
 */
export function useAttendanceFetch(logTag = "AttendanceFetch") {
  const dispatch = useDispatch();
  const { showInfoToast } = useToast();
  const { FACILITY_ID, CURRENT_YMD, updateAppState } = useAppState();

  const runFetch = useCallback(async () => {
    const facilityId = FACILITY_ID || "1";
    const dateStr = CURRENT_YMD || new Date().toISOString().slice(0, 10);

    try {
      showInfoToast("📥 勤怠データ取得中...");

      const result = await fetchAttendanceViaHugTab({ facilityId, dateStr });

      if (!result.ok) {
        console.error(`[${logTag}] 勤怠データ取得失敗:`, result.error);
        showInfoToast(`⚠️ 取得失敗: ${result.error || "不明なエラー"}`);
        return;
      }

      const extracted = await extractColumnData(result.html);

      const tableData = {
        success: true,
        html: result.html,
        rowCount: result.rowCount,
        pageTitle: result.pageTitle,
        pageUrl: result.pageUrl,
        facility_id: facilityId,
        date_str: dateStr,
      };

      dispatch(setTableData(tableData));
      if (extracted?.success) {
        dispatch(setExtractedData(extracted));
      }

      if (extracted?.success) {
        const attendanceData = {
          facilityId,
          dateStr,
          extractedAt: new Date().toISOString(),
          rowCount: extracted.rowCount,
          data: extracted.data,
        };

        updateAppState({ attendanceData });
        if (window.AppState) window.AppState.attendanceData = attendanceData;

        showInfoToast(
          `✅ 勤怠データを抽出・保存しました。\n行数: ${attendanceData.rowCount || "不明"}`
        );
      } else {
        showInfoToast("⚠️ データ抽出に失敗しました（テーブルは取得済み）");
      }

      console.log(`[${logTag}] 勤怠データ取得完了`, {
        facilityId,
        dateStr,
        rowCount: result.rowCount,
      });
    } catch (e) {
      console.error(`[${logTag}] 勤怠データ取得例外:`, e);
      showInfoToast(`❌ エラー: ${e?.message || e}`);
    }
  }, [
    FACILITY_ID,
    CURRENT_YMD,
    dispatch,
    updateAppState,
    showInfoToast,
    logTag,
  ]);

  return { runFetch };
}
