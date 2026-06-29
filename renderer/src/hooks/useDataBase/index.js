// src/hooks/useDataBase/index.js
import { useEffect, useState, useCallback, useRef } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useAppState } from "@/AppStateContext"
import { ELEMENT_IDS } from "@/utils/app/constants"

import { mariadbApi } from "@/sql/mariadbApi"
import { sqliteApi } from "@/sql/sqliteApi"
import { splitChildrenData } from "./splitChildrenData"
import { fetchAllTables } from "@/store/slices/databaseSlice"
import {
  selectExtractedData,
  selectAttendanceError,
} from "@/store/slices/attendanceSlice"

import { selectDatabaseType } from "@/store/slices/appStateSlice"
import { checkMariaDbConnection } from "./checkMariaDbConnection"

export function useDataBase() {
  // =============================================================
  // AppState（必要なものだけ取り出す）
  // =============================================================
  const {
    STAFF_ID,
    CURRENT_DAY_OF_WEEK,
    isInitialized,
    setSelectedChild,
    setChildrenData,
    updateAppState,
    SELECT_CHILD,
  } = useAppState()

  const weekdayId = CURRENT_DAY_OF_WEEK?.weekdayId

  const dispatch = useDispatch()

  const extractedData = useSelector(selectExtractedData)
  const attendanceError = useSelector(selectAttendanceError)
  const databaseTypeFromRedux = useSelector(selectDatabaseType)

  const databaseType = databaseTypeFromRedux || "sqlite"

  // =============================================================
  // local state（表示用）
  // =============================================================
  const [childrenData, setLocalChildrenData] = useState([])
  const [waitingChildrenData, setWaitingChildrenData] = useState([])
  const [experienceChildrenData, setExperienceChildrenData] = useState([])

  const childrenDataRef = useRef(childrenData)
  const loadingRef = useRef(false)

  useEffect(() => {
    childrenDataRef.current = childrenData
  }, [childrenData])

  // =============================================================
  // DATABASE_TYPE から API を解決
  // =============================================================
  const resolveApiByDatabaseType = useCallback((type) => {
    return type === "mariadb" ? mariadbApi : sqliteApi
  }, [])

  // =============================================================
  // 子どもデータ取得
  // =============================================================
  const loadDataBase = useCallback(
    async (options = {}) => {
      const forceDatabaseType = options.forceDatabaseType

      if (loadingRef.current) {
        console.warn("⏳ [useDataBase] すでにデータ取得中のためスキップします")
        return
      }

      loadingRef.current = true

      try {
        if (!isInitialized || !STAFF_ID || !weekdayId) {
          console.warn("⏳ [useDataBase] 前提条件不足", {
            isInitialized,
            STAFF_ID,
            weekdayId,
          })
          return
        }

        const facilitySelect = document.getElementById(
          ELEMENT_IDS.FACILITY_SELECT
        )

        const facility_id = facilitySelect ? facilitySelect.value : null

        const resolvedDatabaseType =
          forceDatabaseType || databaseType || "sqlite"

        let apiToUse = resolveApiByDatabaseType(resolvedDatabaseType)

        console.log("🔍 [useDataBase] resolvedDatabaseType:", {
          forceDatabaseType,
          databaseType,
          resolvedDatabaseType,
        })

        // =============================================================
        // MariaDB の場合だけ接続確認
        // =============================================================
        if (resolvedDatabaseType === "mariadb") {
          console.log("🔌 [useDataBase] MariaDB接続確認を実行します")

          const connectionResult = await checkMariaDbConnection(dispatch, {
            autoFallbackToSqlite: true,
            switchToMariaDbOnSuccess: false,
            persistIni: true,
          })

          console.log(
            "🔌 [useDataBase] MariaDB接続確認結果:",
            connectionResult
          )

          if (connectionResult?.connected === true) {
            apiToUse = mariadbApi
          } else {
            console.warn(
              "⚠️ [useDataBase] MariaDBに接続できないため SQLite で取得します"
            )

            apiToUse = sqliteApi
          }
        }

        console.log(
          "🔍 [useDataBase] 使用API:",
          apiToUse === mariadbApi
            ? "mariadbApi"
            : apiToUse === sqliteApi
              ? "sqliteApi"
              : "unknown"
        )

        const tables = await apiToUse.getAllTables()

        if (!tables) {
          console.error("❌ [useDataBase] テーブル取得失敗")
          return
        }

        console.log("⭐ [useDataBase] テーブルデータ:", tables)

        await dispatch(fetchAllTables(tables))

        const data = await splitChildrenData({
          tables,
          staffId: STAFF_ID,
          weekdayId,
          ...(facility_id && { facility_id }),
        })

        const weekChildren = data.week_children || []
        const waiting = data.waiting_children || []
        const experience = data.Experience_children || []

        setChildrenData(weekChildren)

        updateAppState({
          childrenData: weekChildren,
          waiting_childrenData: waiting,
          Experience_childrenData: experience,
        })

        childrenDataRef.current = weekChildren
        setLocalChildrenData(weekChildren)
        setWaitingChildrenData(waiting)
        setExperienceChildrenData(experience)
      } catch (error) {
        console.error("❌ [useDataBase] 子どもデータ読み込みエラー:", error)
      } finally {
        loadingRef.current = false
      }
    },
    [
      isInitialized,
      databaseType,
      STAFF_ID,
      weekdayId,
      dispatch,
      setChildrenData,
      updateAppState,
      resolveApiByDatabaseType,
    ]
  )

  // =============================================================
  // 曜日変更イベント・DB種別変更イベント（互換用）
  // =============================================================
  useEffect(() => {
    const handleWeekdayChanged = async () => {
      console.log("📅 [useDataBase] weekday-changed 受信")

      setSelectedChild("", "")

      await loadDataBase()
    }

    const handleDatabaseTypeChanged = async (event) => {
      const nextDatabaseType = event?.detail?.databaseType || "sqlite"

      console.log("🔁 [useDataBase] database-type-changed 受信", {
        nextDatabaseType,
        detail: event?.detail,
      })

      setSelectedChild("", "")

      await loadDataBase({
        forceDatabaseType: nextDatabaseType,
      })
    }

    window.addEventListener("weekday-changed", handleWeekdayChanged)
    window.addEventListener("database-type-changed", handleDatabaseTypeChanged)

    return () => {
      window.removeEventListener("weekday-changed", handleWeekdayChanged)
      window.removeEventListener(
        "database-type-changed",
        handleDatabaseTypeChanged
      )
    }
  }, [loadDataBase, setSelectedChild])

  // =============================================================
  // 初期化 & 依存変化で再取得
  // =============================================================
  useEffect(() => {
    loadDataBase()
  }, [loadDataBase])

  // =============================================================
  // 専門的支援 利用日数（useSpeDate）を該当児童だけ更新
  // =============================================================
  const patchChildUseSpeDate = useCallback(
    (childId, useSpeDate) => {
      const patchList = (list) =>
        list.map((child) =>
          String(child.children_id) === String(childId)
            ? { ...child, useSpeDate }
            : child
        )

      const nextWeek = patchList(childrenDataRef.current)

      childrenDataRef.current = nextWeek

      setLocalChildrenData(nextWeek)
      setChildrenData(nextWeek)

      updateAppState({
        childrenData: nextWeek,
      })

      setWaitingChildrenData((prev) => patchList(prev))
      setExperienceChildrenData((prev) => patchList(prev))
    },
    [setChildrenData, updateAppState]
  )

  // =============================================================
  // return
  // =============================================================
  return {
    childrenData,
    waitingChildrenData,
    experienceChildrenData,

    loadDataBase,
    patchChildUseSpeDate,

    SELECT_CHILD,
    extractedData,
    attendanceError,
  }
}