// renderer/src/hooks/useDataBase/index.js

import { useEffect, useCallback, useRef } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useAppState } from "@/AppStateContext"

import { mariadbApi } from "@/sql/mariadbApi"
import { sqliteApi } from "@/sql/sqliteApi"

import { fetchAllTables } from "@/store/slices/databaseSlice"
import { selectDatabaseType } from "@/store/slices/appStateSlice"
import { checkMariaDbConnection } from "./checkMariaDbConnection"

function toBooleanFlag(value, defaultValue = true) {
  if (value === true || value === "true") return true
  if (value === false || value === "false") return false
  return defaultValue
}

function getAutoSwitchingEnabledForUseDataBase() {
  if (window.AppState?.AUTO_SWITCHING !== undefined) {
    return toBooleanFlag(window.AppState.AUTO_SWITCHING, true)
  }

  if (typeof window.isAutoSwitchingEnabled === "function") {
    return toBooleanFlag(window.isAutoSwitchingEnabled(), true)
  }

  try {
    if (typeof window.getApiSettings === "function") {
      const apiSettings = window.getApiSettings()
      if (apiSettings?.autoSwitching !== undefined && apiSettings?.autoSwitching !== null) {
        return toBooleanFlag(apiSettings.autoSwitching, true)
      }
    }
  } catch (error) {
    console.warn("⚠️ [useDataBase] AUTO_SWITCHING 取得エラー:", error)
  }

  if (window.IniState?.apiSettings?.autoSwitching !== undefined) {
    return toBooleanFlag(window.IniState.apiSettings.autoSwitching, true)
  }

  return true
}

/**
 * DBデータ取得フック
 *
 * 役割:
 * - DBから全テーブルを取得する
 * - 取得した全テーブルを databaseSlice に保存する
 *
 * 重要:
 * - 子どもデータの抽出はここでは行わない
 * - childrenData / waiting_childrenData / Experience_childrenData への保存もしない
 * - 曜日変更時の再抽出は AppStateContext 側の getChildrenDataByDay() で行う
 */
export function useDataBase({ autoLoad = false } = {}) {
  const {
    isInitialized,
    setSelectedChild,
  } = useAppState()

  const dispatch = useDispatch()

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
  // DB全テーブル取得
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
        if (!isInitialized) {
          console.warn("⏳ [useDataBase] 初期化前のため取得をスキップします", {
            loadId,
            reason,
            isInitialized,
          })
          console.groupEnd()
          return false
        }

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
        //
        // 方針:
        // - AUTO_SWITCHING=false の場合は MariaDB 接続確認をしない
        // - そのまま sqliteApi を使う
        // - AUTO_SWITCHING=true の場合だけ MariaDB 接続確認を行う
        // - 接続できた場合は checkMariaDbConnection 側で mariadb へ自動切替される
        // =============================================================
        if (resolvedDatabaseType === "sqlite") {
          const autoSwitchingEnabled = getAutoSwitchingEnabledForUseDataBase()

          console.log("🔍 [useDataBase] DATABASE_TYPE=sqlite 判定:", {
            loadId,
            reason,
            resolvedDatabaseType,
            autoSwitchingEnabled,
            rawAppStateAutoSwitching: window.AppState?.AUTO_SWITCHING,
            rawIniAutoSwitching: window.IniState?.apiSettings?.autoSwitching,
          })

          if (!autoSwitchingEnabled) {
            console.log(
              "⏭ [useDataBase] DATABASE_TYPE=sqlite かつ AUTO_SWITCHING=false のため MariaDB接続確認をスキップし、sqliteApi を使用します"
            )

            resolvedDatabaseType = "sqlite"
            apiToUse = sqliteApi
          } else {
            console.log(
              "🔌 [useDataBase] DATABASE_TYPE=sqlite かつ AUTO_SWITCHING=true のため MariaDB接続確認を実行します"
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

        console.log("⭐ [useDataBase] 取得した全テーブル:", tables)

        // =============================================================
        // databaseSlice に全テーブルを保存
        // ここでは抽出しない
        // =============================================================
        await dispatch(fetchAllTables(tables))

        console.log("✅ [useDataBase] databaseSlice 保存完了:", {
          loadId,
          reason,
          resolvedDatabaseType,
          tableKeys: Object.keys(tables),
          counts: Object.fromEntries(
            Object.entries(tables).map(([key, value]) => [
              key,
              Array.isArray(value) ? value.length : "not array",
            ])
          ),
        })

        console.groupEnd()
        return true
      } catch (error) {
        console.error("❌ [useDataBase] DBテーブル読み込みエラー:", error)
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
      dispatch,
      resolveApiByDatabaseType,
    ]
  )

  // =============================================================
  // DB種別変更イベント
  //
  // 重要:
  // - database-type-changed はDB取得元が変わるので再取得する
  // - weekday-changed では再取得しない
  // - 曜日変更時は databaseSlice から再抽出するだけ
  // =============================================================
  useEffect(() => {
    if (!autoLoad) {
      return undefined
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

    window.addEventListener("database-type-changed", handleDatabaseTypeChanged)

    return () => {
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
  // - isInitialized が true になったら1回だけ全テーブル取得
  // - STAFF_ID / weekdayId は不要
  // =============================================================
  useEffect(() => {
    if (!autoLoad) return
    if (didAutoLoadRef.current) return

    if (!isInitialized) {
      console.log("⏳ [useDataBase] autoLoad 待機中", {
        isInitialized,
      })
      return
    }

    didAutoLoadRef.current = true

    loadDataBase({
      reason: "autoLoad/after-initialized-once",
    })
  }, [autoLoad, isInitialized, loadDataBase])

  // =============================================================
  // return
  // =============================================================
  return {
    loadDataBase,
  }
}