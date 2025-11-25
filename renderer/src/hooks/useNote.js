import { useAppState } from "@/contexts/AppStateContext.jsx";
import { saveTempNote as saveFn, loadTempNote as loadFn } from "@/utils/noteUtils.js";
import { useCallback } from "react";

export function useNote() {
  const { appState } = useAppState();

  const saveTemp = useCallback((childId, memo1, memo2) => {
    const result = saveFn(childId, memo1, memo2, {
      STAFF_ID: appState.STAFF_ID,
      WEEK_DAY: appState.WEEK_DAY,
      DATE_STR: appState.DATE_STR,
    });
    if (result) {
      console.log("✅ 一時メモ保存成功");
      return true;
    } else {
      console.error("❌ 一時メモ保存失敗");
      return false;
    }
  }, [appState.STAFF_ID, appState.WEEK_DAY, appState.DATE_STR]);

  const loadTemp = useCallback((childId, proxy) => {
    return loadFn(childId, proxy, {
      STAFF_ID: appState.STAFF_ID,
      WEEK_DAY: appState.WEEK_DAY,
    });
  }, [appState.STAFF_ID, appState.WEEK_DAY]);

  return { saveTemp, loadTemp };
}
