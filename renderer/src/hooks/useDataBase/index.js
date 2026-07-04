// renderer/src/hooks/useDataBase/index.js

import { useEffect, useCallback, useRef } from "react"
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

/**
 * DBデータ取得フック
 *
 * 重要:
 * - autoLoad=false がデフォルト
 * - useDataBase() を呼ぶだけでは loadDataBase は実行しない
 * - 初期起動時に1回だけ取得したい場所だけ useDataBase({ autoLoad: true }) を使う
 */
export function useDataBase({ autoLoad = false } = {}) {
  // =============================================================
  // AppState（必要なものだけ取り出す）
  // =============================================================
  const {
    STAFF_ID,
    CURRENT_DAY_OF_WEEK,
    isInitialized,
    setSelectedChild,
    setChildrenData,
    setWaitingChildrenData,
    setExperienceChildrenData,
    SELECT_CHILD,
  } = useAppState()

  const weekdayId = CURRENT_DAY_OF_WEEK?.weekdayId

  const dispatch = useDispatch()

  const extractedData = useSelector(selectExtractedData)
  const attendanceError = useSelector(selectAttendanceError)
  const databaseTypeFromRedux = useSelector(selectDatabaseType)

  const databaseType = databaseTypeFromRedux || "mariadb"

  // =============================================================
  // 取得制御用 ref
  // =============================================================

  const loadingRef = useRef(false)
  const loadSeqRef = useRef(0)
  const didAutoLoadRef = useRef(false)

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
      const loadId = ++loadSeqRef.current
      const reason = options.reason || "manual/unknown"
      const forceDatabaseType = options.forceDatabaseType

      console.group(`🧩 [useDataBase] loadDataBase START #${loadId}`)
      console.log("📌 [useDataBase] call info:", {
        loadId,
        reason,
        forceDatabaseType,
        autoLoad,
        isInitialized,
        STAFF_ID,
        weekdayId,
        databaseType,
        reduxDatabaseType: databaseTypeFromRedux,
        appStateDatabaseType: window.AppState?.DATABASE_TYPE,
        iniDatabaseType: window.IniState?.apiSettings?.databaseType,
        iniAutoSwitching: window.IniState?.apiSettings?.autoSwitching,
      })

      if (loadingRef.current) {
        console.warn("⏳ [useDataBase] すでにデータ取得中のためスキップします", {
          loadId,
          reason,
        })
        console.groupEnd()
        return false
      }

      loadingRef.current = true

      try {
        if (!isInitialized || !STAFF_ID || !weekdayId) {
          console.warn("⏳ [useDataBase] 前提条件不足", {
            loadId,
            reason,
            isInitialized,
            STAFF_ID,
            weekdayId,
          })
          console.groupEnd()
          window.alert("⏳ [useDataBase] 前提条件不足");
          return false
        }

        const facilitySelect = document.getElementById(
          ELEMENT_IDS.FACILITY_SELECT
        )

        const facility_id = facilitySelect ? facilitySelect.value : null

        let resolvedDatabaseType =
          forceDatabaseType || databaseType || "mariadb"

        let apiToUse = resolveApiByDatabaseType(resolvedDatabaseType)

        let mariaDbConnectionResult = null
        let checkedMariaDbConnection = false

        console.log("🔍 [useDataBase] 初期 resolvedDatabaseType:", {
          loadId,
          reason,
          forceDatabaseType,
          databaseType,
          resolvedDatabaseType,
          reduxDatabaseType: databaseTypeFromRedux,
          appStateDatabaseType: window.AppState?.DATABASE_TYPE,
          iniDatabaseType: window.IniState?.apiSettings?.databaseType,
          iniAutoSwitching: window.IniState?.apiSettings?.autoSwitching,
        })

        // =============================================================
        // DATABASE_TYPE=sqlite の場合
        // =============================================================
        if (resolvedDatabaseType === "sqlite") {
          console.log(
            "🔌 [useDataBase] DATABASE_TYPE=sqlite のため AUTO_SWITCHING / fallback 判定用に MariaDB接続確認を実行します"
          )

          mariaDbConnectionResult = await checkMariaDbConnection(dispatch, {
            autoFallbackToSqlite: true,
            switchToMariaDbOnSuccess: false,
            persistIni: true,
          })

          checkedMariaDbConnection = true

          console.log(
            "🔌 [useDataBase] sqlite時の MariaDB接続確認結果:",
            mariaDbConnectionResult
          )

          if (mariaDbConnectionResult?.switchedDatabaseType === "mariadb") {
            console.log(
              "✅ [useDataBase] AUTO_SWITCHING により mariadb へ切替済み。今回の取得も mariadbApi を使用します",
              {
                connected: mariaDbConnectionResult?.connected,
                switchedDatabaseType:
                  mariaDbConnectionResult?.switchedDatabaseType,
                autoSwitching: mariaDbConnectionResult?.autoSwitching,
                currentDatabaseType:
                  mariaDbConnectionResult?.currentDatabaseType,
              }
            )

            resolvedDatabaseType = "mariadb"
            apiToUse = mariadbApi
          } else {
            console.log(
              "⏭ [useDataBase] MariaDBへは切り替えず、sqliteApi を使用します",
              {
                connected: mariaDbConnectionResult?.connected,
                autoSwitching: mariaDbConnectionResult?.autoSwitching,
                switchedDatabaseType:
                  mariaDbConnectionResult?.switchedDatabaseType,
                fallbackToSqlite:
                  mariaDbConnectionResult?.fallbackToSqlite,
                currentDatabaseType:
                  mariaDbConnectionResult?.currentDatabaseType,
              }
            )

            resolvedDatabaseType = "sqlite"
            apiToUse = sqliteApi
          }
        }

        // =============================================================
        // DATABASE_TYPE=mariadb の場合
        // =============================================================
        if (resolvedDatabaseType === "mariadb") {
          if (checkedMariaDbConnection) {
            console.log(
              "🔌 [useDataBase] すでに MariaDB接続確認済みのため再チェックを省略します",
              {
                connected: mariaDbConnectionResult?.connected,
                switchedDatabaseType:
                  mariaDbConnectionResult?.switchedDatabaseType,
                fallbackToSqlite:
                  mariaDbConnectionResult?.fallbackToSqlite,
                currentDatabaseType:
                  mariaDbConnectionResult?.currentDatabaseType,
              }
            )

            if (mariaDbConnectionResult?.connected === true) {
              apiToUse = mariadbApi
            } else {
              console.warn(
                "⚠️ [useDataBase] 接続確認済みだが connected=false のため sqliteApi を使用します"
              )

              resolvedDatabaseType = "sqlite"
              apiToUse = sqliteApi
            }
          } else {
            console.log(
              "🔌 [useDataBase] DATABASE_TYPE=mariadb のため MariaDB接続確認を実行します"
            )

            mariaDbConnectionResult = await checkMariaDbConnection(dispatch, {
              autoFallbackToSqlite: true,
              switchToMariaDbOnSuccess: false,
              persistIni: true,
            })

            checkedMariaDbConnection = true

            console.log(
              "🔌 [useDataBase] mariadb時の MariaDB接続確認結果:",
              mariaDbConnectionResult
            )

            if (mariaDbConnectionResult?.connected === true) {
              resolvedDatabaseType = "mariadb"
              apiToUse = mariadbApi
            } else {
              console.warn(
                "⚠️ [useDataBase] MariaDBに接続できないため SQLite で取得します",
                {
                  connected: mariaDbConnectionResult?.connected,
                  switchedDatabaseType:
                    mariaDbConnectionResult?.switchedDatabaseType,
                  fallbackToSqlite:
                    mariaDbConnectionResult?.fallbackToSqlite,
                  currentDatabaseType:
                    mariaDbConnectionResult?.currentDatabaseType,
                }
              )

              resolvedDatabaseType = "sqlite"
              apiToUse = sqliteApi
            }
          }
        }

        console.log("🔍 [useDataBase] 最終的に使用するDB/API:", {
          loadId,
          reason,
          resolvedDatabaseType,
          apiName:
            apiToUse === mariadbApi
              ? "mariadbApi"
              : apiToUse === sqliteApi
                ? "sqliteApi"
                : "unknown",
          checkedMariaDbConnection,
          mariaDbConnectionResult,
        })

        const tables = await apiToUse.getAllTables()

        if (!tables) {
          console.error("❌ [useDataBase] テーブル取得失敗")
          console.groupEnd()
          return false
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
        setWaitingChildrenData(waiting)
        setExperienceChildrenData(experience)

        console.log("✅ [useDataBase] loadDataBase 完了:", {
          loadId,
          reason,
          resolvedDatabaseType,
          weekChildrenCount: weekChildren.length,
          waitingCount: waiting.length,
          experienceCount: experience.length,
        })

        console.groupEnd()
        return true
      } catch (error) {
        console.error("❌ [useDataBase] 子どもデータ読み込みエラー:", error)
        console.groupEnd()
        return false
      } finally {
        loadingRef.current = false
      }
    },
    [
      autoLoad,
      isInitialized,
      databaseType,
      databaseTypeFromRedux,
      STAFF_ID,
      weekdayId,
      dispatch,
      setChildrenData,
      setWaitingChildrenData,
      setExperienceChildrenData,
      resolveApiByDatabaseType,
    ]
  )

  // =============================================================
  // 曜日変更イベント・DB種別変更イベント（互換用）
  //
  // 重要:
  // - autoLoad=true のインスタンスだけイベントを監視する
  // - 複数コンポーネントで useDataBase() を呼んでもイベントリスナーが増えないようにする
  // =============================================================
  useEffect(() => {
    if (!autoLoad) {
      return undefined
    }

    const handleWeekdayChanged = async () => {
      console.log("📅 [useDataBase] weekday-changed 受信")

      setSelectedChild("", "")

      await loadDataBase({
        reason: "event/weekday-changed",
      })
    }

    const handleDatabaseTypeChanged = async (event) => {
      const nextDatabaseType = event?.detail?.databaseType || "mariadb"

      console.log("🔁 [useDataBase] database-type-changed 受信", {
        nextDatabaseType,
        detail: event?.detail,
      })

      setSelectedChild("", "")

      await loadDataBase({
        reason: "event/database-type-changed",
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
  }, [autoLoad, loadDataBase, setSelectedChild])

  // =============================================================
  // 初期化完了後に1回だけ自動取得
  //
  // 重要:
  // - autoLoad=true のインスタンスだけ実行
  // - isInitialized / STAFF_ID / weekdayId が揃ってから1回だけ実行
  // - 依存値が変わっても didAutoLoadRef により多重実行しない
  // =============================================================
  useEffect(() => {
    if (!autoLoad) return
    if (didAutoLoadRef.current) return

    if (!isInitialized || !STAFF_ID || !weekdayId) {
      console.log("⏳ [useDataBase] autoLoad 待機中", {
        isInitialized,
        STAFF_ID,
        weekdayId,
      })
      return
    }

    didAutoLoadRef.current = true

    loadDataBase({
      reason: "autoLoad/after-initialized-once",
    })
  }, [autoLoad, isInitialized, STAFF_ID, weekdayId, loadDataBase])



  // =============================================================
  // return
  // =============================================================
  return {
    loadDataBase,
  }
}