// src/hooks/useChildrenList.js
import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useAppState } from "../contexts/AppStateContext.jsx";
import { ELEMENT_IDS } from "../utils/constants.js";
import { fetchAndExtractAttendanceData } from "../store/slices/attendanceSlice.js";
import { selectExtractedData, selectAttendanceError } from "../store/slices/attendanceSlice.js";
import { initDatabase, getChildrenData } from "../sql/index.js";

export function useChildrenList() {
  const { appState, setSelectedChild, setSelectedPcName, setChildrenData, updateAppState, SELECT_CHILD } = useAppState();
  const dispatch = useDispatch();
  const extractedData = useSelector(selectExtractedData);
  const attendanceError = useSelector(selectAttendanceError);

  const [childrenData, setLocalChildrenData] = useState([]);
  const [waitingChildrenData, setWaitingChildrenData] = useState([]);
  const [experienceChildrenData, setExperienceChildrenData] = useState([]);

  // 🔹 起動時にDBモードを判定
  useEffect(() => {
    (async () => {
      try {
        // index.js の機能を使う
        const api = await initDatabase();
        console.log("⚙️ DBモード初期化完了:", api);
      } catch (err) {
        console.warn("⚠️ DBモード初期化失敗:", err);
      }
    })();
  }, []);
  


  // 🔹 子どもデータ取得
  const loadChildren = useCallback(async () => {
    if (!appState.STAFF_ID || !appState.WEEK_DAY) {
      console.log("⏸️ STAFF_IDまたはWEEK_DAYが未設定のためスキップ");
      return;
    }

    try {
      const facilitySelect = document.getElementById(ELEMENT_IDS.FACILITY_SELECT);
      const facility_id = facilitySelect ? facilitySelect.value : null;

      console.log("📤 [useChildrenList] データ取得開始");

      const data = await getChildrenData({
        staffId: appState.STAFF_ID,
        date: appState.WEEK_DAY,
        facility_id,
      });

      setChildrenData(data.week_children || []);
      updateAppState({
        waiting_childrenData: data.waiting_children || [],
        Experience_childrenData: data.Experience_children || [],
      });

      setLocalChildrenData(data.week_children || []);
      setWaitingChildrenData(data.waiting_children || []);
      setExperienceChildrenData(data.Experience_children || []);

      if (window.AppState) {
        window.AppState.childrenData = data.week_children || [];
        window.AppState.waiting_childrenData = data.waiting_children || [];
        window.AppState.Experience_childrenData = data.Experience_children || [];
      }

      console.log("✅ [useChildrenList] データ取得完了:", data);
    } catch (error) {
      console.error("❌ [useChildrenList] 子どもデータ読み込みエラー:", error);
    }
  }, [appState.STAFF_ID, appState.WEEK_DAY, setChildrenData, updateAppState]);

  // 🔹 曜日変更イベント
  useEffect(() => {
    const handleWeekdayChanged = async () => {
      setSelectedChild("", "");
      if (window.AppState) {
        window.AppState.SELECT_CHILD = "";
        window.AppState.SELECT_CHILD_NAME = "";
      }
      await loadChildren();
    };
    window.addEventListener("weekday-changed", handleWeekdayChanged);
    return () => window.removeEventListener("weekday-changed", handleWeekdayChanged);
  }, [loadChildren, setSelectedChild]);

  // 🔹 STAFF_ID or WEEK_DAY が変更されたときに再読込
  useEffect(() => {
    if (appState.STAFF_ID && appState.WEEK_DAY) loadChildren();
  }, [appState.STAFF_ID, appState.WEEK_DAY, loadChildren]);

  // 🔹 最初の子どもを自動選択
  useEffect(() => {
    if (childrenData.length > 0 && !SELECT_CHILD) {
      const firstChild = childrenData[0];
      setSelectedChild(firstChild.children_id, firstChild.children_name);
      if (firstChild.pc_name) setSelectedPcName(firstChild.pc_name);

      if (window.AppState) {
        window.AppState.SELECT_CHILD = firstChild.children_id;
        window.AppState.SELECT_CHILD_NAME = firstChild.children_name;
        window.AppState.SELECT_PC_NAME = firstChild.pc_name || "";
      }
    }
  }, [childrenData, SELECT_CHILD, setSelectedChild, setSelectedPcName]);

  return {
    childrenData,
    waitingChildrenData,
    experienceChildrenData,
    loadChildren,
    handleFetchAttendanceForChild: useCallback(() => {
      handleFetchAttendanceForChild(appState, updateAppState, dispatch);
    }, [appState, updateAppState, dispatch]),
    saveTempNote: useCallback(async (childId, enterTime, exitTime, memo) => {
      await saveTempNote(childId, enterTime, exitTime, memo, appState);
    }, [appState]),
    loadTempNote: useCallback((childId, enterTimeInput, exitTimeInput, memoTextarea) => {
      loadTempNote(childId, enterTimeInput, exitTimeInput, memoTextarea, appState);
    }, [appState]),
    SELECT_CHILD: appState.SELECT_CHILD,
    extractedData,
    attendanceError,
  };
}
