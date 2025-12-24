//import { useAppState } from "@/contexts/AppStateContext.jsx";
import { useAppState } from '@/contexts/appState';
import { saveTempNote as saveFn, loadTempNote as loadFn } from "@/utils/noteUtils.js";
import { useCallback } from "react";

export function useNote() {
  const { appState } = useAppState();

  const saveTemp = useCallback((childId, memo1, memo2) => {
    const result = saveFn(childId, memo1, memo2,appState);
    if (result) {
      console.log("✅ 一時メモ保存成功");
      return true;
    } else {
      console.error("❌ 一時メモ保存失敗");
      return false;
    }
  }, [appState.STAFF_ID, appState.CURRENT_DATE, appState.CURRENT_YMD]);

  const loadTemp = useCallback((childId, proxy) => {
    return loadFn(childId, proxy, {
      STAFF_ID: appState.STAFF_ID,
      CURRENT_DATE: appState.CURRENT_DATE,
    });
  }, [appState.STAFF_ID, appState.CURRENT_DATE]);

  return { saveTemp, loadTemp };
}
