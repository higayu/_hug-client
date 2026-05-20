import { useCallback } from "react";
import { useAppState } from "@/contexts/appState";
import { useChildrenList } from "@/hooks/useChildrenList.js";
import { fetchProfessionalSupportUseDaysViaHugTab } from "@/utils/professionalSupport/fetchUseDaysViaHugTab.js";

/**
 * 専門的支援 利用日数チェックの共通ロジック
 * @param {string} [logTag]
 */
export function useProfessionalSupportCheck(logTag = "ProfessionalSupportCheck") {
  const { SELECT_CHILD, FACILITY_ID, CURRENT_YMD } = useAppState();
  const { childrenData, patchChildUseSpeDate } = useChildrenList();

  const selectedChild = childrenData.find(
    (c) => c.children_id === SELECT_CHILD
  );
  const useDays = selectedChild?.useSpeDate ?? null;

  const runCheck = useCallback(async () => {
    if (!SELECT_CHILD) {
      alert("子どもを選択してください");
      return;
    }

    const facilityId = FACILITY_ID || "3";

    try {
      const result = await fetchProfessionalSupportUseDaysViaHugTab({
        childId: SELECT_CHILD,
        facilityId,
        currentYmd: CURRENT_YMD,
      });

      if (!result.ok) {
        console.error(`[${logTag}] 専門的支援チェック失敗:`, result.error);
        alert(result.error || "利用日数の取得に失敗しました");
        return;
      }

      patchChildUseSpeDate(SELECT_CHILD, result.days);

      console.log(`[HUG WM] 専門的支援 利用日数チェック（${logTag}）`, result);
      console.log("[HUG WM] 新規作成時の利用日数:", result.days, "日");
    } catch (e) {
      console.error(`[${logTag}] 専門的支援チェック例外:`, e);
      alert(String(e?.message || e));
    }
  }, [
    SELECT_CHILD,
    FACILITY_ID,
    CURRENT_YMD,
    patchChildUseSpeDate,
    logTag,
  ]);

  return { useDays, runCheck };
}
