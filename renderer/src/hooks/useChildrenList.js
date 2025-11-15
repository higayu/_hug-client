// src/hooks/useChildrenList.js
import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useAppState } from "../contexts/AppStateContext.jsx";
import { ELEMENT_IDS } from "../utils/constants.js";

import { mariadbApi } from "../sql/mariadbApi.js";
import { sqliteApi } from "../sql/sqliteApi.js";
import { joinChildrenData } from "../sql/getChildren/childrenJoinProcessor.js";
import { fetchAllTables } from "../store/slices/databaseSlice.js";
import { selectExtractedData, selectAttendanceError } from "../store/slices/attendanceSlice.js";
import { saveTempNote, loadTempNote } from "../utils/noteUtils.js";

export function useChildrenList() {
  const { appState, setSelectedChild, setSelectedPcName, setChildrenData, updateAppState, SELECT_CHILD } = useAppState();
  const dispatch = useDispatch();
  const extractedData = useSelector(selectExtractedData);
  const attendanceError = useSelector(selectAttendanceError);

  const [childrenData, setLocalChildrenData] = useState([]);
  const [waitingChildrenData, setWaitingChildrenData] = useState([]);
  const [experienceChildrenData, setExperienceChildrenData] = useState([]);

  // 🔹 子どもデータ取得
  const loadChildren = useCallback(async () => {
    if (!appState.STAFF_ID || !appState.WEEK_DAY) {
      return;
    }

    // ⚠️ activeApiが設定されていない場合は処理をスキップ
    if (!appState.activeApi) {
      console.warn("⚠️ [useChildrenList] activeApiが設定されていません。データベース設定の読み込み待ち...");
      return;
    }

    try {
      const facilitySelect = document.getElementById(ELEMENT_IDS.FACILITY_SELECT);
      const facility_id = facilitySelect ? facilitySelect.value : null;

      // ⚠️ activeApiを直接使用
      const api = appState.activeApi;
      console.log('🔍 [useChildrenList] 使用するAPI:', api === mariadbApi ? 'mariadbApi' : (api === sqliteApi ? 'sqliteApi' : '不明'));
      
      const tables = await api.getAllTables();
      console.log("🔍 [useChildrenList] テーブルデータ:", tables);
      // ⚠️ tablesがnullの場合はエラー
      if (!tables) {
        console.error("❌ [useChildrenList] テーブルデータの取得に失敗しました");
        return;
      }

      // Reduxストアに全テーブルデータを保存（awaitで待機）
      await dispatch(fetchAllTables(tables));

      // joinChildrenData呼び出し（SQLite/MariaDB共通化）
      const data = await joinChildrenData({
        tables,
        staffId: appState.STAFF_ID,
        date: appState.WEEK_DAY,
        ...(facility_id && { facility_id }),
      });

      // 取得データを反映（Context経由で一元管理）
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
  }, [appState.STAFF_ID, appState.WEEK_DAY, appState.activeApi, dispatch, setChildrenData, updateAppState]);

  // 🔹 曜日変更イベント
  useEffect(() => {
    const handleWeekdayChanged = async () => {
      setSelectedChild("", "");
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
    }
  }, [childrenData, SELECT_CHILD, setSelectedChild, setSelectedPcName]);

  return {
    childrenData,
    waitingChildrenData,
    experienceChildrenData,
    loadChildren,
    saveTempNote: useCallback(async (childId, memo,memo2) => {
      await saveTempNote(childId, memo, memo2, {
        STAFF_ID: appState.STAFF_ID,
        WEEK_DAY: appState.WEEK_DAY,
        DATE_STR: appState.DATE_STR,
      });
    }, [appState.STAFF_ID, appState.WEEK_DAY, appState.DATE_STR]),
    loadTempNote: useCallback((childId, memoTextarea) => {
      loadTempNote(childId, memoTextarea, {
        STAFF_ID: appState.STAFF_ID,
        WEEK_DAY: appState.WEEK_DAY,
      });
    }, [appState.STAFF_ID, appState.WEEK_DAY]),
    SELECT_CHILD: appState.SELECT_CHILD,
    extractedData,
    attendanceError,
  };
}
