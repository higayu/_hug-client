import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";

import { useAppState } from "@/AppStateContext";
import { useToast } from '@/provider/ToastProvider/ToastContext'
import { isHugLoggedIn } from "@/hooks/useHugCache/isHugLoggedIn.js";
import { fetchAttendanceViaHugTab } from "@/utils/attendance/fetchAttendanceViaHugTab";
import { extractColumnData } from "@/utils/attendance/attendanceTable";
import { setExtractedData, setTableData } from "@/store/slices/attendanceSlice";

const AUTO_FETCH_INTERVAL_MS = 60_000;

/**
 * GetTodayUsersChildren 用の利用者データ取得処理
 *
 * - HUG 側から当日の利用者データを取得
 * - HTML テーブルを抽出
 * - Redux / AppState に保存
 * - 自動取得 ON の場合は 60 秒ごとに再取得
 */
export function useAttendanceFetch(logTag = "GetTodayUsersChildren") {
  const dispatch = useDispatch();
  const { showInfoToast } = useToast();

  const { FACILITY_ID, CURRENT_YMD, updateAppState } = useAppState();

  const [autoFetchEnabled, setAutoFetchEnabled] = useState(false);
  const isFetchingRef = useRef(false);

  const runFetch = useCallback(
    async (options = {}) => {
      const { silent = false } = options;

      const facilityId = FACILITY_ID || "1";
      const dateStr = CURRENT_YMD || new Date().toISOString().slice(0, 10);

      if (isFetchingRef.current) {
        console.log(`[${logTag}] 取得中のためスキップ`);
        return;
      }

      isFetchingRef.current = true;

      try {
        const loggedIn = await isHugLoggedIn();
        if (!loggedIn) {
          console.warn(`[${logTag}] HUG未ログインのため取得をスキップ`);

          if (silent) {
            setAutoFetchEnabled(false);
          } else {
            showInfoToast("⚠️ HUGにログインしてから利用者データを取得してください");
          }

          return;
        }

        if (!silent) {
          showInfoToast("📥 利用者データ取得中...");
        }

        const result = await fetchAttendanceViaHugTab({
          facilityId,
          dateStr,
        });

        if (!result.ok) {
          console.error(`[${logTag}] 利用者データ取得失敗:`, result.error);
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

          const attendanceData = {
            facilityId,
            dateStr,
            extractedAt: new Date().toISOString(),
            rowCount: extracted.rowCount,
            data: extracted.data,
          };

          updateAppState({ attendanceData });

          if (window.AppState) {
            window.AppState.attendanceData = attendanceData;
          }

          if (!silent) {
            showInfoToast(
              `✅ 利用者データを抽出・保存しました。\n行数: ${
                attendanceData.rowCount || "不明"
              }`
            );
          }
        } else if (!silent) {
          showInfoToast("⚠️ データ抽出に失敗しました（テーブルは取得済み）");
        }

        console.log(`[${logTag}] 利用者データ取得完了`, {
          facilityId,
          dateStr,
          rowCount: result.rowCount,
          silent,
        });
      } catch (e) {
        console.error(`[${logTag}] 利用者データ取得例外:`, e);
        showInfoToast(`❌ エラー: ${e?.message || e}`);
      } finally {
        isFetchingRef.current = false;
      }
    },
    [
      FACILITY_ID,
      CURRENT_YMD,
      dispatch,
      updateAppState,
      showInfoToast,
      logTag,
    ]
  );

  const runFetchRef = useRef(runFetch);
  runFetchRef.current = runFetch;

  useEffect(() => {
    if (!autoFetchEnabled) return;

    runFetchRef.current({ silent: true });

    const intervalId = setInterval(() => {
      runFetchRef.current({ silent: true });
    }, AUTO_FETCH_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [autoFetchEnabled]);

  const toggleAutoFetch = useCallback(() => {
    setAutoFetchEnabled((prev) => !prev);
  }, []);

  return {
    runFetch,
    autoFetchEnabled,
    toggleAutoFetch,
  };
}
