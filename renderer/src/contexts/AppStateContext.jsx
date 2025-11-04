// src/contexts/AppStateContext.jsx
import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import { DEFAULT_APP_STATE } from '../utils/constants.js'
import { getDateString, getTodayWeekday } from '../utils/dateUtils.js'
import { loadConfig as loadConfigFromUtils } from '../utils/configUtils.js'

const AppStateContext = createContext(null)

export function AppStateProvider({ children }) {
  const [appState, setAppState] = useState(() => {
    // 初期状態を設定
    const initialState = { ...DEFAULT_APP_STATE }
    // 日付と曜日を自動設定
    initialState.DATE_STR = getDateString()
    initialState.WEEK_DAY = getTodayWeekday()
    return initialState
  })

  // config.jsonを読み込む
  useEffect(() => {
    const loadInitialConfig = async () => {
      try {
        const configData = await loadConfigFromUtils()
        if (configData) {
          // React Contextの状態を更新
          setAppState(prev => ({ ...prev, ...configData }))
          // window.AppStateも更新（後方互換性のため）
          if (window.AppState) {
            Object.assign(window.AppState, configData)
          }
        }
      } catch (error) {
        console.error('❌ 初期設定の読み込みエラー:', error)
      }
    }
    loadInitialConfig()
  }, [])

  // 状態を更新する関数
  const updateAppState = useCallback((updates) => {
    setAppState(prev => {
      const newState = { ...prev, ...updates }
      // window.AppStateも更新（後方互換性のため）
      if (window.AppState) {
        Object.assign(window.AppState, newState)
      }
      return newState
    })
  }, [])

  // 個別の更新関数（useEffectより前に定義する必要がある）
  const setDate = useCallback((date) => {
    updateAppState({ DATE_STR: date })
  }, [updateAppState])

  const setWeekday = useCallback((weekday) => {
    updateAppState({ WEEK_DAY: weekday })
  }, [updateAppState])

  const setSelectedChild = useCallback((childId, childName) => {
    updateAppState({ SELECT_CHILD: childId, SELECT_CHILD_NAME: childName })
  }, [updateAppState])

  const setChildrenData = useCallback((data) => {
    updateAppState({ childrenData: data })
  }, [updateAppState])

  const setSelectedPcName = useCallback((pcName) => {
    updateAppState({ SELECT_PC_NAME: pcName })
  }, [updateAppState])

  const setAttendanceData = useCallback((data) => {
    updateAppState({ attendanceData: data })
  }, [updateAppState])

  // グローバルAPIとして登録（modules側からの使用のため）
  useEffect(() => {
    // window.AppStateとして状態を公開
    window.AppState = appState
    
    window.updateAppState = updateAppState
    window.setSelectedChild = setSelectedChild
    window.setChildrenData = setChildrenData
    window.setSelectedPcName = setSelectedPcName
    window.setAttendanceData = setAttendanceData
    
    return () => {
      delete window.AppState
      delete window.updateAppState
      delete window.setSelectedChild
      delete window.setChildrenData
      delete window.setSelectedPcName
      delete window.setAttendanceData
    }
  }, [appState, updateAppState, setSelectedChild, setChildrenData, setSelectedPcName, setAttendanceData])

  return (
    <AppStateContext.Provider
      value={{
        appState,
        updateAppState,
        setDate,
        setWeekday,
        setSelectedChild,
        setChildrenData,
        setSelectedPcName,
        setAttendanceData,
        // 便利なアクセサー
        DATE_STR: appState.DATE_STR,
        WEEK_DAY: appState.WEEK_DAY,
        SELECT_CHILD: appState.SELECT_CHILD,
        SELECT_CHILD_NAME: appState.SELECT_CHILD_NAME,
        SELECT_PC_NAME: appState.SELECT_PC_NAME,
        childrenData: appState.childrenData,
        waiting_childrenData: appState.waiting_childrenData,
        Experience_childrenData: appState.Experience_childrenData,
        attendanceData: appState.attendanceData,
        STAFF_ID: appState.STAFF_ID,
        FACILITY_ID: appState.FACILITY_ID
      }}
    >
      {children}
    </AppStateContext.Provider>
  )
}

export function useAppState() {
  const context = useContext(AppStateContext)
  if (!context) {
    throw new Error('useAppState must be used within an AppStateProvider')
  }
  return context
}

