// src/components/Sidebar/TabsContainer/SelectChildren/TodayChildrenList/debug/useTodayChildrenListDebug.js

import { useEffect, useRef } from "react"
import { DEBUG_TODAY_CHILDREN_LIST, debugLog, debugTable } from "./debug"
import { splitChildrenData } from "@/AppStateContext/splitChildrenData"

export function useTodayChildrenListDebug({
  appState,

  SELECT_CHILD,
  SELECT_CHILD_FILTER_MODE,
  CURRENT_DAY_OF_WEEK,
  childrenData,
  waiting_childrenData,
  Experience_childrenData,
  attendanceData,

  databaseState,
  dbChildren,
  dbFacilityChildren,
  dbPc,
  dbPcToChildren,
  dbDayOfWeek,

  weekChildrenData,
  waitingChildrenData,
  experienceChildrenData,

  activeTab,
}) {
  const previousDayOfWeekRef = useRef(CURRENT_DAY_OF_WEEK)

  // ==============================
  // 曜日変更時の useAppState 監視
  // ==============================
  useEffect(() => {
    if (!DEBUG_TODAY_CHILDREN_LIST) return

    const previousDayOfWeek = previousDayOfWeekRef.current

    // 初回レンダリングでは出さず、曜日が変わった瞬間だけ出す
    if (previousDayOfWeek === CURRENT_DAY_OF_WEEK) {
      return
    }

    let cancelled = false

    async function logDayOfWeekChange() {
      console.groupCollapsed(
        `[TodayChildrenList] 曜日変更検知: ${previousDayOfWeek} → ${CURRENT_DAY_OF_WEEK}`
      )

      try {
        console.log("useAppState 全体:", appState)

        const weekdayId = CURRENT_DAY_OF_WEEK?.weekdayId
        const staffId = appState?.STAFF_ID
        const facilityId = appState?.FACILITY_ID
        const tables = appState?.databaseState

        console.log("曜日データ CURRENT_DAY_OF_WEEK:", CURRENT_DAY_OF_WEEK)
        console.log("曜日データ weekdayId:", weekdayId)
        console.log("スタッフID:", staffId)
        console.log("施設ID:", facilityId)
        console.log("databaseState:", tables)
        console.log("manager2テーブル:", tables?.managers2)

        if (!tables) {
          console.warn("[TodayChildrenList] databaseState が空のため splitChildrenData をスキップ")
        } else if (weekdayId == null) {
          console.warn("[TodayChildrenList] weekdayId が空のため splitChildrenData をスキップ")
        } else {
          const result = await splitChildrenData({
            tables,
            staffId,
            weekdayId,
            facility_id: facilityId,
          })

          if (!cancelled) {
            console.log("今の曜日の児童 splitChildrenData result:", result)

            console.log("splitChildrenData 件数:", {
              childrenData: Array.isArray(result?.childrenData)
                ? result.childrenData.length
                : "not array",
              waiting_childrenData: Array.isArray(result?.waiting_childrenData)
                ? result.waiting_childrenData.length
                : "not array",
              Experience_childrenData: Array.isArray(result?.Experience_childrenData)
                ? result.Experience_childrenData.length
                : "not array",
            })

            if (Array.isArray(result?.childrenData)) {
              console.table(
                result.childrenData.map((child) => ({
                  children_id: child?.children_id,
                  children_name: child?.children_name,
                  priority: child?.priority,
                  pc_name: child?.pc_name,
                  support_start_time: child?.support_start_time,
                  support_end_time: child?.support_end_time,
                }))
              )
            }
          }
        }

        console.log("曜日変更時の主要値:", {
          previousDayOfWeek,
          CURRENT_DAY_OF_WEEK,
          SELECT_CHILD,
          SELECT_CHILD_FILTER_MODE,
          childrenDataCount: Array.isArray(childrenData)
            ? childrenData.length
            : "not array",
          waitingChildrenDataCount: Array.isArray(waiting_childrenData)
            ? waiting_childrenData.length
            : "not array",
          experienceChildrenDataCount: Array.isArray(Experience_childrenData)
            ? Experience_childrenData.length
            : "not array",
          attendanceDataCount: Array.isArray(attendanceData)
            ? attendanceData.length
            : "not array",
          dbDayOfWeekCount: Array.isArray(dbDayOfWeek)
            ? dbDayOfWeek.length
            : "not array",
        })

        console.log("AppState childrenData:", childrenData)
        console.log("AppState waiting_childrenData:", waiting_childrenData)
        console.log("AppState Experience_childrenData:", Experience_childrenData)
        console.log("AppState attendanceData:", attendanceData)
        console.log("AppState dbDayOfWeek:", dbDayOfWeek)
      } catch (error) {
        console.error("[TodayChildrenList] 曜日変更ログ出力中にエラー:", error)
      } finally {
        console.groupEnd()
      }
    }

    logDayOfWeekChange()

    previousDayOfWeekRef.current = CURRENT_DAY_OF_WEEK

    return () => {
      cancelled = true
    }
  }, [
    CURRENT_DAY_OF_WEEK,
    appState,
    SELECT_CHILD,
    SELECT_CHILD_FILTER_MODE,
    childrenData,
    waiting_childrenData,
    Experience_childrenData,
    attendanceData,
    dbDayOfWeek,
  ])

  // ==============================
  // databaseSlice 監視
  // ==============================
  useEffect(() => {
    if (!DEBUG_TODAY_CHILDREN_LIST) return

    console.groupCollapsed("[TodayChildrenList] databaseSlice from useAppState")

    console.log("CURRENT_DAY_OF_WEEK:", CURRENT_DAY_OF_WEEK)

    console.log("databaseState:", databaseState)
    console.log("dbChildren:", dbChildren)
    console.log("dbFacilityChildren:", dbFacilityChildren)
    console.log("dbPc:", dbPc)
    console.log("dbPcToChildren:", dbPcToChildren)
    console.log("dbDayOfWeek:", dbDayOfWeek)

    console.log("件数:", {
      dbChildren: Array.isArray(dbChildren) ? dbChildren.length : "not array",
      dbFacilityChildren: Array.isArray(dbFacilityChildren)
        ? dbFacilityChildren.length
        : "not array",
      dbPc: Array.isArray(dbPc) ? dbPc.length : "not array",
      dbPcToChildren: Array.isArray(dbPcToChildren)
        ? dbPcToChildren.length
        : "not array",
      dbDayOfWeek: Array.isArray(dbDayOfWeek)
        ? dbDayOfWeek.length
        : "not array",
    })

    if (Array.isArray(dbChildren)) {
      console.table(dbChildren)
    }

    if (Array.isArray(dbDayOfWeek)) {
      console.table(dbDayOfWeek)
    }

    console.groupEnd()
  }, [
    CURRENT_DAY_OF_WEEK,
    databaseState,
    dbChildren,
    dbFacilityChildren,
    dbPc,
    dbPcToChildren,
    dbDayOfWeek,
  ])

  // ==============================
  // AppState から受け取った値を監視
  // ==============================
  useEffect(() => {
    debugLog("AppStateから受け取った値", {
      SELECT_CHILD,
      SELECT_CHILD_FILTER_MODE,
      CURRENT_DAY_OF_WEEK,
      attendanceData,
      childrenData,
      waiting_childrenData,
      Experience_childrenData,
    })

    debugLog("配列変換後の件数", {
      weekChildrenDataCount: weekChildrenData.length,
      waitingChildrenDataCount: waitingChildrenData.length,
      experienceChildrenDataCount: experienceChildrenData.length,
      attendanceDataType: Array.isArray(attendanceData)
        ? "array"
        : typeof attendanceData,
      attendanceDataCount: Array.isArray(attendanceData)
        ? attendanceData.length
        : undefined,
    })

    debugTable(
      "childrenData",
      weekChildrenData.map((child) => ({
        children_id: child?.children_id,
        children_name: child?.children_name,
        priority: child?.priority,
        pc_name: child?.pc_name,
        support_start_time: child?.support_start_time,
        support_end_time: child?.support_end_time,
      }))
    )

    debugTable(
      "waiting_childrenData",
      waitingChildrenData.map((child) => ({
        children_id: child?.children_id,
        children_name: child?.children_name,
        priority: child?.priority,
        pc_name: child?.pc_name,
        support_start_time: child?.support_start_time,
        support_end_time: child?.support_end_time,
      }))
    )

    debugTable(
      "Experience_childrenData",
      experienceChildrenData.map((child) => ({
        children_id: child?.children_id,
        children_name: child?.children_name,
        priority: child?.priority,
        pc_name: child?.pc_name,
        support_start_time: child?.support_start_time,
        support_end_time: child?.support_end_time,
      }))
    )
  }, [
    SELECT_CHILD,
    SELECT_CHILD_FILTER_MODE,
    CURRENT_DAY_OF_WEEK,
    attendanceData,
    childrenData,
    waiting_childrenData,
    Experience_childrenData,
    weekChildrenData,
    waitingChildrenData,
    experienceChildrenData,
  ])

  // ==============================
  // activeTab 監視
  // ==============================
  useEffect(() => {
    debugLog("activeTab 変更", {
      activeTab,
    })
  }, [activeTab])
}