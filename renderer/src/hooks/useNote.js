//import { useAppState } from "@/contexts/AppStateContext.jsx";
import { useAppState } from '@/contexts/appState';
import { saveTempNote,saveTempNote1,saveTempNote2, loadTempNote as loadFn } from "@/utils/app/noteUtils.js";
import { useCallback } from "react";

export function useNote() {
  const { appState } = useAppState();

  const saveTemp = useCallback((childId, memo1, memo2) => {
    const result = saveTempNote(childId, memo1, memo2,appState);
    if (result) {
      console.log("✅ 一時メモ保存成功");
      return true;
    } else {
      console.error("❌ 一時メモ保存失敗");
      return false;
    }
  }, [appState.STAFF_ID, appState.CURRENT_DAY_OF_WEEK, appState.CURRENT_YMD]);

  const saveTemp1 = useCallback((childId, memo1) => {
    const result = saveTempNote1(childId, memo1,appState);
    if (result) {
      console.log("✅ 一時メモ保存成功");
      return true;
    } else {
      console.error("❌ 一時メモ保存失敗");
      return false;
    }
  }, [appState.STAFF_ID, appState.CURRENT_DAY_OF_WEEK, appState.CURRENT_YMD]);

  const saveTemp2 = useCallback((childId, memo2) => {
    const result = saveTempNote2(childId, memo2,appState);
    if (result) {
      console.log("✅ 一時メモ保存成功");
      return true;
    } else {
      console.error("❌ 一時メモ保存失敗");
      return false;
    }
  }, [appState.STAFF_ID, appState.CURRENT_DAY_OF_WEEK, appState.CURRENT_YMD]);


  const loadTemp = useCallback((childId, proxy) => {
    return loadFn(childId, proxy, {
      STAFF_ID: appState.STAFF_ID,
      CURRENT_DAY_OF_WEEK: appState.CURRENT_DAY_OF_WEEK,
    });
  }, [appState.STAFF_ID, appState.CURRENT_DAY_OF_WEEK]);

  return { saveTemp,saveTemp1,saveTemp2, loadTemp };
}
