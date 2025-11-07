// src/hooks/useChildrenList.js
import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useAppState } from "../contexts/AppStateContext.jsx";
import { ELEMENT_IDS } from "../utils/constants.js";
import { fetchAndExtractAttendanceData } from "../store/slices/attendanceSlice.js";
import { selectExtractedData, selectAttendanceError } from "../store/slices/attendanceSlice.js";
import { initDatabase, getSQLData } from "../sql/index.js";
import { fetchAndStoreChildrenData } from "../store/dispatchers/childrenDispatcher.js";

export function useChildrenList() {
  const { appState, setSelectedChild, setSelectedPcName, updateAppState, SELECT_CHILD } = useAppState();

  const [childrenData, setLocalChildrenData] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        await initDatabase(); // DBモード初期化
      } catch (err) {
        console.warn("⚠️ DBモード初期化失敗:", err);
      }
    })();
  }, []);

  const loadChildren = useCallback(async () => {
    if (!appState.STAFF_ID || !appState.WEEK_DAY) {
      console.log("⏸️ STAFF_IDまたはWEEK_DAYが未設定のためスキップ");
      return;
    }

    try {
      const facilitySelect = document.getElementById(ELEMENT_IDS.FACILITY_SELECT);
      const facility_id = facilitySelect ? facilitySelect.value : null;

      console.log("📤 [useChildrenList] データ取得＆Redux格納開始");

      // ✅ Redux store に格納しつつ結果を受け取る
      const result = await fetchAndStoreChildrenData({
        staffId: appState.STAFF_ID,
        date: appState.WEEK_DAY,
        facility_id,
      });

      // ✅ React側のローカルステート・AppStateContextへも反映
      setLocalChildrenData(result.children || []);
      updateAppState({
        waiting_childrenData: result.waiting_children || [],
        Experience_childrenData: result.Experience_children || [],
      });

      console.log("✅ [useChildrenList] データ取得＆格納完了:", result);
    } catch (error) {
      console.error("❌ [useChildrenList] 子どもデータ読み込みエラー:", error);
    }
  }, [appState.STAFF_ID, appState.WEEK_DAY, updateAppState]);

  // イベント・エフェクト類はそのままでOK
  // （loadChildren を呼ぶだけで Redux 側も更新されるようになる）

  return { childrenData, loadChildren };
}

