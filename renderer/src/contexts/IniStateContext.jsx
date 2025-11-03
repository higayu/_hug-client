// src/contexts/IniStateContext.jsx
// ini.js の機能をReact Contextに移行

import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { DEFAULTS, FEATURES, MESSAGES } from '../utils/constants.js'

// デフォルトのAPP_SETTINGSとUSER_PREFERENCES
const DEFAULT_APP_SETTINGS = {
  autoLogin: {
    enabled: true,
    username: "",
    password: ""
  },
  ui: DEFAULTS.UI,
  features: FEATURES,
  window: DEFAULTS.WINDOW,
  notifications: DEFAULTS.NOTIFICATIONS
}

const DEFAULT_USER_PREFERENCES = {
  lastLoginDate: "",
  rememberWindowState: true,
  showWelcomeMessage: true
}

const IniStateContext = createContext(null)

export function IniStateProvider({ children }) {
  const [iniState, setIniState] = useState(() => ({
    // デフォルト設定
    appSettings: { ...DEFAULT_APP_SETTINGS },
    userPreferences: { ...DEFAULT_USER_PREFERENCES }
  }))

  // ini.json読み込み
  const loadIni = useCallback(async () => {
    try {
      console.log("🔄 [INI] ini.json読み込み開始")
      const result = await window.electronAPI.readIni()

      if (!result.success) {
        console.error(MESSAGES.ERROR.INI_LOAD, result.error)
        return false
      }

      const data = result.data
      console.log("🔍 [INI] 読み込んだデータ:", data)
      
      // customButtonsは除外（customButtons.jsonに統一）
      const { customButtons, ...appSettingsWithoutCustomButtons } = data.appSettings || {}
      
      // 設定をマージ（デフォルト値と組み合わせ）
      const newState = {
        appSettings: { ...DEFAULT_APP_SETTINGS, ...appSettingsWithoutCustomButtons },
        userPreferences: { ...DEFAULT_USER_PREFERENCES, ...data.userPreferences }
      }
      
      setIniState(newState)
      
      console.log("✅ [INI] ini.json読み込み成功")
      console.log(MESSAGES.SUCCESS.INI_LOADED, newState)
      return true
    } catch (err) {
      console.error(MESSAGES.ERROR.INI_LOAD, err)
      return false
    }
  }, []) // setIniStateは安定しているので依存配列に含めない

  // ini.json保存
  const saveIni = useCallback(async () => {
    try {
      // customButtonsは除外（customButtons.jsonに統一）
      const { customButtons, ...appSettingsWithoutCustomButtons } = iniState.appSettings
      
      const data = {
        version: "1.0.0",
        appSettings: appSettingsWithoutCustomButtons,
        userPreferences: iniState.userPreferences
      }

      const result = await window.electronAPI.saveIni(data)
      
      if (!result.success) {
        console.error(MESSAGES.ERROR.INI_SAVE, result.error)
        return false
      }

      console.log(MESSAGES.SUCCESS.INI_SAVED)
      return true
    } catch (err) {
      console.error(MESSAGES.ERROR.INI_SAVE, err)
      return false
    }
  }, [iniState])

  // 設定項目の更新
  const updateIniSetting = useCallback(async (path, value) => {
    try {
      const result = await window.electronAPI.updateIniSetting(path, value)
      
      if (!result.success) {
        console.error("❌ 設定更新エラー:", result.error)
        return false
      }

      // ローカルの状態も更新
      const pathArray = path.split('.')
      setIniState(prev => {
        const newState = { ...prev }
        let current = newState
        for (let i = 0; i < pathArray.length - 1; i++) {
          if (!current[pathArray[i]]) {
            current[pathArray[i]] = {}
          }
          current = current[pathArray[i]]
        }
        current[pathArray[pathArray.length - 1]] = value
        return newState
      })

      console.log(`✅ 設定更新成功: ${path} = ${JSON.stringify(value)}`)
      return true
    } catch (err) {
      console.error("❌ 設定更新中にエラー:", err)
      return false
    }
  }, [])

  // 機能の有効/無効をチェック
  const isFeatureEnabled = useCallback((featureName) => {
    return iniState.appSettings.features[featureName]?.enabled ?? false
  }, [iniState])

  // ボタンの設定を取得
  const getButtonConfig = useCallback((buttonName) => {
    return iniState.appSettings.features[buttonName] || {}
  }, [iniState])

  // UI設定を取得
  const getUISettings = useCallback(() => {
    return iniState.appSettings.ui
  }, [iniState])

  // ウィンドウ設定を取得
  const getWindowSettings = useCallback(() => {
    return iniState.appSettings.window
  }, [iniState])

  // 初期読み込み（マウント時のみ）
  useEffect(() => {
    loadIni()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // 初回のみ実行

  // グローバルAPIとして登録（modules側からの後方互換性のため）
  useEffect(() => {
    // modules側のIniStateオブジェクトと同期
    window.IniState = iniState
    // 関数も公開
    window.IniState.loadIni = loadIni
    window.IniState.saveIni = saveIni
    window.IniState.updateIniSetting = updateIniSetting
    window.IniState.isFeatureEnabled = isFeatureEnabled
    window.IniState.getButtonConfig = getButtonConfig
    window.IniState.getUISettings = getUISettings
    window.IniState.getWindowSettings = getWindowSettings

    return () => {
      delete window.IniState
    }
  }, [iniState, loadIni, saveIni, updateIniSetting, isFeatureEnabled, getButtonConfig, getUISettings, getWindowSettings])

  return (
    <IniStateContext.Provider
      value={{
        iniState,
        setIniState,
        loadIni,
        saveIni,
        updateIniSetting,
        isFeatureEnabled,
        getButtonConfig,
        getUISettings,
        getWindowSettings,
        // 後方互換性のため、IniStateとしてもアクセス可能
        IniState: iniState
      }}
    >
      {children}
    </IniStateContext.Provider>
  )
}

export function useIniState() {
  const context = useContext(IniStateContext)
  if (!context) {
    throw new Error('useIniState must be used within an IniStateProvider')
  }
  return context
}

