// src/contexts/AppStateContext.jsx
import { createContext, useContext, useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { loadConfig as loadConfigFromUtils } from '../utils/configUtils.js'
import { loadIni as loadIniFromUtils } from '../utils/iniUtils.js'
import { sqliteApi } from '../sql/sqliteApi.js'
import { mariadbApi } from '../sql/mariadbApi.js'
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
  selectGeminiApiKey, // ←★追加
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
  
  // activeApiを管理（databaseTypeに基づいて設定）
  // 初期値をnullにして、設定が完了するまで待つ
  const [activeApi, setActiveApi] = useState(null)
  // ⚠️ 初期化が完了したかどうかを追跡
  const [isInitialized, setIsInitialized] = useState(false)
  
  // 個別のセレクター（後方互換性のため）
  const reduxHugUsername = useSelector(selectHugUsername)
  const reduxHugPassword = useSelector(selectHugPassword)
  const reduxGeminiApiKey = useSelector(selectGeminiApiKey) // ←★追加
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
        // config.jsonを読み込み（HUG_USERNAME, HUG_PASSWORDのみ）
        const configData = await loadConfigFromUtils()
        console.log('🧩 [AppStateContext] configData 読み込み結果:', configData)
        
        // ini.jsonを読み込み（apiSettings.staffId, apiSettings.facilityIdなど）
        const iniData = await loadIniFromUtils()
        console.log('🧩 [AppStateContext] iniData 読み込み結果:', iniData)
        
        // マージ用のオブジェクトを作成（config.jsonからはHUG_USERNAMEとHUG_PASSWORDのみ）
        const mergedData = {}
        if (configData) {
          // config.jsonからはHUG_USERNAMEとHUG_PASSWORDのみを取得
          if (configData.HUG_USERNAME !== undefined) {
            mergedData.HUG_USERNAME = configData.HUG_USERNAME
          }
          if (configData.HUG_PASSWORD !== undefined) {
            mergedData.HUG_PASSWORD = configData.HUG_PASSWORD
          }
          // // VITE_API_BASE_URLも必要に応じて取得
          // if (configData.VITE_API_BASE_URL !== undefined) {
          //   mergedData.VITE_API_BASE_URL = configData.VITE_API_BASE_URL
          // }
          if (configData.GEMINI_API_KEY !== undefined) {
            mergedData.GEMINI_API_KEY = configData.GEMINI_API_KEY
          }
        }
        
        // ini.jsonからapiSettingsを取得してマッピング
        let newActiveApi = null
        if (iniData?.apiSettings) {
          const apiSettings = iniData.apiSettings
          
          // databaseTypeに基づいてactiveApiを設定（Reduxには保存しない）
          const databaseType = apiSettings.databaseType || 'sqlite'
          newActiveApi = databaseType === 'mariadb' ? mariadbApi : sqliteApi
          console.log('🔍 [AppStateContext] activeApi設定:', { databaseType, activeApi: newActiveApi === mariadbApi ? 'mariadbApi' : 'sqliteApi' })
          
          // useAIに基づいてactiveApiを設定（Reduxには保存しない）
          const useAI = apiSettings.useAI || 'gemini'
          mergedData.USE_AI = useAI
          
          // apiSettings.staffId → STAFF_ID にマッピング（複数のキー名に対応）
          const staffIdFromIni = 
            apiSettings.staffId ?? 
            apiSettings.staff_id ?? 
            apiSettings.STAFF_ID ?? 
            null
          
          console.log('🔍 [AppStateContext] staffIdマッピング前:', {
            'apiSettings.staffId': apiSettings.staffId,
            'apiSettings.staffId型': typeof apiSettings.staffId,
            'staffIdFromIni': staffIdFromIni,
            'staffIdFromIni型': typeof staffIdFromIni
          })
          
          // ini.jsonの値を文字列として統一（数値の場合は文字列に変換）
          mergedData.STAFF_ID = staffIdFromIni != null ? String(staffIdFromIni) : ""
          
          console.log('✅ [AppStateContext] staffIdマッピング後:', {
            'mergedData.STAFF_ID': mergedData.STAFF_ID,
            'mergedData.STAFF_ID型': typeof mergedData.STAFF_ID
          })
          
          // apiSettings.facilityId → FACILITY_ID にマッピング（複数のキー名に対応）
          const facilityIdFromIni = 
            apiSettings.facilityId ?? 
            apiSettings.facility_id ?? 
            apiSettings.FACILITY_ID ?? 
            null
          
          // ini.jsonの値をそのまま使用
          mergedData.FACILITY_ID = facilityIdFromIni != null ? String(facilityIdFromIni) : ""
          
          console.log('🔍 [AppStateContext] マッピング結果:', {
            'apiSettings.staffId': apiSettings.staffId,
            'apiSettings.facilityId': apiSettings.facilityId,
            '最終的なSTAFF_ID': mergedData.STAFF_ID,
            '最終的なFACILITY_ID': mergedData.FACILITY_ID
          })
        } else {
          // ini.jsonにapiSettingsがない場合、デフォルトでsqliteApiを設定
          newActiveApi = sqliteApi
          console.log('🔍 [AppStateContext] apiSettingsなし、デフォルトでsqliteApiを設定')
        }
        
        // ⚠️ activeApiを設定（同期してから続行）
        setActiveApi(newActiveApi)
        setIsInitialized(true)
        
        // すべてのフィールドをReduxに更新
        if (configData || iniData) {
          dispatch(updateAppStateRedux(mergedData))
          
          console.log('✅ [AppStateContext] 初期設定の読み込み完了:', mergedData)
        }
      } catch (error) {
        console.error('❌ 初期設定の読み込みエラー:', error)
        // エラー時もデフォルトでsqliteApiを設定
        setActiveApi(sqliteApi)
        setIsInitialized(true)
      }
    }
    loadInitialConfig()
  }, [dispatch])

  // ⚠️ activeApiがnullの場合は、初期化が完了するまで待つ（sqliteApiをデフォルトにしない）
  // これにより、useChildrenListでactiveApiがnullの場合は処理がスキップされる

  // Reduxの状態をwindow.AppStateに同期（activeApiも含める）
  useEffect(() => {
    if (window.AppState && isInitialized) {
      //Object.assign(window.AppState, { ...appStateRedux, activeApi })
      Object.assign(window.AppState, { ...appStateRedux, activeApi })
    }
  }, [appStateRedux, activeApi, isInitialized])

  // 状態を更新する関数（すべてReduxで管理）
  const updateAppState = useCallback((updates) => {
    // activeApiが更新された場合は状態も更新（Reduxには保存しない）
    if (updates.activeApi !== undefined && updates.activeApi !== activeApi) {
      setActiveApi(updates.activeApi)
      console.log('🔄 [AppStateContext] activeApi更新:', { activeApi: updates.activeApi === mariadbApi ? 'mariadbApi' : 'sqliteApi' })
    }
    
    // activeApiを除いた更新をReduxに送信
    const { activeApi: _, ...reduxUpdates } = updates
    if (Object.keys(reduxUpdates).length > 0) {
      dispatch(updateAppStateRedux(reduxUpdates))
    }
    
    // window.AppStateも更新（後方互換性のため）
    if (window.AppState && isInitialized) {
      Object.assign(window.AppState, { ...reduxUpdates, activeApi: updates.activeApi !== undefined ? updates.activeApi : activeApi })
    }
  }, [dispatch, activeApi, isInitialized])

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
    // window.AppStateとして状態を公開（Reduxから取得、activeApiも含める）
    // ⚠️ 初期化が完了してから設定
    if (isInitialized) {
      window.AppState = { ...appStateRedux, activeApi }
      
      window.updateAppState = updateAppState
      window.setSelectedChild = setSelectedChildCallback
      window.setChildrenData = setChildrenData
      window.setSelectedPcName = setSelectedPcNameCallback
      window.setAttendanceData = setAttendanceData
    }
    
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
    activeApi,
    isInitialized,
    updateAppState,
    setSelectedChildCallback,
    setChildrenData,
    setSelectedPcNameCallback,
    setAttendanceData
  ])

  return (
    <AppStateContext.Provider
      value={{
        // ⚠️ activeApiがnullの場合はそのままnullを返す（sqliteApiをデフォルトにしない）
        appState: { ...appStateRedux, activeApi },
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
        GEMINI_API_KEY: reduxGeminiApiKey,
        STAFF_ID: reduxStaffId,
        FACILITY_ID: reduxFacilityId,
        DATE_STR: reduxDateStr,
        WEEK_DAY: reduxWeekDay,
        USE_AI: appStateRedux.USE_AI,
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

