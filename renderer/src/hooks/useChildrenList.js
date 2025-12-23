// src/hooks/useChildrenList.js
import { useEffect, useState, useCallback } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useAppState } from "@/contexts/appState"
import { ELEMENT_IDS } from "@/utils/constants.js"

import { mariadbApi } from "@/sql/mariadbApi.js"
import { sqliteApi } from "@/sql/sqliteApi.js"
import { joinChildrenData } from "@/sql/getChildren/childrenJoinProcessor.js"
import { fetchAllTables } from "@/store/slices/databaseSlice.js"
import {
  selectExtractedData,
  selectAttendanceError,
} from "@/store/slices/attendanceSlice.js"

export function useChildrenList() {
  // =============================================================
  // AppState（必要なものだけ取り出す）
  // =============================================================
  const {
    STAFF_ID,
    CURRENT_DATE,
    activeApi,
    isInitialized,
    setSelectedChild,
    setSelectedPcName,
    setChildrenData,
    updateAppState,
    SELECT_CHILD,
  } = useAppState()

  const weekdayId = CURRENT_DATE?.weekdayId

  const dispatch = useDispatch()
  const extractedData = useSelector(selectExtractedData)
  const attendanceError = useSelector(selectAttendanceError)

  // =============================================================
  // local state（表示用）
  // =============================================================
  const [childrenData, setLocalChildrenData] = useState([])
  const [waitingChildrenData, setWaitingChildrenData] = useState([])
  const [experienceChildrenData, setExperienceChildrenData] = useState([])

  // =============================================================
  // 子どもデータ取得
  // =============================================================
  const loadChildren = useCallback(async () => {
    if (!isInitialized || !activeApi || !STAFF_ID || !weekdayId) {
      console.warn("⏳ [useChildrenList] 前提条件不足", {
        isInitialized,
        activeApi,
        STAFF_ID,
        weekdayId,
      })
      return
    }

    try {
      const facilitySelect = document.getElementById(
        ELEMENT_IDS.FACILITY_SELECT
      )
      const facility_id = facilitySelect ? facilitySelect.value : null

      console.log(
        "🔍 [useChildrenList] 使用API:",
        activeApi === mariadbApi
          ? "mariadbApi"
          : activeApi === sqliteApi
          ? "sqliteApi"
          : "unknown"
      )

      const tables = await activeApi.getAllTables()
      if (!tables) {
        console.error("❌ [useChildrenList] テーブル取得失敗")
        return
      }

      await dispatch(fetchAllTables(tables))

      // ★ 新仕様：weekdayId をそのまま渡す
      const data = await joinChildrenData({
        tables,
        staffId: STAFF_ID,
        weekdayId,
        ...(facility_id && { facility_id }),
      })

      const weekChildren = data.week_children || []
      const waiting = data.waiting_children || []
      const experience = data.Experience_children || []

      // Redux
      setChildrenData(weekChildren)
      updateAppState({
        childrenData: weekChildren,
        waiting_childrenData: waiting,
        Experience_childrenData: experience,
      })

      // local
      setLocalChildrenData(weekChildren)
      setWaitingChildrenData(waiting)
      setExperienceChildrenData(experience)
    } catch (error) {
      console.error("❌ [useChildrenList] 子どもデータ読み込みエラー:", error)
    }
  }, [
    isInitialized,
    activeApi,
    STAFF_ID,
    weekdayId,
    dispatch,
    setChildrenData,
    updateAppState,
  ])

  // =============================================================
  // 曜日変更イベント（互換用）
  // =============================================================
  useEffect(() => {
    const handleWeekdayChanged = async () => {
      setSelectedChild("", "")
      await loadChildren()
    }

    window.addEventListener("weekday-changed", handleWeekdayChanged)
    return () =>
      window.removeEventListener("weekday-changed", handleWeekdayChanged)
  }, [loadChildren, setSelectedChild])

  // =============================================================
  // 初期化 & 依存変化で再取得
  // =============================================================
  useEffect(() => {
    loadChildren()
  }, [loadChildren])

  // =============================================================
  // 最初の子どもを自動選択
  // =============================================================
  useEffect(() => {
    if (childrenData.length > 0 && !SELECT_CHILD) {
      const firstChild = childrenData[0]
      setSelectedChild(firstChild.children_id, firstChild.children_name)
      if (firstChild.pc_name) {
        setSelectedPcName(firstChild.pc_name)
      }
    }
  }, [childrenData, SELECT_CHILD, setSelectedChild, setSelectedPcName])

  // =============================================================
  // return
  // =============================================================
  return {
    childrenData,
    waitingChildrenData,
    experienceChildrenData,
    loadChildren,

    SELECT_CHILD,
    extractedData,
    attendanceError,
  }
}
