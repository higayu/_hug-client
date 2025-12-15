// src/hooks/useChildrenList.js
import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useAppState } from '@/contexts/appState';
import { ELEMENT_IDS } from "@/utils/constants.js";

import { mariadbApi } from "@/sql/mariadbApi.js";
import { sqliteApi } from "@/sql/sqliteApi.js";
import { joinChildrenData } from "@/sql/getChildren/childrenJoinProcessor.js";
import { fetchAllTables } from "@/store/slices/databaseSlice.js";
import { selectExtractedData, selectAttendanceError } from "@/store/slices/attendanceSlice.js";

export function useChildrenList() {
  const {
    appState,
    activeApi,
    isInitialized,
    setSelectedChild,
    setSelectedPcName,
    setChildrenData,
    updateAppState,
    SELECT_CHILD,
  } = useAppState();
  const dispatch = useDispatch();
  const extractedData = useSelector(selectExtractedData);
  const attendanceError = useSelector(selectAttendanceError);

  const [childrenData, setLocalChildrenData] = useState([]);
  const [waitingChildrenData, setWaitingChildrenData] = useState([]);
  const [experienceChildrenData, setExperienceChildrenData] = useState([]);

  // 🔹 子どもデータ取得
  const loadChildren = useCallback(async () => {
    // 依存条件が揃わない場合は即 return
    if (!isInitialized) {
      console.warn("⏳ [useChildrenList] 初期化待ち");
      return;
    }
    if (!activeApi) {
      console.warn("⏳ [useChildrenList] activeApi未設定");
      return;
    }
    if (!appState.STAFF_ID || !appState.WEEK_DAY) {
      console.warn("⏳ [useChildrenList] STAFF_ID / WEEK_DAY 未設定");
      return;
    }

    try {
      const facilitySelect = document.getElementById(ELEMENT_IDS.FACILITY_SELECT);
      const facility_id = facilitySelect ? facilitySelect.value : null;
      console.log('🔍 [useChildrenList] appState:',appState);
      const api = activeApi;
      console.log('🔍 [useChildrenList] 使用するAPI:', api === mariadbApi ? 'mariadbApi' : (api === sqliteApi ? 'sqliteApi' : '不明'));
      
      const tables = await api.getAllTables();
      console.log("🔍 [useChildrenList] テーブルデータ:", tables);
      if (!tables) {
        console.error("❌ [useChildrenList] テーブルデータの取得に失敗しました");
        return;
      }

      await dispatch(fetchAllTables(tables));

      const data = await joinChildrenData({
        tables,
        staffId: appState.STAFF_ID,
        date: appState.WEEK_DAY,
        ...(facility_id && { facility_id }),
      });

      setChildrenData(data.week_children || []);
      updateAppState({
        waiting_childrenData: data.waiting_children || [],
        Experience_childrenData: data.Experience_children || [],
        childrenData: data.week_children || [],
      });
      setLocalChildrenData(data.week_children || []);
      setWaitingChildrenData(data.waiting_children || []);
      setExperienceChildrenData(data.Experience_children || []);
    } catch (error) {
      console.error("❌ 子どもデータ読み込みエラー:", error);
    }
  }, [isInitialized, activeApi, appState.STAFF_ID, appState.WEEK_DAY, dispatch, setChildrenData, updateAppState]);

  // 🔹 曜日変更イベント
  useEffect(() => {
    const handleWeekdayChanged = async () => {
      setSelectedChild("", "");
      await loadChildren();
    };
    window.addEventListener("weekday-changed", handleWeekdayChanged);
    return () => window.removeEventListener("weekday-changed", handleWeekdayChanged);
  }, [loadChildren, setSelectedChild]);

  // 🔹 初期化・依存が揃ったら発火（かつ STAFF_ID / WEEK_DAY 変化にも追従）
  useEffect(() => {
    if (!isInitialized) return;
    if (!activeApi) return;
    if (!appState.STAFF_ID || !appState.WEEK_DAY) return;
    loadChildren();
  }, [isInitialized, activeApi, appState.STAFF_ID, appState.WEEK_DAY, loadChildren]);

  // 🔹 最初の子どもを自動選択
  useEffect(() => {
    if (childrenData.length > 0 && !SELECT_CHILD) {
      const firstChild = childrenData[0];
      setSelectedChild(firstChild.children_id, firstChild.children_name);
      if (firstChild.pc_name) setSelectedPcName(firstChild.pc_name);
    }
  }, [childrenData, SELECT_CHILD, setSelectedChild, setSelectedPcName]);

  return {
    childrenData,
    waitingChildrenData,
    experienceChildrenData,
    loadChildren,

    SELECT_CHILD: appState.SELECT_CHILD,
    extractedData,
    attendanceError,
  };
}
