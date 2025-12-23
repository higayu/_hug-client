// contexts/appState/AppStateContext.jsx
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from 'react'
import { useDispatch } from 'react-redux'

import { useActiveApi } from './useActiveApi'
import { useReduxBindings } from './useReduxBindings'
import { useWindowBridge } from './useWindowBridge'
import { initializeAppState } from './useAppInitializer'

import {
  setCurrentDate as setCurrentDateRedux,
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

  // 🔒 初期化ガード
  const didInitRef = useRef(false)

  const redux = useReduxBindings()
  const { activeApi, setActiveApi, resolveApiByDatabaseType } = useActiveApi()

  const [isInitialized, setIsInitialized] = useState(false)
  const [activeSidebarTab, setActiveSidebarTab] = useState('tools')

  const [iniState, setIniState] = useState({
    appSettings: {},
    userPreferences: {},
    apiSettings: {},
  })

  // ===== ini 操作 =====
  const loadIni = useCallback(async () => {
    const iniData = await loadIniFromUtils()
    if (!iniData) return null

    setIniState({
      appSettings: iniData.appSettings ?? {},
      userPreferences: iniData.userPreferences ?? {},
      apiSettings: iniData.apiSettings ?? {},
    })

    return iniData
  }, [])

  const saveIni = useCallback(
    async (override) => {
      const source = override ?? iniState
      return window.electronAPI.saveIni({
        version: '1.0.0',
        appSettings: source.appSettings ?? {},
        userPreferences: source.userPreferences ?? {},
        apiSettings: source.apiSettings ?? {},
      })
    },
    [iniState]
  )

  const updateIniSetting = useCallback(async (path, value) => {
    await window.electronAPI.updateIniSetting(path, value)
    setIniState((prev) => {
      const next = structuredClone(prev)
      const keys = path.split('.')
      let cur = next
      for (let i = 0; i < keys.length - 1; i++) cur = cur[keys[i]]
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

  // ===== 初期化 =====
  useEffect(() => {
    if (didInitRef.current) return
    didInitRef.current = true

    const init = async () => {
      const { ini } = await initializeAppState({
        dispatch,
        resolveApiByDatabaseType,
        setActiveApi,
        setIsInitialized,
      })

      const iniData = ini ?? (await loadIniFromUtils())
      if (iniData) {
        setIniState({
          appSettings: iniData.appSettings ?? {},
          userPreferences: iniData.userPreferences ?? {},
          apiSettings: iniData.apiSettings ?? {},
        })
      }
    }

    init()
  }, [dispatch, resolveApiByDatabaseType, setActiveApi])

  // ===== ini 反映 =====
  useEffect(() => {
    const apiSettings = iniState?.apiSettings
    if (!apiSettings) return

    const updates = {}

    if (!redux.STAFF_ID && apiSettings.staffId != null) {
      updates.STAFF_ID = String(apiSettings.staffId)
    }
    if (!redux.FACILITY_ID && apiSettings.facilityId != null) {
      updates.FACILITY_ID = String(apiSettings.facilityId)
    }

    if (!activeApi) {
      const dbType = apiSettings.databaseType ?? 'sqlite'
      setActiveApi(resolveApiByDatabaseType(dbType))
      updates.DATABASE_TYPE = dbType
    }

    if (apiSettings.debugFlg != null) {
      updates.DEBUG_FLG =
        apiSettings.debugFlg === true || apiSettings.debugFlg === 'true'
    }

    if (Object.keys(updates).length > 0) {
      dispatch(updateAppStateRedux(updates))
    }
  }, [
    iniState?.apiSettings,
    redux.STAFF_ID,
    redux.FACILITY_ID,
    redux.DEBUG_FLG,
    activeApi,
    resolveApiByDatabaseType,
    setActiveApi,
    dispatch,
  ])

  // ===== Redux wrappers =====
  const updateAppState = useCallback(
    (updates) => dispatch(updateAppStateRedux(updates)),
    [dispatch]
  )

  const setCurrentDate = useCallback(
    (payload) => dispatch(setCurrentDateRedux(payload)),
    [dispatch]
  )

  const setSelectedChildCallback = useCallback(
    (childId, childName) =>
      dispatch(setSelectedChild({ childId, childName })),
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

  const setIniStateDirect = useCallback((next) => {
    setIniState(next)
  }, [])

  // ===== window bridge =====
  useWindowBridge({
    isInitialized,
    appState: redux.appState,
    activeApi,
    actions: {
      updateAppState,
      setCurrentDate,
      setSelectedChild: setSelectedChildCallback,
      setChildrenData,
      setSelectedPcName: setSelectedPcNameCallback,
      setAttendanceData,
      setActiveSidebarTab,
      setIniState: setIniStateDirect,
    },
  })

  return (
    <AppStateContext.Provider
      value={{
        ...redux,
        isInitialized,
        setIsInitialized,
        iniState,
        loadIni,
        saveIni,
        updateIniSetting,
        setIniState: setIniStateDirect,
        isFeatureEnabled,
        getUISettings,
        getWindowSettings,
        activeApi,

        updateAppState,
        setCurrentDate,
        setSelectedChild: setSelectedChildCallback,
        setChildrenData,
        setSelectedPcName: setSelectedPcNameCallback,
        setAttendanceData,
        setSelectedChildColumns: setSelectedChildColumnsCallback,

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
