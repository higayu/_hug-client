import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useAppState } from "@/contexts/appState";
import { useChildrenList } from "@/hooks/useChildrenList.js";
import {
  selectCurrentYmd,
  selectFacilityId,
  selectSelectedChild,
} from "@/store/slices/appStateSlice.js";
import { fetchProfessionalSupportUseDaysViaHugTab } from "./fetchHook1";

/**
 * 専門的支援実施加算の利用日数チェック
 *
 * 新処理:
 * - HUG の record_proceedings.php を POST 検索
 * - 月初〜指定日までの専門的支援実施加算の保存済み件数を取得
 * - 取得件数を useSpeDate に反映する
 */
export function useProfessionalSupportCheck2(
  logTag = "ProfessionalSupportCheck2"
) {
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

  /**
   * 月初〜指定日までの専門的支援実施加算の保存済み件数
   */
  const [
    todayProfessionalSupportRecordCount,
    setTodayProfessionalSupportRecordCount,
  ] = useState(null);

  /**
   * @type {'raw' | null}
   * 新機能では個人記録による補正をしないため raw のみ
   */
  const [useDaysDisplayKind, setUseDaysDisplayKind] = useState(null);

  const [checking, setChecking] = useState(false);

  useEffect(() => {
    setTodayProfessionalSupportRecordCount(null);
    setUseDaysDisplayKind(null);
  }, [effectiveChildId, effectiveCurrentYmd]);

  const runCheck = useCallback(async () => {
    if (!effectiveChildId) {
      alert("子どもを選択してください");
      return;
    }

    setChecking(true);
    setTodayProfessionalSupportRecordCount(null);
    setUseDaysDisplayKind(null);

    try {
      const useDaysResult = await fetchProfessionalSupportUseDaysViaHugTab({
        childId: effectiveChildId,
        facilityId: effectiveFacilityId,
        currentYmd: effectiveCurrentYmd,
      });

      if (!useDaysResult.ok) {
        console.error(
          `[${logTag}] 専門的支援チェック失敗:`,
          useDaysResult.error
        );

        alert(useDaysResult.error || "利用日数の取得に失敗しました");
        return;
      }

      const rawDays =
        typeof useDaysResult.days === "number" ? useDaysResult.days : 0;

      patchChildUseSpeDate(effectiveChildId, rawDays);
      setUseDaysDisplayKind("raw");
      setTodayProfessionalSupportRecordCount(rawDays);

      console.log(`[HUG WM] 専門的支援 利用日数チェック（${logTag}）`, {
        ...useDaysResult,
        rawDays,
      });

      console.log("[HUG WM] 表示用の利用日数:", rawDays, "日");
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
    todayProfessionalSupportRecordCount,
    checking,
    runCheck,
  };
}