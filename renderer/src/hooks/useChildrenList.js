// src/hooks/useChildrenList.js
import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useAppState } from "../contexts/AppStateContext.jsx";
import { ELEMENT_IDS } from "../utils/constants.js";

import { mariadbApi } from "../sql/mariadbApi.js";
import { sqliteApi } from "../sql/sqliteApi.js";
import { joinChildrenData } from "../sql/getChildren/childrenJoinProcessor.js"; // ✅ 追加
import { fetchAllTables } from "../store/slices/databaseSlice.js"; // ✅ 追加！
import { selectExtractedData, selectAttendanceError } from "../store/slices/attendanceSlice.js";
import store from "../store/store.js";

export function useChildrenList() {
  const { appState, setSelectedChild, setSelectedPcName, setChildrenData, updateAppState, SELECT_CHILD } = useAppState();
  const dispatch = useDispatch();
  const extractedData = useSelector(selectExtractedData);
  const attendanceError = useSelector(selectAttendanceError);

  const [childrenData, setLocalChildrenData] = useState([]);
  const [waitingChildrenData, setWaitingChildrenData] = useState([]);
  const [experienceChildrenData, setExperienceChildrenData] = useState([]);
  const [api, setApi] = useState(sqliteApi); // デフォルトはSQLite

  // 🔹 起動時にDBモードを判定
  useEffect(() => {
    (async () => {
      try {
        const dbType = (await window.electronAPI.getDatabaseType()) || "sqlite";
        setApi(dbType === "mariadb" ? mariadbApi : sqliteApi);
        console.log(`⚙️ DBモード: ${dbType}`);
      } catch (err) {
        console.warn("⚠️ DBモード取得失敗: SQLiteを使用します", err);
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

      // ✅ SQLiteモードの場合は getAllTables → joinChildrenData に分離
      let data;
      if (api === sqliteApi) {
        console.log("🪶 SQLiteモードでデータを取得");
        console.log("🔍 [useChildrenList] appState.STAFF_ID:", appState.STAFF_ID, "型:", typeof appState.STAFF_ID);
        const tables = await sqliteApi.getAllTables();

        // ✅ Reduxストアに全テーブルデータを保存
        dispatch(fetchAllTables(tables));
        console.log("🧾 Redux全体の状態:", store.getState().sqlite);
        console.log("🔍 [実行前のスタッフID] staffId:", appState.STAFF_ID, "型:", typeof appState.STAFF_ID);
        console.log("🔍 [useChildrenList] date:", appState.WEEK_DAY, "型:", typeof appState.WEEK_DAY);
        //getJoinedStaffFacilityData();

      data = await joinChildrenData({
        tables,
        staffId: appState.STAFF_ID,
        date: appState.WEEK_DAY,
      });

      } else if (api === mariadbApi) {
        console.log("🧩 MariaDBモードでAPIを呼び出し");
        data = await mariadbApi.getChildrenByStaffAndDay({
          staffId: appState.STAFF_ID,
          date: appState.WEEK_DAY,
          facility_id,
        });
      } else {
        console.log("❌ それ以外のAPIモードです");
        return;
      }

      // ✅ 取得データを反映
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
      console.error("❌ 子どもデータ読み込みエラー:", error);
    }
  }, [appState.STAFF_ID, appState.WEEK_DAY, setChildrenData, updateAppState, api]);

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
