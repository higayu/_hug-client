// src/contexts/AppStateContext.jsx
import { createContext, useContext, useCallback, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { loadConfig as loadConfigFromUtils } from '../utils/configUtils.js'
import { loadIni as loadIniFromUtils } from '../utils/iniUtils.js'
import {
  setHugUsername,
  setHugPassword,
  setFacilityId,
  setStaffId,
  setDateStr,
  setWeekDay,
  setSelectedChild,
  setSelectedPcName,
  setChildrenData as setChildrenDataRedux,
  setWaitingChildrenData,
  setExperienceChildrenData,
  setCloseButtonsVisible,
  setStaffData,
  setFacilityData,
  setStaffAndFacilityData,
  setAttendanceData as setAttendanceDataRedux,
  setSelectedChildColumns,
  updateAppState as updateAppStateRedux,
  selectHugUsername,
  selectHugPassword,
  selectStaffId,
  selectFacilityId,
  selectDateStr,
  selectWeekDay,
  selectSelectedChild,
  selectSelectedChildName,
  selectSelectedPcName,
  selectSelectedChildColumn5,
  selectSelectedChildColumn5Html,
  selectSelectedChildColumn6,
  selectSelectedChildColumn6Html,
  selectChildrenData,
  selectWaitingChildrenData,
  selectExperienceChildrenData,
  selectCloseButtonsVisible,
  selectStaffData,
  selectFacilityData,
  selectStaffAndFacilityData,
  selectAttendanceData,
  selectAppState
} from '../store/slices/appStateSlice.js'

const AppStateContext = createContext(null)

export function AppStateProvider({ children }) {
  // Redux hooks - すべての状態をReduxから取得
  const dispatch = useDispatch()
  const appStateRedux = useSelector(selectAppState)
  
  // 個別のセレクター（後方互換性のため）
  const reduxHugUsername = useSelector(selectHugUsername)
  const reduxHugPassword = useSelector(selectHugPassword)
  const reduxStaffId = useSelector(selectStaffId)
  const reduxFacilityId = useSelector(selectFacilityId)
  const reduxDateStr = useSelector(selectDateStr)
  const reduxWeekDay = useSelector(selectWeekDay)
  const reduxSelectedChild = useSelector(selectSelectedChild)
  const reduxSelectedChildName = useSelector(selectSelectedChildName)
  const reduxSelectedPcName = useSelector(selectSelectedPcName)
  const reduxSelectedChildColumn5 = useSelector(selectSelectedChildColumn5)
  const reduxSelectedChildColumn5Html = useSelector(selectSelectedChildColumn5Html)
  const reduxSelectedChildColumn6 = useSelector(selectSelectedChildColumn6)
  const reduxSelectedChildColumn6Html = useSelector(selectSelectedChildColumn6Html)
  const reduxChildrenData = useSelector(selectChildrenData)
  const reduxWaitingChildrenData = useSelector(selectWaitingChildrenData)
  const reduxExperienceChildrenData = useSelector(selectExperienceChildrenData)
  const reduxCloseButtonsVisible = useSelector(selectCloseButtonsVisible)
  const reduxStaffData = useSelector(selectStaffData)
  const reduxFacilityData = useSelector(selectFacilityData)
  const reduxStaffAndFacilityData = useSelector(selectStaffAndFacilityData)
  const reduxAttendanceData = useSelector(selectAttendanceData)

  // config.jsonとini.jsonを読み込む
  useEffect(() => {
    const loadInitialConfig = async () => {
      try {
        // config.jsonを読み込み（HUG_USERNAME, HUG_PASSWORDなど）
        const configData = await loadConfigFromUtils()
        console.log('🧩 [AppStateContext] configData 読み込み結果:', configData)
        
        // ini.jsonを読み込み（apiSettings.staffId, apiSettings.facilityIdなど）
        const iniData = await loadIniFromUtils()
        console.log('🧩 [AppStateContext] iniData 読み込み結果:', iniData)
        
        // マージ用のオブジェクトを作成
        const mergedData = { ...(configData || {}) }
        
        // ini.jsonからapiSettingsを取得してマッピング
        // ini.jsonの値を優先（config.jsonからini.jsonに移動したため）
        if (iniData?.apiSettings) {
          const apiSettings = iniData.apiSettings
          
          // apiSettings.staffId → STAFF_ID にマッピング（複数のキー名に対応）
          // config.jsonの値が空文字列の場合は無視してini.jsonの値を優先
          const staffIdFromConfig = mergedData.STAFF_ID
          const staffIdFromIni = 
            apiSettings.staffId ?? 
            apiSettings.staff_id ?? 
            apiSettings.STAFF_ID ?? 
            null
          
          // config.jsonの値が有効（空文字列でない）場合のみ使用、それ以外はini.jsonを優先
          mergedData.STAFF_ID = (staffIdFromConfig && staffIdFromConfig !== '') 
            ? staffIdFromConfig 
            : staffIdFromIni
          
          // apiSettings.facilityId → FACILITY_ID にマッピング（複数のキー名に対応）
          const facilityIdFromConfig = mergedData.FACILITY_ID
          const facilityIdFromIni = 
            apiSettings.facilityId ?? 
            apiSettings.facility_id ?? 
            apiSettings.FACILITY_ID ?? 
            null
          
          // config.jsonの値が有効（空文字列でない）場合のみ使用、それ以外はini.jsonを優先
          mergedData.FACILITY_ID = (facilityIdFromConfig && facilityIdFromConfig !== '') 
            ? facilityIdFromConfig 
            : facilityIdFromIni
          
          console.log('🔍 [AppStateContext] マッピング結果:', {
            'configData.STAFF_ID': staffIdFromConfig,
            'configData.FACILITY_ID': facilityIdFromConfig,
            'apiSettings.staffId': apiSettings.staffId,
            'apiSettings.facilityId': apiSettings.facilityId,
            '最終的なSTAFF_ID': mergedData.STAFF_ID,
            '最終的なFACILITY_ID': mergedData.FACILITY_ID
          })
        }
        
        // すべてのフィールドをReduxに更新
        if (configData || iniData) {
          dispatch(updateAppStateRedux(mergedData))
          
          // window.AppStateも更新（後方互換性のため）
          if (window.AppState) {
            Object.assign(window.AppState, mergedData)
          }
          
          console.log('✅ [AppStateContext] 初期設定の読み込み完了:', mergedData)
        }
      } catch (error) {
        console.error('❌ 初期設定の読み込みエラー:', error)
      }
    }
    loadInitialConfig()
  }, [dispatch])

  // Reduxの状態をwindow.AppStateに同期
  useEffect(() => {
    if (window.AppState) {
      Object.assign(window.AppState, appStateRedux)
    }
  }, [appStateRedux])

  // 状態を更新する関数（すべてReduxで管理）
  const updateAppState = useCallback((updates) => {
    dispatch(updateAppStateRedux(updates))
    // window.AppStateも更新（後方互換性のため）
    if (window.AppState) {
      Object.assign(window.AppState, updates)
    }
  }, [dispatch])

  // 個別の更新関数（Reduxアクションを使用）
  const setDate = useCallback((date) => {
    dispatch(setDateStr(date))
  }, [dispatch])

  const setWeekday = useCallback((weekday) => {
    dispatch(setWeekDay(weekday))
  }, [dispatch])

  const setSelectedChildCallback = useCallback((childId, childName) => {
    dispatch(setSelectedChild({ childId, childName }))
  }, [dispatch])

  const setChildrenData = useCallback((data) => {
    dispatch(setChildrenDataRedux(data))
  }, [dispatch])

  const setSelectedPcNameCallback = useCallback((pcName) => {
    dispatch(setSelectedPcName(pcName))
  }, [dispatch])

  const setAttendanceData = useCallback((data) => {
    dispatch(setAttendanceDataRedux(data))
  }, [dispatch])

  const setSelectedChildColumnsCallback = useCallback((columns) => {
    dispatch(setSelectedChildColumns(columns))
  }, [dispatch])

  // グローバルAPIとして登録（modules側からの使用のため）
  useEffect(() => {
    // window.AppStateとして状態を公開（Reduxから取得）
    window.AppState = { ...appStateRedux }
    
    window.updateAppState = updateAppState
    window.setSelectedChild = setSelectedChildCallback
    window.setChildrenData = setChildrenData
    window.setSelectedPcName = setSelectedPcNameCallback
    window.setAttendanceData = setAttendanceData
    
    return () => {
      delete window.AppState
      delete window.updateAppState
      delete window.setSelectedChild
      delete window.setChildrenData
      delete window.setSelectedPcName
      delete window.setAttendanceData
    }
  }, [
    appStateRedux,
    updateAppState,
    setSelectedChildCallback,
    setChildrenData,
    setSelectedPcNameCallback,
    setAttendanceData
  ])

  return (
    <AppStateContext.Provider
      value={{
        appState: appStateRedux,
        updateAppState,
        setDate,
        setWeekday,
        setSelectedChild: setSelectedChildCallback,
        setChildrenData,
        setSelectedPcName: setSelectedPcNameCallback,
        setAttendanceData,
        setSelectedChildColumns: setSelectedChildColumnsCallback,
        // 便利なアクセサー（Reduxから取得）
        HUG_USERNAME: reduxHugUsername,
        HUG_PASSWORD: reduxHugPassword,
        STAFF_ID: reduxStaffId,
        FACILITY_ID: reduxFacilityId,
        DATE_STR: reduxDateStr,
        WEEK_DAY: reduxWeekDay,
        SELECT_CHILD: reduxSelectedChild,
        SELECT_CHILD_NAME: reduxSelectedChildName,
        SELECT_PC_NAME: reduxSelectedPcName,
        SELECTED_CHILD_COLUMN5: reduxSelectedChildColumn5,
        SELECTED_CHILD_COLUMN5_HTML: reduxSelectedChildColumn5Html,
        SELECTED_CHILD_COLUMN6: reduxSelectedChildColumn6,
        SELECTED_CHILD_COLUMN6_HTML: reduxSelectedChildColumn6Html,
        childrenData: reduxChildrenData,
        waiting_childrenData: reduxWaitingChildrenData,
        Experience_childrenData: reduxExperienceChildrenData,
        closeButtonsVisible: reduxCloseButtonsVisible,
        STAFF_DATA: reduxStaffData,
        FACILITY_DATA: reduxFacilityData,
        STAFF_AND_FACILITY_DATA: reduxStaffAndFacilityData,
        attendanceData: reduxAttendanceData
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

