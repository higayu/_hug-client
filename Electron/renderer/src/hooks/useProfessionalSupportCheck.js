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
import { fetchContactBookViaHugTab } from "@/utils/personalRecord/fetchContactBookViaHugTab.js";
import {
  adjustUseDaysForTodayPersonalRecord,
  parseTodayPersonalRecordStatus,
} from "@/utils/personalRecord/parseTodayPersonalRecordStatus.js";

const isEmptyRecordObject = (row) => {
  if (!row || typeof row !== "object") return true;
  const values = Object.values(row);
  if (values.length === 0) return true;
  return values.every((v) => String(v ?? "").trim() === "");
};

const parseTodayProfessionalSupportRegistered = (savedResult) => {
  if (!savedResult?.ok) return null;

  const rows = Array.isArray(savedResult.rows) ? savedResult.rows : [];
  const hasOnlyEmptyObjects =
    rows.length > 0 && rows.every((row) => isEmptyRecordObject(row));
  const shouldTreatAsUnknown =
    hasOnlyEmptyObjects ||
    (typeof savedResult.rowCount === "number" &&
      savedResult.rowCount > 0 &&
      rows.length === 0);

  if (shouldTreatAsUnknown) return null;
  return savedResult.registered === true;
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
  const [todayProfessionalSupportRegistered, setTodayProfessionalSupportRegistered] =
    useState(null);
  const [todayProfessionalSupportRecordCount, setTodayProfessionalSupportRecordCount] =
    useState(null);
  /** @type {'adjusted' | 'raw' | null} 利用日数の表示種別（チェック後のみ） */
  const [useDaysDisplayKind, setUseDaysDisplayKind] = useState(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    setTodayProfessionalSupportRegistered(null);
    setTodayProfessionalSupportRecordCount(null);
    setUseDaysDisplayKind(null);
  }, [effectiveChildId, effectiveCurrentYmd]);

  const runCheck = useCallback(async () => {
    if (!effectiveChildId) {
      alert("子どもを選択してください");
      return;
    }

    setChecking(true);
    setTodayProfessionalSupportRegistered(null);
    setTodayProfessionalSupportRecordCount(null);
    setUseDaysDisplayKind(null);

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

      const { registered: todayPersonalRecordRegistered, recordCount } =
        parseTodayPersonalRecordStatus(contactResult);

      console.log(`[HUG WM] 本日の個人記録（${logTag}）`, {
        registered: todayPersonalRecordRegistered,
        recordCount,
        records: contactResult.records,
      });

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

      const todayProSupportRegistered =
        parseTodayProfessionalSupportRegistered(savedResult);
      setTodayProfessionalSupportRegistered(todayProSupportRegistered);
      setTodayProfessionalSupportRecordCount(
        savedResult.ok && typeof savedResult.rowCount === "number"
          ? savedResult.rowCount
          : null
      );

      if (!savedResult.ok) {
        console.warn(
          `[${logTag}] 本日の専門的支援登録確認失敗:`,
          savedResult.error
        );
      } else {
        console.log(`[HUG WM] 本日の専門的支援（${logTag}）`, {
          registered: todayProSupportRegistered,
          rowCount: savedResult.rowCount,
          rows: savedResult.rows,
        });
      }

      if (!useDaysResult.ok) {
        console.error(`[${logTag}] 専門的支援チェック失敗:`, useDaysResult.error);
        alert(useDaysResult.error || "利用日数の取得に失敗しました");
        return;
      }

      const adjustedDays = adjustUseDaysForTodayPersonalRecord(
        useDaysResult.days,
        todayPersonalRecordRegistered
      );

      patchChildUseSpeDate(effectiveChildId, adjustedDays);
      setUseDaysDisplayKind(
        todayPersonalRecordRegistered === true ? "adjusted" : "raw"
      );

      console.log(`[HUG WM] 専門的支援 利用日数チェック（${logTag}）`, {
        ...useDaysResult,
        rawDays: useDaysResult.days,
        adjustedDays,
        todayPersonalRecordRegistered,
      });
      console.log("[HUG WM] 表示用の利用日数:", adjustedDays, "日");
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
    useDaysDisplayKind,
    todayProfessionalSupportRegistered,
    todayProfessionalSupportRecordCount,
    checking,
    runCheck,
  };
}
