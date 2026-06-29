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

  // =============================================================
  // 状態監視ログ
  // =============================================================
  useEffect(() => {
    console.group('[AppStateContext] render/state snapshot')
    console.log('isInitialized:', isInitialized)
    console.log('redux.DATABASE_TYPE:', redux.DATABASE_TYPE)
    console.log('redux.USE_AI:', redux.USE_AI)
    console.log('redux.STAFF_ID:', redux.STAFF_ID)
    console.log('redux.FACILITY_ID:', redux.FACILITY_ID)
    console.log('redux.DEBUG_FLG:', redux.DEBUG_FLG)
    console.log('iniState.apiSettings:', iniState?.apiSettings)
    console.log(
      'iniState.apiSettings.databaseType:',
      iniState?.apiSettings?.databaseType
    )
    console.groupEnd()
  }, [
    isInitialized,
    redux.DATABASE_TYPE,
    redux.USE_AI,
    redux.STAFF_ID,
    redux.FACILITY_ID,
    redux.DEBUG_FLG,
    iniState?.apiSettings,
  ])

  // ===== ini 操作 =====
  const loadIni = useCallback(async () => {
    console.group('[AppStateContext/loadIni] START')

    try {
      const iniData = await loadIniFromUtils()

      console.log('[AppStateContext/loadIni] 読み込んだ iniData:', iniData)
      console.log(
        '[AppStateContext/loadIni] iniData.apiSettings.databaseType:',
        iniData?.apiSettings?.databaseType
      )

      if (!iniData) {
        console.warn('[AppStateContext/loadIni] iniData が null/undefined')
        console.groupEnd()
        return null
      }

      const nextIniState = {
        appSettings: iniData.appSettings ?? {},
        userPreferences: iniData.userPreferences ?? {},
        apiSettings: iniData.apiSettings ?? {},
      }

      console.log('[AppStateContext/loadIni] setIniState する値:', nextIniState)

      setIniState(nextIniState)

      console.groupEnd()
      return iniData
    } catch (error) {
      console.error('[AppStateContext/loadIni] エラー:', error)
      console.groupEnd()
      return null
    }
  }, [])

  const saveIni = useCallback(
    async (override) => {
      console.group('[AppStateContext/saveIni] START')

      try {
        const source = override ?? iniState

        console.log('[AppStateContext/saveIni] 保存対象 source:', source)
        console.log(
          '[AppStateContext/saveIni] 保存 databaseType:',
          source?.apiSettings?.databaseType
        )

        const result = await window.electronAPI.saveIni({
          version: '1.0.0',
          appSettings: source.appSettings ?? {},
          userPreferences: source.userPreferences ?? {},
          apiSettings: source.apiSettings ?? {},
        })

        console.log('[AppStateContext/saveIni] 保存結果:', result)

        console.groupEnd()
        return result
      } catch (error) {
        console.error('[AppStateContext/saveIni] エラー:', error)
        console.groupEnd()
        return false
      }
    },
    [iniState]
  )

  const updateIniSetting = useCallback(async (path, value) => {
    console.group('[AppStateContext/updateIniSetting] START')
    console.log('path:', path)
    console.log('value:', value)

    try {
      const result = await window.electronAPI.updateIniSetting(path, value)

      console.log('[AppStateContext/updateIniSetting] IPC結果:', result)

      setIniState((prev) => {
        console.log('[AppStateContext/updateIniSetting] before iniState:', prev)

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

        console.log('[AppStateContext/updateIniSetting] after iniState:', next)
        console.log(
          '[AppStateContext/updateIniSetting] after databaseType:',
          next?.apiSettings?.databaseType
        )

        return next
      })

      console.groupEnd()
      return result
    } catch (error) {
      console.error('[AppStateContext/updateIniSetting] エラー:', error)
      console.groupEnd()
      return null
    }
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
    console.group('[AppStateContext/init useEffect]')
    console.log('didInitRef.current:', didInitRef.current)

    if (didInitRef.current) {
      console.log('初期化済みのため return')
      console.groupEnd()
      return
    }

    didInitRef.current = true

    const init = async () => {
      console.group('[AppStateContext/init] START')

      try {
        const { ini } = await initializeAppState({
          dispatch,
          setIsInitialized,
        })

        console.log('[AppStateContext/init] initializeAppState returned ini:', ini)
        console.log(
          '[AppStateContext/init] returned ini databaseType:',
          ini?.apiSettings?.databaseType
        )

        const iniData = ini ?? (await loadIniFromUtils())

        console.log('[AppStateContext/init] 最終 iniData:', iniData)
        console.log(
          '[AppStateContext/init] 最終 iniData databaseType:',
          iniData?.apiSettings?.databaseType
        )

        if (iniData) {
          const nextIniState = {
            appSettings: iniData.appSettings ?? {},
            userPreferences: iniData.userPreferences ?? {},
            apiSettings: iniData.apiSettings ?? {},
          }

          console.log('[AppStateContext/init] setIniState:', nextIniState)

          setIniState(nextIniState)
        }
      } catch (error) {
        console.error('[AppStateContext/init] エラー:', error)
      } finally {
        console.groupEnd()
      }
    }

    init()

    console.groupEnd()
  }, [dispatch])

  // ===== iniState → Redux反映 =====
  useEffect(() => {
    console.group('[AppStateContext] iniState -> Redux effect')

    const apiSettings = iniState?.apiSettings

    console.log('iniState.apiSettings:', apiSettings)
    console.log('iniState databaseType:', apiSettings?.databaseType)
    console.log('redux snapshot:', {
      DATABASE_TYPE: redux.DATABASE_TYPE,
      STAFF_ID: redux.STAFF_ID,
      FACILITY_ID: redux.FACILITY_ID,
      USE_AI: redux.USE_AI,
      DEBUG_FLG: redux.DEBUG_FLG,
    })

    if (!apiSettings) {
      console.log('apiSettings がないため return')
      console.groupEnd()
      return
    }

    const updates = {}

    if (
      apiSettings.staffId != null &&
      redux.STAFF_ID !== String(apiSettings.staffId)
    ) {
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

      console.warn(
        '[AppStateContext] DATABASE_TYPE 差分検出。iniState から Redux を更新予定:',
        {
          reduxDatabaseType: redux.DATABASE_TYPE,
          iniDatabaseType: dbType,
        }
      )
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

    console.log('[AppStateContext] updates:', updates)

    if (Object.keys(updates).length > 0) {
      console.warn(
        '[AppStateContext] iniState から Redux へ dispatch(updateAppStateRedux):',
        updates
      )

      dispatch(updateAppStateRedux(updates))
    } else {
      console.log('[AppStateContext] Redux反映なし')
    }

    console.groupEnd()
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
    (updates) => {
      console.log('[AppStateContext/updateAppState wrapper]', updates)
      dispatch(updateAppStateRedux(updates))
    },
    [dispatch]
  )

  const setDatabaseType = useCallback(
    (databaseType) => {
      console.group('[AppStateContext/setDatabaseType wrapper]')
      console.log('databaseType:', databaseType)
      console.log('before redux.DATABASE_TYPE:', redux.DATABASE_TYPE)

      dispatch(setDatabaseTypeRedux(databaseType))

      console.groupEnd()
    },
    [dispatch, redux.DATABASE_TYPE]
  )

  const setUseAI = useCallback(
    (useAI) => {
      console.log('[AppStateContext/setUseAI wrapper]', useAI)
      dispatch(setUseAIRedux(useAI))
    },
    [dispatch]
  )

  const setStaffId = useCallback(
    (staffId) => {
      console.log('[AppStateContext/setStaffId wrapper]', staffId)
      dispatch(setStaffIdRedux(staffId))
    },
    [dispatch]
  )

  const setFacilityId = useCallback(
    (facilityId) => {
      console.log('[AppStateContext/setFacilityId wrapper]', facilityId)
      dispatch(setFacilityIdRedux(facilityId))
    },
    [dispatch]
  )

  const setDebugFlg = useCallback(
    (debugFlg) => {
      console.log('[AppStateContext/setDebugFlg wrapper]', debugFlg)
      dispatch(setDebugFlgRedux(debugFlg))
    },
    [dispatch]
  )

  const setServerConnectionState = useCallback(
    (payload) => {
      console.log('[AppStateContext/setServerConnectionState wrapper]', payload)
      dispatch(setServerConnectionStateRedux(payload))
    },
    [dispatch]
  )

  const setCurrentDate = useCallback(
    (payload) => {
      console.log('[AppStateContext/setCurrentDate wrapper]', payload)
      dispatch(setCurrentDateRedux(payload))
    },
    [dispatch]
  )

  const setCurrentYmd = useCallback(
    (payload) => {
      console.log('[AppStateContext/setCurrentYmd wrapper]', payload)
      dispatch(setCurrentYmdRedux(payload))
    },
    [dispatch]
  )

  const setSelectedChildCallback = useCallback(
    (childId, childName) => {
      console.log('[AppStateContext/setSelectedChild wrapper]', {
        childId,
        childName,
      })

      dispatch(setSelectedChild({ childId, childName }))
    },
    [dispatch]
  )

  const setChildrenData = useCallback(
    (data) => {
      console.log('[AppStateContext/setChildrenData wrapper]', data)
      dispatch(setChildrenDataRedux(data))
    },
    [dispatch]
  )

  const setWaitingChildrenData = useCallback(
    (data) => {
      console.log('[AppStateContext/setWaitingChildrenData wrapper]', data)
      dispatch(setWaitingChildrenDataRedux(data))
    },
    [dispatch]
  )

  const setExperienceChildrenData = useCallback(
    (data) => {
      console.log('[AppStateContext/setExperienceChildrenData wrapper]', data)
      dispatch(setExperienceChildrenDataRedux(data))
    },
    [dispatch]
  )

  const setSelectedPcNameCallback = useCallback(
    (pcName) => {
      console.log('[AppStateContext/setSelectedPcName wrapper]', pcName)
      dispatch(setSelectedPcName(pcName))
    },
    [dispatch]
  )

  const setAttendanceData = useCallback(
    (data) => {
      console.log('[AppStateContext/setAttendanceData wrapper]', data)
      dispatch(setAttendanceDataRedux(data))
    },
    [dispatch]
  )

  const setSelectedChildColumnsCallback = useCallback(
    (columns) => {
      console.log('[AppStateContext/setSelectedChildColumns wrapper]', columns)
      dispatch(setSelectedChildColumns(columns))
    },
    [dispatch]
  )

  const setSelectChildFilterMode = useCallback(
    (mode) => {
      console.log('[AppStateContext/setSelectChildFilterMode wrapper]', mode)
      dispatch(setSelectChildFilterModeRedux(mode))
    },
    [dispatch]
  )

  const setIniStateDirect = useCallback((next) => {
    console.group('[AppStateContext/setIniStateDirect]')
    console.log('next:', next)
    console.log('next databaseType:', next?.apiSettings?.databaseType)
    console.groupEnd()

    setIniState(next)
  }, [])

  // ===== window bridge =====
  useWindowBridge({
    isInitialized,
    appState: redux.appState,
    actions: {
      updateAppState,
      loadIni,
      saveIni,
      updateIniSetting,

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

  useEffect(() => {
    console.group('[AppStateContext] useWindowBridge actions snapshot')
    console.log('isInitialized:', isInitialized)
    console.log('window.AppState:', window.AppState)
    console.log('window.loadIni exists:', typeof window.loadIni)
    console.log('window.updateAppState exists:', typeof window.updateAppState)
    console.log('window.setDatabaseType exists:', typeof window.setDatabaseType)
    console.groupEnd()
  }, [isInitialized, redux.appState])

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