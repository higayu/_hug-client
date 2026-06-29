// renderer/src/hooks/useDataBase/index.js

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

        let resolvedDatabaseType =
          forceDatabaseType || databaseType || "sqlite"

        let apiToUse = resolveApiByDatabaseType(resolvedDatabaseType)

        let mariaDbConnectionResult = null
        let checkedMariaDbConnection = false

        console.group("🧩 [useDataBase] loadDataBase START")

        console.log("🔍 [useDataBase] 初期 resolvedDatabaseType:", {
          forceDatabaseType,
          databaseType,
          resolvedDatabaseType,
          reduxDatabaseType: databaseTypeFromRedux,
          iniDatabaseType: window.IniState?.apiSettings?.databaseType,
          iniAutoSwitching: window.IniState?.apiSettings?.autoSwitching,
        })

        // =============================================================
        // DATABASE_TYPE=sqlite の場合
        //
        // AUTO_SWITCHING=true なら checkMariaDbConnection 側で
        // サーバ接続OK時に mariadb へ切り替わる。
        //
        // ここで重要なのは、sqlite のときも checkMariaDbConnection を呼ぶこと。
        // これをしないと AUTO_SWITCHING 判定まで到達しない。
        // =============================================================
        if (resolvedDatabaseType === "sqlite") {
          console.log(
            "🔌 [useDataBase] DATABASE_TYPE=sqlite のため AUTO_SWITCHING 判定用に MariaDB接続確認を実行します"
          )

          mariaDbConnectionResult = await checkMariaDbConnection(dispatch, {
            // sqlite中のチェックなので、失敗しても fallback 切替は不要
            autoFallbackToSqlite: false,

            // AUTO_SWITCHING の判定は checkMariaDbConnection.js 側に任せる
            // ここを true にすると AUTO_SWITCHING=false でも強制切替になるので false
            switchToMariaDbOnSuccess: false,

            // AUTO_SWITCHING=true で切り替わった場合は ini.json に保存する
            persistIni: true,
          })

          checkedMariaDbConnection = true

          console.log(
            "🔌 [useDataBase] sqlite時の MariaDB接続確認結果:",
            mariaDbConnectionResult
          )

          if (mariaDbConnectionResult?.switchedDatabaseType === "mariadb") {
            console.log(
              "✅ [useDataBase] AUTO_SWITCHING により mariadb へ切替済み。今回の取得も mariadbApi を使用します"
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
        //
        // MariaDB 接続確認を行い、失敗したら SQLite fallback。
        //
        // ただし、直前の sqlite 分岐で checkMariaDbConnection 済みかつ
        // mariadb へ切替済みの場合は、二重チェックせず mariadbApi を使う。
        // =============================================================
        if (resolvedDatabaseType === "mariadb") {
          if (checkedMariaDbConnection) {
            console.log(
              "🔌 [useDataBase] すでに MariaDB接続確認済みのため再チェックを省略します",
              {
                connected: mariaDbConnectionResult?.connected,
                switchedDatabaseType:
                  mariaDbConnectionResult?.switchedDatabaseType,
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
            console.log("🔌 [useDataBase] DATABASE_TYPE=mariadb のため MariaDB接続確認を実行します")

            mariaDbConnectionResult = await checkMariaDbConnection(dispatch, {
              // mariadb中の接続失敗時は sqlite に fallback
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
                "⚠️ [useDataBase] MariaDBに接続できないため SQLite で取得します"
              )

              resolvedDatabaseType = "sqlite"
              apiToUse = sqliteApi
            }
          }
        }

        console.log("🔍 [useDataBase] 最終的に使用するDB/API:", {
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

        console.log("✅ [useDataBase] loadDataBase 完了:", {
          resolvedDatabaseType,
          weekChildrenCount: weekChildren.length,
          waitingCount: waiting.length,
          experienceCount: experience.length,
        })

        console.groupEnd()
      } catch (error) {
        console.error("❌ [useDataBase] 子どもデータ読み込みエラー:", error)
        console.groupEnd()
      } finally {
        loadingRef.current = false
      }
    },
    [
      isInitialized,
      databaseType,
      databaseTypeFromRedux,
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