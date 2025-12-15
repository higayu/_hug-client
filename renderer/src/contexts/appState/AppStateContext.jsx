// contexts/appState/AppStateContext.jsx
import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useDispatch } from 'react-redux'

import { useActiveApi } from './useActiveApi'
import { useReduxBindings } from './useReduxBindings'
import { useWindowBridge } from './useWindowBridge'
import { initializeAppState } from './useAppInitializer'
import {
  setDateStr,
  setWeekDay,
  setSelectedChild,
  setSelectedPcName,
  setChildrenData as setChildrenDataRedux,
  setAttendanceData as setAttendanceDataRedux,
  setSelectedChildColumns,
  updateAppState as updateAppStateRedux,
} from '@/store/slices/appStateSlice'
import { loadIni as loadIniFromUtils } from '@/utils/iniUtils'



const AppStateContext = createContext(null)

export function AppStateProvider({ children }) {
  const dispatch = useDispatch()

  // Redux state束
  const redux = useReduxBindings()

  // 実体系 state
  const { activeApi, setActiveApi, resolveApiByDatabaseType } = useActiveApi()

  const [isInitialized, setIsInitialized] = useState(false)
  const [activeSidebarTab, setActiveSidebarTab] = useState('tools')
  const [iniState, setIniState] = useState({
    appSettings: {},
    userPreferences: {},
  })

  // ===== ini 操作系を先に定義 =====
  const loadIni = useCallback(async () => {
    const iniData = await loadIniFromUtils()

    setIniState({
      appSettings: iniData.appSettings ?? {},
      userPreferences: iniData.userPreferences ?? {},
    })

    return iniData
  }, [])

  const saveIni = useCallback(async (override) => {
    const source = override ?? iniState

    return window.electronAPI.saveIni({
      version: '1.0.0',
      appSettings: source.appSettings,
      userPreferences: source.userPreferences,
    })
  }, [iniState])

  const updateIniSetting = useCallback(async (path, value) => {
    await window.electronAPI.updateIniSetting(path, value)

    setIniState(prev => {
      const next = structuredClone(prev)
      const keys = path.split('.')
      let cur = next
      for (let i = 0; i < keys.length - 1; i++) {
        cur = cur[keys[i]]
      }
      cur[keys.at(-1)] = value
      return next
    })
  }, [])

  const isFeatureEnabled = useCallback(
    (name) => iniState.appSettings.features?.[name]?.enabled ?? false,
    [iniState]
  )

  const getUISettings = useCallback(
    () => iniState.appSettings.ui,
    [iniState]
  )

  const getWindowSettings = useCallback(
    () => iniState.appSettings.window,
    [iniState]
  )


  /** 初期化は「1回だけ」 */
  useEffect(() => {
    const init = async () => {
      await initializeAppState({
        dispatch,
        resolveApiByDatabaseType,
        setActiveApi,
        setIsInitialized,
      })

      // ★ ini.json をここで読む
      const iniData = await loadIniFromUtils()

      setIniState({
        appSettings: iniData.appSettings ?? {},
        userPreferences: iniData.userPreferences ?? {},
      })
    }

    init()
  }, [dispatch])

  // IniStateContext 互換レイヤー（後方互換）
  useEffect(() => {
    if (!iniState || !iniState.appSettings) return

    window.IniState = {
      // state
      ...iniState,

      // methods（IniStateContext互換）
      loadIni,
      saveIni,
      updateIniSetting,
      isFeatureEnabled,
      getButtonConfig: (name) =>
        iniState.appSettings.features?.[name] ?? {},
      getUISettings,
      getWindowSettings,
    }

    return () => {
      delete window.IniState
    }
  }, [
    iniState,
    loadIni,
    saveIni,
    updateIniSetting,
    isFeatureEnabled,
    getUISettings,
    getWindowSettings,
  ])



  const updateAppState = useCallback(
    (updates) => {
      dispatch(updateAppStateRedux(updates))
    },
    [dispatch]
  )

  const setDate = useCallback(
    (date) => dispatch(setDateStr(date)),
    [dispatch]
  )

  const setWeekday = useCallback(
    (weekday) => dispatch(setWeekDay(weekday)),
    [dispatch]
  )

  const setSelectedChildCallback = useCallback(
    (childId, childName) => {
      dispatch(setSelectedChild({ childId, childName }))
    },
    [dispatch]
  )

  const setChildrenData = useCallback(
    (data) => dispatch(setChildrenDataRedux(data)),
    [dispatch]
  )

  const setSelectedPcNameCallback = useCallback(
    (pcName) => dispatch(setSelectedPcName(pcName)),
    [dispatch]
  )

  const setAttendanceData = useCallback(
    (data) => dispatch(setAttendanceDataRedux(data)),
    [dispatch]
  )

  const setSelectedChildColumnsCallback = useCallback(
    (columns) => dispatch(setSelectedChildColumns(columns)),
    [dispatch]
  )

  const setIniStateDirect = useCallback((nextState) => {
    setIniState(nextState)
  }, [])


  /** window 連携 */
  useWindowBridge({
    isInitialized,
    appState: redux.appState,
    activeApi,
    actions: {
      updateAppState,
      setSelectedChild: setSelectedChildCallback,
      setChildrenData,
      setSelectedPcName: setSelectedPcNameCallback,
      setAttendanceData,
      setActiveSidebarTab,
    },
  })


  return (
    <AppStateContext.Provider
      value={{
        // Redux state（useReduxBindings 由来）
        ...redux,

         // ini state（★ 追加）
        iniState,
        loadIni,
        isInitialized,
        saveIni,
        updateIniSetting,
        setIniState: setIniStateDirect,
        isFeatureEnabled,
        getUISettings,
        getWindowSettings,

        // app state
        activeApi,

        // ===== action 系（★ 追加）=====
        updateAppState,
        setDate,
        setWeekday,
        setSelectedChild: setSelectedChildCallback,
        setChildrenData,
        setSelectedPcName: setSelectedPcNameCallback,
        setAttendanceData,
        setSelectedChildColumns: setSelectedChildColumnsCallback,

        // UI state
        activeSidebarTab,
        setActiveSidebarTab,
      }}
    >
      {children}
    </AppStateContext.Provider>
  )
}

export function useAppState() {
  const ctx = useContext(AppStateContext)
  if (!ctx) {
    throw new Error('useAppState must be used within AppStateProvider')
  }
  return ctx
}
