import { useCallback, useRef, useState } from "react";
import { useAppState } from "@/contexts/appState";
import { fetchContactBookViaHugTab } from "@/utils/personalRecord/fetchContactBookViaHugTab.js";

const LOG_TAG = "PersonalRecordGet";

/**
 * 選択中児童の個人記録（活動内容 note）を hugview 経由で取得し、コンソールに出力する（テスト用）
 */
export default function PersonalRecordGetBtn() {
  const { SELECT_CHILD, FACILITY_ID, CURRENT_YMD } = useAppState();
  const [fetching, setFetching] = useState(false);
  const isFetchingRef = useRef(false);

  const runFetch = useCallback(async () => {
    if (!SELECT_CHILD) {
      console.warn(`[${LOG_TAG}] 児童が選択されていません`);
      return;
    }

    if (isFetchingRef.current) {
      console.log(`[${LOG_TAG}] 取得中のためスキップ`);
      return;
    }

    const facilityId = FACILITY_ID || "3";
    const currentYmd =
      CURRENT_YMD || new Date().toISOString().slice(0, 10);

    isFetchingRef.current = true;
    setFetching(true);

    console.log(`[${LOG_TAG}] 取得開始`, {
      childId: SELECT_CHILD,
      facilityId,
      currentYmd,
    });

    try {
      const result = await fetchContactBookViaHugTab({
        childId: SELECT_CHILD,
        facilityId,
        currentYmd,
      });

      if (!result.ok) {
        console.error(`[${LOG_TAG}] 取得失敗:`, result.error);
        return;
      }

      console.log(`[${LOG_TAG}] 取得完了`, {
        listUrl: result.listUrl,
        rowCount: result.rowCount,
        presentCount: result.presentCount,
      });
      console.log(`[${LOG_TAG}] records:`, result.records);

      result.records?.forEach((row) => {
        console.log(`[${LOG_TAG}] ${row.date} ${row.childName}`, {
          attendance: row.attendance,
          note: row.note,
          noteError: row.noteError,
          editPath: row.editPath,
        });
      });
    } catch (e) {
      console.error(`[${LOG_TAG}] 例外:`, e);
    } finally {
      isFetchingRef.current = false;
      setFetching(false);
    }
  }, [SELECT_CHILD, FACILITY_ID, CURRENT_YMD]);

  return (
    <button
      type="button"
      id="personal-record-get"
      onClick={runFetch}
      disabled={!SELECT_CHILD || fetching}
      className="
        flex items-center justify-center
        bg-amber-500 text-white
        px-3 py-2
        rounded-lg font-bold text-xs
        cursor-pointer transition-all whitespace-nowrap
        hover:bg-amber-600 hover:scale-105
        active:bg-amber-700 active:scale-[0.97]
        disabled:grayscale disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
      "
    >
      {fetching ? "取得中…" : "記録取得"}
    </button>
  );
}
