import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useAppState } from "@/contexts/appState";
import { useChildrenList } from "@/hooks/useChildrenList.js";
import {
  selectCurrentYmd,
  selectFacilityId,
  selectSelectedChild,
} from "@/store/slices/appStateSlice.js";
import { fetchProfessionalSupportUseDaysViaHugTab } from "@/utils/professionalSupport/fetchUseDaysViaHugTab.js";
import { fetchProfessionalSupportSavedRecordsViaHugTab } from "@/utils/professionalSupport/fetchSavedRecordsViaHugTab.js";

const isEmptyRecordObject = (row) => {
  if (!row || typeof row !== "object") return true;
  const values = Object.values(row);
  if (values.length === 0) return true;
  return values.every((v) => String(v ?? "").trim() === "");
};

/**
 * 専門的支援 利用日数チェックの共通ロジック
 * @param {string} [logTag]
 */
export function useProfessionalSupportCheck(logTag = "ProfessionalSupportCheck") {
  const { SELECT_CHILD, FACILITY_ID, CURRENT_YMD } = useAppState();
  const selectedChildIdFromStore = useSelector(selectSelectedChild);
  const facilityIdFromStore = useSelector(selectFacilityId);
  const currentYmdFromStore = useSelector(selectCurrentYmd);

  const effectiveChildId = selectedChildIdFromStore || SELECT_CHILD;
  const effectiveFacilityId = facilityIdFromStore || FACILITY_ID || "3";
  const effectiveCurrentYmd = currentYmdFromStore || CURRENT_YMD;
  const { childrenData, patchChildUseSpeDate } = useChildrenList();

  const selectedChild = childrenData.find(
    (c) => c.children_id === effectiveChildId
  );
  const useDays = selectedChild?.useSpeDate ?? null;
  const [todayRegistered, setTodayRegistered] = useState(null);
  const [todayRecordCount, setTodayRecordCount] = useState(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    setTodayRegistered(null);
    setTodayRecordCount(null);
  }, [effectiveChildId, effectiveCurrentYmd]);

  const runCheck = useCallback(async () => {
    if (!effectiveChildId) {
      alert("子どもを選択してください");
      return;
    }

    setChecking(true);
    setTodayRegistered(null);
    setTodayRecordCount(null);

    try {
      const [useDaysResult, savedResult] = await Promise.all([
        fetchProfessionalSupportUseDaysViaHugTab({
          childId: effectiveChildId,
          facilityId: effectiveFacilityId,
          currentYmd: effectiveCurrentYmd,
        }),
        fetchProfessionalSupportSavedRecordsViaHugTab({
          childId: effectiveChildId,
          facilityId: effectiveFacilityId,
          currentYmd: effectiveCurrentYmd,
        }),
      ]);

      if (!useDaysResult.ok) {
        console.error(`[${logTag}] 専門的支援チェック失敗:`, useDaysResult.error);
        alert(useDaysResult.error || "利用日数の取得に失敗しました");
        return;
      }

      patchChildUseSpeDate(effectiveChildId, useDaysResult.days);

      console.log(`[HUG WM] 専門的支援 利用日数チェック（${logTag}）`, useDaysResult);
      console.log("[HUG WM] 新規作成時の利用日数:", useDaysResult.days, "日");

      if (!savedResult.ok) {
        console.error(
          `[${logTag}] 本日の登録確認失敗:`,
          savedResult.error
        );
        alert(savedResult.error || "本日の登録確認に失敗しました");
        return;
      }

      const rows = Array.isArray(savedResult.rows) ? savedResult.rows : [];
      const hasOnlyEmptyObjects =
        rows.length > 0 && rows.every((row) => isEmptyRecordObject(row));
      const shouldTreatAsUnknown =
        hasOnlyEmptyObjects ||
        (typeof savedResult.rowCount === "number" &&
          savedResult.rowCount > 0 &&
          rows.length === 0);

      if (shouldTreatAsUnknown) {
        setTodayRegistered(null);
        setTodayRecordCount(null);
        console.warn(`[${logTag}] 本日の登録確認: 空オブジェクトのため未取得扱い`, {
          rowCount: savedResult.rowCount,
          rows,
        });
        return;
      }

      setTodayRegistered(savedResult.registered);
      setTodayRecordCount(savedResult.rowCount);

      console.log(`[HUG WM] 本日の支援加算登録（${logTag}）`, {
        registered: savedResult.registered,
        rowCount: savedResult.rowCount,
        rows: savedResult.rows,
      });
    } catch (e) {
      console.error(`[${logTag}] 専門的支援チェック例外:`, e);
      alert(String(e?.message || e));
    } finally {
      setChecking(false);
    }
  }, [
    effectiveChildId,
    effectiveFacilityId,
    effectiveCurrentYmd,
    patchChildUseSpeDate,
    logTag,
  ]);

  return {
    useDays,
    todayRegistered,
    todayRecordCount,
    checking,
    runCheck,
  };
}
