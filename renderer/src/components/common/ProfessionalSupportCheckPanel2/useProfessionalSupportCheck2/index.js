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
   * 直近の HUG 利用日数取得結果
   */
  const [lastUseDaysResult, setLastUseDaysResult] = useState(null);

  /**
   * @type {'raw' | null}
   * 新機能では個人記録による補正をしないため raw のみ
   */
  const [useDaysDisplayKind, setUseDaysDisplayKind] = useState(null);

  const [checking, setChecking] = useState(false);

  useEffect(() => {
    console.log(`[HUG WM] 専門的支援チェック 状態リセット（${logTag}）`, {
      effectiveChildId,
      effectiveCurrentYmd,
      previousRecordCount: todayProfessionalSupportRecordCount,
      previousDisplayKind: useDaysDisplayKind,
      previousLastUseDaysResult: lastUseDaysResult,
    });

    setTodayProfessionalSupportRecordCount(null);
    setUseDaysDisplayKind(null);
    setLastUseDaysResult(null);
  }, [effectiveChildId, effectiveCurrentYmd, logTag]);

  const runCheck = useCallback(async () => {
    console.groupCollapsed(`[HUG WM] 専門的支援チェック開始（${logTag}）`);

    console.log(`[HUG WM] 取得条件の解決結果（${logTag}）`, {
      store: {
        selectedChildIdFromStore,
        facilityIdFromStore,
        currentYmdFromStore,
      },
      appState: {
        SELECT_CHILD,
        FACILITY_ID,
        CURRENT_YMD,
      },
      effective: {
        childId: effectiveChildId,
        facilityId: effectiveFacilityId,
        currentYmd: effectiveCurrentYmd,
      },
    });

    console.log(`[HUG WM] childrenData 検索結果（${logTag}）`, {
      childrenDataLength: Array.isArray(childrenData)
        ? childrenData.length
        : null,
      selectedChild,
      currentUseDays: useDays,
    });

    if (!effectiveChildId) {
      console.warn(`[HUG WM] 専門的支援チェック中断（${logTag}）`, {
        reason: "子どもが未選択",
        effectiveChildId,
      });

      console.groupEnd();
      alert("子どもを選択してください");
      return;
    }

    setChecking(true);
    setTodayProfessionalSupportRecordCount(null);
    setUseDaysDisplayKind(null);
    setLastUseDaysResult(null);

    console.log(`[HUG WM] チェック状態を初期化（${logTag}）`, {
      checking: true,
      todayProfessionalSupportRecordCount: null,
      useDaysDisplayKind: null,
      lastUseDaysResult: null,
    });

    const requestPayload = {
      childId: effectiveChildId,
      facilityId: effectiveFacilityId,
      currentYmd: effectiveCurrentYmd,
    };

    const timerLabel = `[HUG WM] HUG利用日数取得時間（${logTag}）`;

    try {
      console.log(`[HUG WM] HUG利用日数取得リクエスト送信（${logTag}）`, {
        requestPayload,
      });

      console.time(timerLabel);

      const useDaysResult = await fetchProfessionalSupportUseDaysViaHugTab(
        requestPayload
      );

      console.timeEnd(timerLabel);

      console.log(`[HUG WM] HUG利用日数取得レスポンス受信（${logTag}）`, {
        useDaysResult,
        ok: useDaysResult?.ok,
        days: useDaysResult?.days,
        daysType: typeof useDaysResult?.days,
        error: useDaysResult?.error,
      });

      setLastUseDaysResult(useDaysResult);

      console.log(`[HUG WM] lastUseDaysResult 保存（${logTag}）`, {
        lastUseDaysResult: useDaysResult,
      });

      if (!useDaysResult?.ok) {
        console.error(
          `[${logTag}] 専門的支援チェック失敗:`,
          useDaysResult?.error,
          {
            requestPayload,
            useDaysResult,
            effectiveChildId,
            effectiveFacilityId,
            effectiveCurrentYmd,
          }
        );

        alert(useDaysResult?.error || "利用日数の取得に失敗しました");
        return;
      }

      const rawDays =
        typeof useDaysResult.days === "number" ? useDaysResult.days : 0;

      console.log(`[HUG WM] 取得結果 days 正規化（${logTag}）`, {
        originalDays: useDaysResult.days,
        originalDaysType: typeof useDaysResult.days,
        normalizedRawDays: rawDays,
      });

      console.log(`[HUG WM] 状態更新前（${logTag}）`, {
        beforeUseDays: useDays,
        beforeSelectedChild: selectedChild,
        beforeRecordCount: todayProfessionalSupportRecordCount,
        beforeDisplayKind: useDaysDisplayKind,
        beforeLastUseDaysResult: lastUseDaysResult,
      });

      patchChildUseSpeDate(effectiveChildId, rawDays);

      console.log(`[HUG WM] childrenData useSpeDate 反映実行（${logTag}）`, {
        childId: effectiveChildId,
        patchedUseSpeDate: rawDays,
      });

      setUseDaysDisplayKind("raw");
      setTodayProfessionalSupportRecordCount(rawDays);

      console.log(`[HUG WM] 状態更新後 setState 実行（${logTag}）`, {
        useDaysDisplayKind: "raw",
        todayProfessionalSupportRecordCount: rawDays,
        lastUseDaysResult: useDaysResult,
        displayUseDays: rawDays,
      });

      console.log(`[HUG WM] 専門的支援 利用日数チェック完了（${logTag}）`, {
        requestPayload,
        response: useDaysResult,
        rawDays,
        displayKind: "raw",
      });

      console.log("[HUG WM] 表示用の利用日数:", rawDays, "日");
    } catch (e) {
      console.timeEnd(timerLabel);

      const errorResult = {
        ok: false,
        error: String(e?.message || e),
      };

      setLastUseDaysResult(errorResult);

      console.error(`[${logTag}] 専門的支援チェック例外:`, e, {
        requestPayload,
        effectiveChildId,
        effectiveFacilityId,
        effectiveCurrentYmd,
        errorResult,
      });

      alert(String(e?.message || e));
    } finally {
      console.log(`[HUG WM] 専門的支援チェック終了（${logTag}）`, {
        effectiveChildId,
        effectiveFacilityId,
        effectiveCurrentYmd,
        checking: false,
      });

      setChecking(false);
      console.groupEnd();
    }
  }, [
    SELECT_CHILD,
    FACILITY_ID,
    CURRENT_YMD,
    selectedChildIdFromStore,
    facilityIdFromStore,
    currentYmdFromStore,
    effectiveChildId,
    effectiveFacilityId,
    effectiveCurrentYmd,
    childrenData,
    selectedChild,
    useDays,
    todayProfessionalSupportRecordCount,
    useDaysDisplayKind,
    lastUseDaysResult,
    patchChildUseSpeDate,
    logTag,
  ]);

  return {
    useDays,
    useDaysDisplayKind,
    todayProfessionalSupportRecordCount,
    lastUseDaysResult,
    checking,
    runCheck,
  };
}