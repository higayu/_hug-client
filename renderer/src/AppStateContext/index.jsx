// AppStateContext/index.jsx
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from 'react'
import { useDispatch } from 'react-redux'

import { useReduxBindings } from './useReduxBindings'
import { useWindowBridge } from './useWindowBridge'
import { initializeAppState } from './useAppInitializer'

import {
  setCurrentDate as setCurrentDateRedux,
  setSelectedChild,
  setSelectedPcName,
  setChildrenData as setChildrenDataRedux,
  setWaitingChildrenData as setWaitingChildrenDataRedux,
  setExperienceChildrenData as setExperienceChildrenDataRedux,
  setAttendanceData as setAttendanceDataRedux,
  setSelectedChildColumns,
  updateAppState as updateAppStateRedux,
  setCurrentYmd as setCurrentYmdRedux,
  setSelectChildFilterMode as setSelectChildFilterModeRedux,
  setDatabaseType as setDatabaseTypeRedux,
  setUseAI as setUseAIRedux,
  setStaffId as setStaffIdRedux,
  setFacilityId as setFacilityIdRedux,
  setDebugFlg as setDebugFlgRedux,
  setServerConnectionState as setServerConnectionStateRedux,
} from '@/store/slices/appStateSlice'

import { loadIni as loadIniFromUtils } from '@/utils/config/iniUtils'

const AppStateContext = createContext(null)

export function AppStateProvider({ children }) {
  const dispatch = useDispatch()
  const didInitRef = useRef(false)

  const redux = useReduxBindings()

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

      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i]

        if (!cur[key]) {
          cur[key] = {}
        }

        cur = cur[key]
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

  // ===== 初期化 =====
  useEffect(() => {
    if (didInitRef.current) return
    didInitRef.current = true

    const init = async () => {
      const { ini } = await initializeAppState({
        dispatch,
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
  }, [dispatch])

  // ===== iniState → Redux反映 =====
  useEffect(() => {
    const apiSettings = iniState?.apiSettings
    if (!apiSettings) return

    const updates = {}

    if (apiSettings.staffId != null && redux.STAFF_ID !== String(apiSettings.staffId)) {
      updates.STAFF_ID = String(apiSettings.staffId)
    }

    if (
      apiSettings.facilityId != null &&
      redux.FACILITY_ID !== String(apiSettings.facilityId)
    ) {
      updates.FACILITY_ID = String(apiSettings.facilityId)
    }

    const dbType = apiSettings.databaseType ?? 'sqlite'

    if (redux.DATABASE_TYPE !== dbType) {
      updates.DATABASE_TYPE = dbType
    }

    if (apiSettings.useAI != null && redux.USE_AI !== apiSettings.useAI) {
      updates.USE_AI = apiSettings.useAI
    }

    if (apiSettings.debugFlg != null) {
      const debugFlg =
        apiSettings.debugFlg === true || apiSettings.debugFlg === 'true'

      if (redux.DEBUG_FLG !== debugFlg) {
        updates.DEBUG_FLG = debugFlg
      }
    }

    if (Object.keys(updates).length > 0) {
      dispatch(updateAppStateRedux(updates))
    }
  }, [
    iniState?.apiSettings,
    redux.STAFF_ID,
    redux.FACILITY_ID,
    redux.DATABASE_TYPE,
    redux.USE_AI,
    redux.DEBUG_FLG,
    dispatch,
  ])

  // ===== Redux wrappers =====
  const updateAppState = useCallback(
    (updates) => dispatch(updateAppStateRedux(updates)),
    [dispatch]
  )

  const setDatabaseType = useCallback(
    (databaseType) => dispatch(setDatabaseTypeRedux(databaseType)),
    [dispatch]
  )

  const setUseAI = useCallback(
    (useAI) => dispatch(setUseAIRedux(useAI)),
    [dispatch]
  )

  const setStaffId = useCallback(
    (staffId) => dispatch(setStaffIdRedux(staffId)),
    [dispatch]
  )

  const setFacilityId = useCallback(
    (facilityId) => dispatch(setFacilityIdRedux(facilityId)),
    [dispatch]
  )

  const setDebugFlg = useCallback(
    (debugFlg) => dispatch(setDebugFlgRedux(debugFlg)),
    [dispatch]
  )

  const setServerConnectionState = useCallback(
    (payload) => dispatch(setServerConnectionStateRedux(payload)),
    [dispatch]
  )

  const setCurrentDate = useCallback(
    (payload) => dispatch(setCurrentDateRedux(payload)),
    [dispatch]
  )

  const setCurrentYmd = useCallback(
    (payload) => dispatch(setCurrentYmdRedux(payload)),
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

  const setWaitingChildrenData = useCallback(
    (data) => dispatch(setWaitingChildrenDataRedux(data)),
    [dispatch]
  )

  const setExperienceChildrenData = useCallback(
    (data) => dispatch(setExperienceChildrenDataRedux(data)),
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

  const setSelectChildFilterMode = useCallback(
    (mode) => dispatch(setSelectChildFilterModeRedux(mode)),
    [dispatch]
  )

  const setIniStateDirect = useCallback((next) => {
    setIniState(next)
  }, [])

  // ===== window bridge =====
  useWindowBridge({
    isInitialized,
    appState: redux.appState,
    actions: {
      updateAppState,
      setDatabaseType,
      setUseAI,
      setStaffId,
      setFacilityId,
      setDebugFlg,
      setServerConnectionState,
      setCurrentDate,
      setCurrentYmd,
      setSelectedChild: setSelectedChildCallback,
      setChildrenData,
      setWaitingChildrenData,
      setExperienceChildrenData,
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

        updateAppState,
        setDatabaseType,
        setUseAI,
        setStaffId,
        setFacilityId,
        setDebugFlg,
        setServerConnectionState,

        setCurrentDate,
        setCurrentYmd,
        setSelectedChild: setSelectedChildCallback,
        setChildrenData,
        setWaitingChildrenData,
        setExperienceChildrenData,
        setSelectedPcName: setSelectedPcNameCallback,
        setAttendanceData,
        setSelectedChildColumns: setSelectedChildColumnsCallback,
        setSelectChildFilterMode,

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