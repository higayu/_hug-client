import { useEffect, useRef, useCallback } from 'react'
import { useIniState } from '../contexts/IniStateContext.jsx'
import { useCustomButtons } from '../contexts/CustomButtonsContext.jsx'
// AppState は window.AppState または useAppState() フック経由でアクセス可能
import { saveConfig } from '../utils/configUtils.js'
import { useToast } from '../contexts/ToastContext.jsx'
import { useAppState } from '../contexts/AppStateContext.jsx'
import { loadAllReload } from '../utils/reloadSettings.js'
import { updateButtonVisibility } from '../utils/buttonVisibility.js'
import { useCustomButtonManager } from './useCustomButtonManager.js'
// buttonVisibilityManager は削除されました（機能が空のため）
import { getActiveWebview } from '../utils/webviewState.js'

export function useSettingsModalLogic(isOpen) {
  const { showSuccessToast, showErrorToast } = useToast()
  const { appState, updateAppState } = useAppState()
  const { iniState, saveIni, setIniState } = useIniState()
  const { saveCustomButtons: saveCustomButtonsContext } = useCustomButtons()
  const { reloadCustomButtons } = useCustomButtonManager()
  const originalSettingsRef = useRef(null)

  // モーダルが開かれた時に元の設定をバックアップ
  useEffect(() => {
    if (isOpen && !originalSettingsRef.current) {
      originalSettingsRef.current = JSON.parse(JSON.stringify(iniState))
      console.log('✅ [SettingsModal] 元の設定をバックアップしました')
    }
  }, [isOpen, iniState])

  // フォームに値を設定
  const populateForm = useCallback(() => {
    console.log('🔍 [SettingsModal] フォームに値を設定中...')

    // 機能の有効/無効
    const features = iniState.appSettings.features
    Object.keys(features).forEach(featureName => {
      const checkbox = document.getElementById(`feature-${featureName}`)
      if (checkbox) {
        checkbox.checked = features[featureName].enabled
      }
    })

    // ボタンテキスト
    Object.keys(features).forEach(featureName => {
      const textInput = document.getElementById(`text-${featureName}`)
      if (textInput) {
        textInput.value = features[featureName].buttonText || ''
      }
    })

    // ボタンカラー
    Object.keys(features).forEach(featureName => {
      const colorInput = document.getElementById(`color-${featureName}`)
      if (colorInput) {
        colorInput.value = features[featureName].buttonColor || '#007bff'
      }
    })

    // UI設定
    const ui = iniState.appSettings.ui
    const themeSelect = document.getElementById('theme-select')
    if (themeSelect) themeSelect.value = ui.theme || 'light'

    const languageSelect = document.getElementById('language-select')
    if (languageSelect) languageSelect.value = ui.language || 'ja'

    const showCloseButtons = document.getElementById('show-close-buttons')
    if (showCloseButtons) showCloseButtons.checked = ui.showCloseButtons || false

    const autoRefresh = document.getElementById('auto-refresh')
    if (autoRefresh) autoRefresh.checked = ui.autoRefresh?.enabled || false

    const refreshInterval = document.getElementById('refresh-interval')
    if (refreshInterval) refreshInterval.value = ui.autoRefresh?.interval || 30000

    const confirmOnClose = document.getElementById('confirm-on-close')
    if (confirmOnClose) {
      confirmOnClose.checked = ui.confirmOnClose !== undefined ? ui.confirmOnClose : true
    }

    // ウィンドウ設定
    const window = iniState.appSettings.window
    const windowWidth = document.getElementById('window-width')
    if (windowWidth) windowWidth.value = window.width || 1200

    const windowHeight = document.getElementById('window-height')
    if (windowHeight) windowHeight.value = window.height || 800

    const windowMaximized = document.getElementById('window-maximized')
    if (windowMaximized) windowMaximized.checked = window.maximized || false

    const windowAlwaysOnTop = document.getElementById('window-always-on-top')
    if (windowAlwaysOnTop) windowAlwaysOnTop.checked = window.alwaysOnTop || false

    // 現在のURL表示（機能が有効な場合のみ）
    const getUrlEnabled = !!iniState?.appSettings?.features?.getUrl?.enabled
    const urlContainer = document.getElementById('current-url-container')
    if (urlContainer) urlContainer.style.display = getUrlEnabled ? 'block' : 'none'
    if (getUrlEnabled) {
      const vw = getActiveWebview()
      const url = vw && typeof vw.getURL === 'function' ? vw.getURL() : ''
      const input = document.getElementById('current-webview-url')
      if (input) input.value = url || ''
    }

    // Config.json設定
    const configUsername = document.getElementById('config-username')
    if (configUsername) configUsername.value = appState.HUG_USERNAME || ''

    const configPassword = document.getElementById('config-password')
    if (configPassword) configPassword.value = appState.HUG_PASSWORD || ''

    const configApiUrl = document.getElementById('config-api-url')
    if (configApiUrl) configApiUrl.value = appState.VITE_API_BASE_URL || ''

    const configStaffId = document.getElementById('config-staff-id')
    if (configStaffId) configStaffId.value = appState.STAFF_ID || ''

    const configFacilityId = document.getElementById('config-facility-id')
    if (configFacilityId) configFacilityId.value = appState.FACILITY_ID || ''

    console.log('✅ [SettingsModal] フォームに値を設定しました')
  }, [appState, iniState])

  // フォームの値をIniStateに反映
  const updateIniStateFromForm = useCallback(() => {
    // 新しい状態オブジェクトを作成
    const newIniState = JSON.parse(JSON.stringify(iniState)) // ディープコピー
    
    // 機能の有効/無効
    const features = newIniState.appSettings.features
    Object.keys(features).forEach(featureName => {
      const checkbox = document.getElementById(`feature-${featureName}`)
      if (checkbox) {
        features[featureName].enabled = checkbox.checked
      }
    })

    // ボタンテキスト
    Object.keys(features).forEach(featureName => {
      const textInput = document.getElementById(`text-${featureName}`)
      if (textInput) {
        features[featureName].buttonText = textInput.value
      }
    })

    // ボタンカラー
    Object.keys(features).forEach(featureName => {
      const colorInput = document.getElementById(`color-${featureName}`)
      if (colorInput) {
        features[featureName].buttonColor = colorInput.value
      }
    })

    // UI設定
    const themeSelect = document.getElementById('theme-select')
    if (themeSelect) newIniState.appSettings.ui.theme = themeSelect.value

    const languageSelect = document.getElementById('language-select')
    if (languageSelect) newIniState.appSettings.ui.language = languageSelect.value

    const showCloseButtons = document.getElementById('show-close-buttons')
    if (showCloseButtons) newIniState.appSettings.ui.showCloseButtons = showCloseButtons.checked

    const autoRefresh = document.getElementById('auto-refresh')
    if (autoRefresh) newIniState.appSettings.ui.autoRefresh.enabled = autoRefresh.checked

    const refreshInterval = document.getElementById('refresh-interval')
    if (refreshInterval) {
      newIniState.appSettings.ui.autoRefresh.interval = parseInt(refreshInterval.value)
    }

    const confirmOnClose = document.getElementById('confirm-on-close')
    if (confirmOnClose) newIniState.appSettings.ui.confirmOnClose = confirmOnClose.checked

    // ウィンドウ設定
    const windowWidth = document.getElementById('window-width')
    if (windowWidth) newIniState.appSettings.window.width = parseInt(windowWidth.value)

    const windowHeight = document.getElementById('window-height')
    if (windowHeight) newIniState.appSettings.window.height = parseInt(windowHeight.value)

    const windowMaximized = document.getElementById('window-maximized')
    if (windowMaximized) newIniState.appSettings.window.maximized = windowMaximized.checked

    const windowAlwaysOnTop = document.getElementById('window-always-on-top')
    if (windowAlwaysOnTop) newIniState.appSettings.window.alwaysOnTop = windowAlwaysOnTop.checked
    
    // 状態を更新
    setIniState(newIniState)
  }, [iniState, setIniState])

  // 設定を保存
  const saveSettings = useCallback(async () => {
    try {
      // フォームの値をIniStateに反映
      updateIniStateFromForm()

      // ini.jsonに保存
      const iniSuccess = await saveIni()

      // カスタムボタンを保存
      const customButtonsSuccess = await saveCustomButtonsContext()

      if (iniSuccess && customButtonsSuccess) {
        showSuccessToast('✅ 設定を保存しました')

        // 🔄 全設定をリロードし、UIを最新化
        try {
          const reloadOk = await loadAllReload()
          if (reloadOk) {
            updateButtonVisibility()
            await reloadCustomButtons()
          }
        } catch (e) {
          console.error('❌ 全設定リロード中にエラー:', e)
        }

        // 他UIへ設定更新を通知
        try {
          document.dispatchEvent(new CustomEvent('app-settings-updated', { detail: { IniState: iniState } }))
        } catch (e) {
          // 通知失敗は無視
        }

        return true
      } else {
        showErrorToast('❌ 設定の保存に失敗しました')
        return false
      }
    } catch (error) {
      console.error('設定保存エラー:', error)
      showErrorToast('❌ 設定の保存中にエラーが発生しました')
      return false
    }
  }, [updateIniStateFromForm, saveIni, saveCustomButtonsContext, iniState, showSuccessToast, showErrorToast])

  // 設定をリセット
  const resetSettings = useCallback(() => {
    if (confirm('設定をデフォルトにリセットしますか？')) {
      // バックアップから復元
      if (originalSettingsRef.current) {
        setIniState(JSON.parse(JSON.stringify(originalSettingsRef.current)))
        populateForm()
        console.log('✅ [SettingsModal] 設定をリセットしました')
      }
    }
  }, [populateForm, setIniState])

  // パスワード表示切替え
  const togglePasswordVisibility = useCallback(() => {
    const passwordInput = document.getElementById('config-password')
    const toggleBtn = document.getElementById('toggle-password')

    if (passwordInput && toggleBtn) {
      if (passwordInput.type === 'password') {
        passwordInput.type = 'text'
        toggleBtn.textContent = '🙈'
        toggleBtn.title = 'パスワードを隠す'
      } else {
        passwordInput.type = 'password'
        toggleBtn.textContent = '👁️'
        toggleBtn.title = 'パスワードを表示'
      }
    }
  }, [])

  // Config.jsonを保存
  const saveConfigFromForm = useCallback(async () => {
    try {
      const configData = {
        HUG_USERNAME: document.getElementById('config-username')?.value || '',
        HUG_PASSWORD: document.getElementById('config-password')?.value || '',
        VITE_API_BASE_URL: document.getElementById('config-api-url')?.value || '',
        STAFF_ID: document.getElementById('config-staff-id')?.value || '',
        FACILITY_ID: document.getElementById('config-facility-id')?.value || ''
      }

      // AppStateを更新（Context APIとwindow.AppStateの両方を更新）
      updateAppState(configData)
      if (window.AppState) {
        Object.assign(window.AppState, configData)
      }

      // ファイルに保存
      const success = await saveConfig()
      if (success) {
        showSuccessToast('✅ Config.jsonの保存が完了しました')
        return true
      } else {
        showErrorToast('❌ Config.jsonの保存に失敗しました')
        return false
      }
    } catch (error) {
      console.error('❌ Config.json保存エラー:', error)
      showErrorToast('❌ エラーが発生しました: ' + error.message)
      return false
    }
  }, [])

  // セレクトボックスを初期化
  const initializeSelectBoxes = useCallback(async () => {
    try {
      // スタッフと施設のデータを取得
      const data = await window.electronAPI.getStaffAndFacility()

      // スタッフセレクトボックスを初期化
      const staffSelect = document.getElementById('config-staff-id')
      if (staffSelect && data.staffs) {
        // 既存のオプションをクリア（最初の「選択してください」以外）
        while (staffSelect.children.length > 1) {
          staffSelect.removeChild(staffSelect.lastChild)
        }

        // スタッフデータを追加
        data.staffs.forEach(staff => {
          const option = document.createElement('option')
          option.value = staff.staff_id
          option.textContent = staff.staff_name
          staffSelect.appendChild(option)
        })

        console.log('✅ [SettingsModal] スタッフセレクトボックスを初期化しました')
      }

      // 施設セレクトボックスを初期化
      const facilitySelect = document.getElementById('config-facility-id')
      if (facilitySelect && data.facilitys) {
        // 既存のオプションをクリア（最初の「選択してください」以外）
        while (facilitySelect.children.length > 1) {
          facilitySelect.removeChild(facilitySelect.lastChild)
        }

        // 施設データを追加
        data.facilitys.forEach(facility => {
          const option = document.createElement('option')
          option.value = facility.id
          option.textContent = facility.name
          facilitySelect.appendChild(option)
        })

        console.log('✅ [SettingsModal] 施設セレクトボックスを初期化しました')
      }

      // 現在の値を設定
      if (staffSelect) staffSelect.value = appState.STAFF_ID || ''
      if (facilitySelect) facilitySelect.value = appState.FACILITY_ID || ''
    } catch (error) {
      console.error('❌ [SettingsModal] セレクトボックス初期化エラー:', error)
    }
  }, [appState])

  return {
    populateForm,
    saveSettings,
    resetSettings,
    togglePasswordVisibility,
    saveConfigFromForm,
    initializeSelectBoxes
  }
}

