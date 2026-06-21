import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useAppState } from "@/contexts/appState";
import {
  selectCurrentYmd,
  selectFacilityId,
  selectSelectedChild,
} from "@/store/slices/appStateSlice.js";
import { fetchContactBookViaHugTab } from "@/utils/personalRecord/fetchContactBookViaHugTab.js";
import { parseTodayPersonalRecordStatus } from "@/utils/personalRecord/parseTodayPersonalRecordStatus.js";

/**
 * 個人記録 本日登録チェック
 * @param {string} [logTag]
 */
export function usePersonRecordCheck(logTag = "PersonalRecordCheck") {
  const { SELECT_CHILD, FACILITY_ID, CURRENT_YMD } = useAppState();

  const selectedChildIdFromStore = useSelector(selectSelectedChild);
  const facilityIdFromStore = useSelector(selectFacilityId);
  const currentYmdFromStore = useSelector(selectCurrentYmd);

  const effectiveChildId = selectedChildIdFromStore || SELECT_CHILD;
  const effectiveFacilityId = facilityIdFromStore || FACILITY_ID || "3";
  const effectiveCurrentYmd = currentYmdFromStore || CURRENT_YMD;

  const [todayPersonalRecordRegistered, setTodayPersonalRecordRegistered] =
    useState(null);
  const [todayPersonalRecordCount, setTodayPersonalRecordCount] =
    useState(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    setTodayPersonalRecordRegistered(null);
    setTodayPersonalRecordCount(null);
  }, [effectiveChildId, effectiveCurrentYmd]);

  const runCheck = useCallback(async () => {
    if (!effectiveChildId) {
      alert("子どもを選択してください");
      return;
    }

    setChecking(true);
    setTodayPersonalRecordRegistered(null);
    setTodayPersonalRecordCount(null);

    try {
      const contactResult = await fetchContactBookViaHugTab({
        childId: effectiveChildId,
        facilityId: effectiveFacilityId,
        currentYmd: effectiveCurrentYmd,
      });

      if (!contactResult.ok) {
        console.error(
          `[${logTag}] 本日の個人記録確認失敗:`,
          contactResult.error
        );
        alert(contactResult.error || "本日の個人記録の確認に失敗しました");
        return;
      }

      const { registered, recordCount } =
        parseTodayPersonalRecordStatus(contactResult);

      setTodayPersonalRecordRegistered(registered);
      setTodayPersonalRecordCount(recordCount);

      console.log(`[HUG WM] 本日の個人記録（${logTag}）`, {
        registered,
        recordCount,
        records: contactResult.records,
      });
    } catch (e) {
      console.error(`[${logTag}] 個人記録チェック例外:`, e);
      alert(String(e?.message || e));
    } finally {
      setChecking(false);
    }
  }, [
    effectiveChildId,
    effectiveFacilityId,
    effectiveCurrentYmd,
    logTag,
  ]);

  return {
    todayPersonalRecordRegistered,
    todayPersonalRecordCount,
    checking,
    runCheck,
  };
}