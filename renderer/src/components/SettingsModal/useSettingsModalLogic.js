// renderer/src/hooks/useSettingsModalLogic.js
import { useEffect, useRef, useCallback } from 'react'
import { useAppState } from '@/AppStateContext'
import { useCustomButtons } from '@/components/common/CustomButtonsContext.jsx'
import { saveConfig } from '@/utils/config/configUtils'
import { useToast } from '@/components/common/ToastContext.jsx'
import { loadAllReload } from '@/utils/config/reloadSettings.js'
import { updateButtonVisibility } from '@/utils/app/buttonVisibility.js'
import { useCustomButtonManager } from '@/hooks/useCustomButtonManager.js'
import { getJoinedStaffFacilityData } from '@/sql/staff_facility_v/staffDispatcher.js'
import { sqliteApi } from '@/sql/sqliteApi.js'
import { mariadbApi } from '@/sql/mariadbApi.js'

const toBooleanFlag = (value, defaultValue = true) => {
  if (value === true || value === 'true') return true
  if (value === false || value === 'false') return false
  return defaultValue
}

const toIniBooleanString = (value, defaultValue = true) => {
  return String(toBooleanFlag(value, defaultValue))
}

const apiSelectLogStyle = {
  title:
    'background:#111827;color:#fff;font-size:15px;font-weight:bold;padding:4px 8px;border-radius:4px;',
  info:
    'background:#dbeafe;color:#1e3a8a;font-weight:bold;padding:2px 6px;border-radius:4px;',
  success:
    'background:#dcfce7;color:#166534;font-weight:bold;padding:2px 6px;border-radius:4px;',
  warn:
    'background:#fef3c7;color:#92400e;font-weight:bold;padding:2px 6px;border-radius:4px;',
  error:
    'background:#fee2e2;color:#991b1b;font-weight:bold;padding:2px 6px;border-radius:4px;',
}

// 設定モーダルの初期化と設定の保存
export function useSettingsModalLogic(isOpen) {
  const { showSuccessToast, showErrorToast } = useToast()

  const {
    appState,
    updateAppState,

    // ini 関連（AppStateContext から）
    iniState,
    saveIni,
    setIniState,
  } = useAppState()

  const { saveCustomButtons: saveCustomButtonsContext } = useCustomButtons()
  const { reloadCustomButtons } = useCustomButtonManager()

  const originalSettingsRef = useRef(null)

  const getApiByDatabaseType = useCallback((databaseType) => {
    return databaseType === 'mariadb' ? mariadbApi : sqliteApi
  }, [])

  // モーダルが開かれた時に元の設定をバックアップ
  useEffect(() => {
    if (isOpen && !originalSettingsRef.current) {
      originalSettingsRef.current = JSON.parse(JSON.stringify(iniState))
      console.log('✅ [SettingsModal] 元の設定をバックアップしました')
    }

    if (!isOpen) {
      originalSettingsRef.current = null
    }
  }, [isOpen, iniState])

  // フォームに値を設定
  const populateForm = useCallback(() => {
    console.log('🔍 [SettingsModal] フォームに値を設定中...')

    const safeIniState = iniState || {}
    const appSettings = safeIniState.appSettings || {}
    const apiSettings = safeIniState.apiSettings || {}
    const features = appSettings.features || {}
    const ui = appSettings.ui || {}
    const windowSettings = appSettings.window || {}

    // 機能の有効/無効
    Object.keys(features).forEach((featureName) => {
      const checkbox = document.getElementById(`feature-${featureName}`)

      if (checkbox) {
        checkbox.checked = features[featureName].enabled === true
      }
    })

    // ボタンテキスト
    Object.keys(features).forEach((featureName) => {
      const textInput = document.getElementById(`text-${featureName}`)

      if (textInput) {
        textInput.value = features[featureName].buttonText || ''
      }
    })

    // ボタンカラー
    Object.keys(features).forEach((featureName) => {
      const colorInput = document.getElementById(`color-${featureName}`)

      if (colorInput) {
        colorInput.value = features[featureName].buttonColor || '#007bff'
      }
    })

    // UI設定
    const themeSelect = document.getElementById('theme-select')
    if (themeSelect) themeSelect.value = ui.theme || 'light'

    const languageSelect = document.getElementById('language-select')
    if (languageSelect) languageSelect.value = ui.language || 'ja'

    const showCloseButtons = document.getElementById('show-close-buttons')
    if (showCloseButtons) {
      showCloseButtons.checked = ui.showCloseButtons === true
    }

    const autoRefresh = document.getElementById('auto-refresh')
    if (autoRefresh) {
      autoRefresh.checked = ui.autoRefresh?.enabled === true
    }

    const refreshInterval = document.getElementById('refresh-interval')
    if (refreshInterval) {
      refreshInterval.value = ui.autoRefresh?.interval || 30000
    }

    const confirmOnClose = document.getElementById('confirm-on-close')
    if (confirmOnClose) {
      confirmOnClose.checked =
        ui.confirmOnClose !== undefined ? ui.confirmOnClose : true
    }

    // ウィンドウ設定
    const windowWidth = document.getElementById('window-width')
    if (windowWidth) windowWidth.value = windowSettings.width || 1200

    const windowHeight = document.getElementById('window-height')
    if (windowHeight) windowHeight.value = windowSettings.height || 800

    const windowMaximized = document.getElementById('window-maximized')
    if (windowMaximized) {
      windowMaximized.checked = windowSettings.maximized === true
    }

    const windowAlwaysOnTop = document.getElementById('window-always-on-top')
    if (windowAlwaysOnTop) {
      windowAlwaysOnTop.checked = windowSettings.alwaysOnTop === true
    }

    // Config.json設定
    const configUsername = document.getElementById('config-username')
    if (configUsername) configUsername.value = appState.HUG_USERNAME || ''

    const configPassword = document.getElementById('config-password')
    if (configPassword) configPassword.value = appState.HUG_PASSWORD || ''

    const configGemini = document.getElementById('config-gemini')
    if (configGemini) configGemini.value = appState.GEMINI_API_KEY || ''

    const configGeminiModel = document.getElementById('config-gemini-model')
    if (configGeminiModel) {
      configGeminiModel.value = appState.GEMINI_MODEL || 'gemini-3.5-flash'
    }

    const configOpenRouter = document.getElementById('config-openrouter-key')
    if (configOpenRouter) {
      configOpenRouter.value = appState.OPEN_ROUTER_API_KEY || ''
    }

    const configOpenRouterModel = document.getElementById(
      'config-openrouter-model'
    )

    if (configOpenRouterModel) {
      configOpenRouterModel.value =
        appState.OPEN_ROUTER_MODEL || 'openai/gpt-oss-120b:free'
    }

    const configDeepSeekMail = document.getElementById('config-deepseek-mail')
    if (configDeepSeekMail) {
      configDeepSeekMail.value = appState.DEEPSEEK_MAIL || ''
    }

    const configDeepSeekPassword = document.getElementById(
      'config-deepseek-password'
    )

    if (configDeepSeekPassword) {
      configDeepSeekPassword.value = appState.DEEPSEEK_PASSWORD || ''
    }

    const configOpenaiMail = document.getElementById('config-openai-mail')
    if (configOpenaiMail) {
      configOpenaiMail.value = appState.OPENAI_MAIL || ''
    }

    const configOpenaiPassword = document.getElementById(
      'config-openai-password'
    )

    if (configOpenaiPassword) {
      configOpenaiPassword.value = appState.OPENAI_PASSWORD || ''
    }

    const configOllamaUrl = document.getElementById('config-ollama-url')
    if (configOllamaUrl) {
      configOllamaUrl.value = appState.OLLAMA_URL || ''
    }

    const configOllamaModel = document.getElementById('config-ollama-model')
    if (configOllamaModel) {
      configOllamaModel.value = appState.OLLAMA_MODEL || 'llama3.1'
    }

    // API設定 ini.json
    const apiBaseUrl = document.getElementById('api-base-url')
    if (apiBaseUrl) apiBaseUrl.value = apiSettings.baseURL || ''

    const apiStaffId = document.getElementById('api-staff-id')
    if (apiStaffId) apiStaffId.value = apiSettings.staffId || ''

    const apiFacilityId = document.getElementById('api-facility-id')
    if (apiFacilityId) apiFacilityId.value = apiSettings.facilityId || ''

    const apiDatabaseType = document.getElementById('api-database-type')
    if (apiDatabaseType) {
      apiDatabaseType.value =
        apiSettings.databaseType || appState.DATABASE_TYPE || 'sqlite'
    }

    const apiAiType = document.getElementById('api-ai-type')
    if (apiAiType) {
      apiAiType.value = apiSettings.useAI || appState.USE_AI || 'gemini'
      console.log('🔍 [SettingsModal] apiAiType:', apiAiType.value)
    } else {
      console.warn('⚠️ [SettingsModal] api-ai-type 要素が見つかりません')
    }

    const apiAutoSynchronization = document.getElementById(
      'api-auto-synchronization'
    )

    if (apiAutoSynchronization) {
      apiAutoSynchronization.checked = toBooleanFlag(
        apiSettings.autoSynchronization,
        true
      )
    }

    const apiAutoSwitching = document.getElementById('api-auto-switching')

    if (apiAutoSwitching) {
      apiAutoSwitching.checked = toBooleanFlag(
        apiSettings.autoSwitching,
        true
      )
    }

    console.log('✅ [SettingsModal] フォームに値を設定しました')
  }, [appState, iniState])

  // フォームの値をIniStateに反映
  const updateIniStateFromForm = useCallback(() => {
    const newIniState = JSON.parse(JSON.stringify(iniState || {}))

    if (!newIniState.appSettings) newIniState.appSettings = {}
    if (!newIniState.appSettings.features) newIniState.appSettings.features = {}
    if (!newIniState.appSettings.ui) newIniState.appSettings.ui = {}
    if (!newIniState.appSettings.window) newIniState.appSettings.window = {}
    if (!newIniState.apiSettings) newIniState.apiSettings = {}

    const features = newIniState.appSettings.features

    // 機能の有効/無効
    Object.keys(features).forEach((featureName) => {
      const checkbox = document.getElementById(`feature-${featureName}`)

      if (checkbox) {
        features[featureName].enabled = checkbox.checked
      }
    })

    // ボタンテキスト
    Object.keys(features).forEach((featureName) => {
      const textInput = document.getElementById(`text-${featureName}`)

      if (textInput) {
        features[featureName].buttonText = textInput.value
      }
    })

    // ボタンカラー
    Object.keys(features).forEach((featureName) => {
      const colorInput = document.getElementById(`color-${featureName}`)

      if (colorInput) {
        features[featureName].buttonColor = colorInput.value
      }
    })

    // UI設定
    const themeSelect = document.getElementById('theme-select')
    if (themeSelect) newIniState.appSettings.ui.theme = themeSelect.value

    const languageSelect = document.getElementById('language-select')
    if (languageSelect) {
      newIniState.appSettings.ui.language = languageSelect.value
    }

    const showCloseButtons = document.getElementById('show-close-buttons')
    if (showCloseButtons) {
      newIniState.appSettings.ui.showCloseButtons = showCloseButtons.checked
    }

    if (!newIniState.appSettings.ui.autoRefresh) {
      newIniState.appSettings.ui.autoRefresh = {}
    }

    const autoRefresh = document.getElementById('auto-refresh')
    if (autoRefresh) {
      newIniState.appSettings.ui.autoRefresh.enabled = autoRefresh.checked
    }

    const refreshInterval = document.getElementById('refresh-interval')
    if (refreshInterval) {
      newIniState.appSettings.ui.autoRefresh.interval =
        Number.parseInt(refreshInterval.value, 10) || 30000
    }

    const confirmOnClose = document.getElementById('confirm-on-close')
    if (confirmOnClose) {
      newIniState.appSettings.ui.confirmOnClose = confirmOnClose.checked
    }

    // ウィンドウ設定
    const windowWidth = document.getElementById('window-width')
    if (windowWidth) {
      newIniState.appSettings.window.width =
        Number.parseInt(windowWidth.value, 10) || 1200
    }

    const windowHeight = document.getElementById('window-height')
    if (windowHeight) {
      newIniState.appSettings.window.height =
        Number.parseInt(windowHeight.value, 10) || 800
    }

    const windowMaximized = document.getElementById('window-maximized')
    if (windowMaximized) {
      newIniState.appSettings.window.maximized = windowMaximized.checked
    }

    const windowAlwaysOnTop = document.getElementById('window-always-on-top')
    if (windowAlwaysOnTop) {
      newIniState.appSettings.window.alwaysOnTop = windowAlwaysOnTop.checked
    }

    // API設定 ini.json
    const apiBaseUrl = document.getElementById('api-base-url')
    if (apiBaseUrl) newIniState.apiSettings.baseURL = apiBaseUrl.value || ''

    const apiStaffId = document.getElementById('api-staff-id')
    if (apiStaffId) newIniState.apiSettings.staffId = apiStaffId.value || ''

    const apiFacilityId = document.getElementById('api-facility-id')
    if (apiFacilityId) {
      newIniState.apiSettings.facilityId = apiFacilityId.value || ''
    }

    const apiDatabaseType = document.getElementById('api-database-type')
    if (apiDatabaseType) {
      newIniState.apiSettings.databaseType = apiDatabaseType.value || 'sqlite'
    }

    const apiAiType = document.getElementById('api-ai-type')
    if (apiAiType) {
      newIniState.apiSettings.useAI = apiAiType.value || 'gemini'
    }

    const apiAutoSynchronization = document.getElementById(
      'api-auto-synchronization'
    )

    if (apiAutoSynchronization) {
      newIniState.apiSettings.autoSynchronization = toIniBooleanString(
        apiAutoSynchronization.checked,
        true
      )
    }

    const apiAutoSwitching = document.getElementById('api-auto-switching')

    if (apiAutoSwitching) {
      newIniState.apiSettings.autoSwitching = toIniBooleanString(
        apiAutoSwitching.checked,
        true
      )
    }

    setIniState(newIniState)

    return newIniState
  }, [iniState, setIniState])

  // 設定を保存
  const saveSettings = useCallback(async () => {
    try {
      const newState = updateIniStateFromForm()

      const iniSuccess = await saveIni(newState)
      const customButtonsSuccess = await saveCustomButtonsContext()

      if (iniSuccess && customButtonsSuccess) {
        showSuccessToast('✅ 設定を保存しました')

        try {
          const reloadOk = await loadAllReload()

          if (reloadOk) {
            updateButtonVisibility()
            await reloadCustomButtons()
          }
        } catch (error) {
          console.error('❌ 全設定リロード中にエラー:', error)
        }

        try {
          document.dispatchEvent(
            new CustomEvent('app-settings-updated', {
              detail: { IniState: newState },
            })
          )
        } catch {
          // 通知失敗は無視
        }

        return true
      }

      showErrorToast('❌ 設定の保存に失敗しました')
      return false
    } catch (error) {
      console.error('設定保存エラー:', error)
      showErrorToast('❌ 設定の保存中にエラーが発生しました')
      return false
    }
  }, [
    updateIniStateFromForm,
    saveIni,
    saveCustomButtonsContext,
    showSuccessToast,
    showErrorToast,
    reloadCustomButtons,
  ])

  // 編集前に戻す
  const resetToOriginal = useCallback(() => {
    if (confirm('編集前の状態に戻しますか？')) {
      if (originalSettingsRef.current) {
        setIniState(JSON.parse(JSON.stringify(originalSettingsRef.current)))

        setTimeout(() => {
          populateForm()
        }, 0)

        console.log('✅ [SettingsModal] 編集前の状態に戻しました')
      }
    }
  }, [populateForm, setIniState])

  // デフォルト値にリセット
  const resetToDefault = useCallback(async () => {
    if (
      confirm(
        '設定をデフォルト値にリセットしますか？\nこの操作は保存しない限り反映されません。'
      )
    ) {
      try {
        const defaultIniState = {
          version: '1.0.0',
          appSettings: {
            autoLogin: {
              enabled: true,
              username: '',
              password: '',
            },
            ui: {
              theme: 'light',
              language: 'ja',
              showCloseButtons: true,
              confirmOnClose: true,
              autoRefresh: {
                enabled: false,
                interval: 30000,
              },
            },
            features: {
              getUrl: {
                enabled: true,
                buttonText: 'URL取得',
                buttonColor: '#17a2b8',
              },
            },
            window: {
              width: 1200,
              height: 800,
              minWidth: 800,
              minHeight: 600,
              maximized: false,
              alwaysOnTop: false,
            },
            notifications: {
              enabled: true,
              sound: true,
              desktop: true,
            },
          },
          userPreferences: {
            lastLoginDate: '',
            rememberWindowState: true,
            showWelcomeMessage: true,
          },
          apiSettings: {
            baseURL: 'http://192.168.1.229',
            staffId: '',
            facilityId: '3',
            databaseType: 'mariadb',
            useAI: 'chatGPT',
            autoSynchronization: 'true',
            autoSwitching: 'true',
          },
        }

        setIniState(defaultIniState)

        setTimeout(() => {
          populateForm()
        }, 100)

        console.log('✅ [SettingsModal] デフォルト値にリセットしました')
        showSuccessToast(
          '✅ デフォルト値にリセットしました（保存ボタンを押して確定してください）'
        )
      } catch (error) {
        console.error('❌ [SettingsModal] リセットエラー:', error)
        showErrorToast('❌ リセット中にエラーが発生しました')
      }
    }
  }, [
    populateForm,
    setIniState,
    showSuccessToast,
    showErrorToast,
  ])

  // パスワード表示切替え
  const togglePasswordVisibility = useCallback(
    (inputId = 'config-password', btnId = 'toggle-password') => {
      const targetInputId =
        typeof inputId === 'string' ? inputId : 'config-password'
      const targetBtnId =
        typeof btnId === 'string' ? btnId : 'toggle-password'

      const passwordInput = document.getElementById(targetInputId)
      const toggleBtn = document.getElementById(targetBtnId)

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
    },
    []
  )

  // Config.jsonを保存
  const saveConfigFromForm = useCallback(async () => {
    try {
      const configData = {
        HUG_USERNAME: document.getElementById('config-username')?.value || '',
        HUG_PASSWORD: document.getElementById('config-password')?.value || '',
        GEMINI_API_KEY: document.getElementById('config-gemini')?.value || '',
        GEMINI_MODEL:
          document.getElementById('config-gemini-model')?.value ||
          'gemini-3.5-flash',
        OPEN_ROUTER_API_KEY:
          document.getElementById('config-openrouter-key')?.value || '',
        OPEN_ROUTER_MODEL:
          document.getElementById('config-openrouter-model')?.value || '',
        DEEPSEEK_MAIL:
          document.getElementById('config-deepseek-mail')?.value || '',
        DEEPSEEK_PASSWORD:
          document.getElementById('config-deepseek-password')?.value || '',
        OPENAI_MAIL:
          document.getElementById('config-openai-mail')?.value || '',
        OPENAI_PASSWORD:
          document.getElementById('config-openai-password')?.value || '',
        OLLAMA_URL:
          document.getElementById('config-ollama-url')?.value || '',
        OLLAMA_MODEL:
          document.getElementById('config-ollama-model')?.value ||
          'gemma4:latest',
      }

      updateAppState(configData)

      const success = await saveConfig(configData)

      if (success) {
        showSuccessToast('✅ Config.jsonの保存が完了しました')
        return true
      }

      showErrorToast('❌ Config.jsonの保存に失敗しました')
      return false
    } catch (error) {
      console.error('❌ Config.json保存エラー:', error)
      showErrorToast('❌ エラーが発生しました: ' + error.message)
      return false
    }
  }, [updateAppState, showSuccessToast, showErrorToast])

  // セレクトボックスを初期化（Config用 - 現在は使用されていない）
  const initializeSelectBoxes = useCallback(async () => {
    console.log('✅ [SettingsModal] Configセレクトボックス初期化（不要）')
  }, [])

  // API設定のセレクトボックスを初期化
  const initializeApiSelectBoxes = useCallback(async () => {
    let groupOpened = false

    const toId = (value) => String(value ?? '').trim()

    const isNotDeleted = (value) => {
      return Number(value ?? 0) !== 1
    }

    const getOptionsSnapshot = (select) => {
      if (!select) return []

      return Array.from(select.options).map((option, index) => ({
        index,
        value: option.value,
        text: option.textContent,
        selected: option.selected,
        disabled: option.disabled,
      }))
    }

    const clearSelectOptions = (select) => {
      if (!select) return

      while (select.children.length > 1) {
        select.removeChild(select.lastChild)
      }
    }

    const appendOptions = (select, items, getValue, getText) => {
      if (!select) return

      items.forEach((item) => {
        const option = document.createElement('option')
        option.value = String(getValue(item))
        option.textContent = getText(item)
        select.appendChild(option)
      })
    }

    const buildFromTables = (tables) => {
      const staffs = Array.isArray(tables?.staffs) ? tables.staffs : []
      const facilityStaff = Array.isArray(tables?.facility_staff)
        ? tables.facility_staff
        : []
      const facilitys = Array.isArray(tables?.facilitys) ? tables.facilitys : []

      console.log('%c🧾 データ確認', apiSelectLogStyle.info, {
        staffs,
        facilityStaff,
        facilitys,
      })

      // 施設セレクトは facilitys マスタをそのまま使う
      const facilityList = facilitys
        .filter((facility) => {
          return (
            facility?.id != null &&
            facility?.name &&
            isNotDeleted(facility?.is_delete)
          )
        })
        .map((facility) => ({
          id: toId(facility.id),
          name: facility.name,
          url: facility.url || '',
        }))

      const facilityById = new Map(
        facilityList.map((facility) => [facility.id, facility])
      )

      // staff ごとに facility_staff から紐づく施設IDを持たせる
      const allStaffList = staffs
        .filter((staff) => {
          return (
            toId(staff?.id) !== '-1' &&
            staff?.name &&
            isNotDeleted(staff?.is_delete)
          )
        })
        .map((staff) => {
          const facilityIdArray = facilityStaff
            .filter((fs) => toId(fs?.staff_id) === toId(staff.id))
            .map((fs) => toId(fs?.facility_id))
            .filter(Boolean)

          const uniqueFacilityIdArray = Array.from(new Set(facilityIdArray))

          const facilityNames = uniqueFacilityIdArray
            .map((facilityId) => facilityById.get(facilityId)?.name)
            .filter(Boolean)

          return {
            staff_id: toId(staff.id),
            staff_name: staff.name,
            notes: staff.notes ?? '',
            is_delete: staff.is_delete ?? 0,
            facility_ids: uniqueFacilityIdArray.join(','),
            facility_names: facilityNames.join(', '),
            facility_id_array: uniqueFacilityIdArray,
          }
        })

      return {
        source: 'databaseTables',
        allStaffList,
        facilityList,
      }
    }

    const buildFromJoinedData = (joinedData) => {
      const allStaffList = joinedData
        .filter((item) => {
          return (
            item?.staff_id != null &&
            item?.staff_name &&
            isNotDeleted(item?.is_delete)
          )
        })
        .map((item) => {
          const facilityIdArray = String(item.facility_ids ?? '')
            .split(',')
            .map((id) => id.trim())
            .filter(Boolean)

          return {
            staff_id: toId(item.staff_id),
            staff_name: item.staff_name,
            notes: item.notes ?? '',
            is_delete: item.is_delete ?? 0,
            facility_ids: facilityIdArray.join(','),
            facility_names: item.facility_names ?? '',
            facility_id_array: facilityIdArray,
          }
        })

      const facilityMap = new Map()

      allStaffList.forEach((staff) => {
        const facilityNames = String(staff.facility_names ?? '')
          .split(', ')
          .map((name) => name.trim())

        staff.facility_id_array.forEach((facilityId, index) => {
          const name = facilityNames[index] || `施設ID:${facilityId}`

          if (facilityId && !facilityMap.has(facilityId)) {
            facilityMap.set(facilityId, name)
          }
        })
      })

      const facilityList = Array.from(facilityMap.entries()).map(([id, name]) => ({
        id: toId(id),
        name,
      }))

      return {
        source: 'reduxJoinedData',
        allStaffList,
        facilityList,
      }
    }

    try {
      console.groupCollapsed(
        '%c🚀 [API SELECT INIT] initializeApiSelectBoxes START',
        apiSelectLogStyle.title
      )
      groupOpened = true

      console.log(
        '%c📌 API設定セレクトボックス初期化を開始しました',
        apiSelectLogStyle.info
      )
      console.log(
        '%c🕒 startedAt:',
        apiSelectLogStyle.info,
        new Date().toISOString()
      )

      const staffSelect = document.getElementById('api-staff-id')
      const facilitySelect = document.getElementById('api-facility-id')
      const aiSelect = document.getElementById('api-ai-type')
      const baseUrlInput = document.getElementById('api-base-url')
      const databaseTypeSelect = document.getElementById('api-database-type')
      const autoSynchronizationInput = document.getElementById(
        'api-auto-synchronization'
      )
      const autoSwitchingInput = document.getElementById('api-auto-switching')

      const selectedDatabaseType =
        iniState?.apiSettings?.databaseType ||
        appState?.DATABASE_TYPE ||
        'sqlite'

      const apiToUse = getApiByDatabaseType(selectedDatabaseType)

      console.log('%c📌 使用DB', apiSelectLogStyle.info, selectedDatabaseType)
      console.log(
        '%c📌 使用API',
        apiSelectLogStyle.info,
        selectedDatabaseType === 'mariadb' ? 'mariadbApi' : 'sqliteApi'
      )

      const joinedData = getJoinedStaffFacilityData()

      console.log(
        '%c📊 Reduxストアから取得データ',
        apiSelectLogStyle.info,
        joinedData
      )

      let builtData = {
        source: '',
        allStaffList: [],
        facilityList: [],
      }

      // 重要:
      // Reduxにデータがあっても、まずDB tablesを優先する
      // facilitys マスタ8件を使うため
      try {
        const tables = await apiToUse.getAllTables()

        console.log(
          '%c📊 データベースから取得したテーブル',
          apiSelectLogStyle.info,
          tables
        )

        if (
          tables &&
          (Array.isArray(tables.staffs) ||
            Array.isArray(tables.facility_staff) ||
            Array.isArray(tables.facilitys))
        ) {
          builtData = buildFromTables(tables)
        }
      } catch (error) {
        console.warn(
          '%c⚠️ DBからの取得に失敗したためReduxデータへフォールバックします',
          apiSelectLogStyle.warn,
          error
        )
      }

      // DBから施設・スタッフが作れなかった場合だけ Redux 結合データを使う
      if (
        (!builtData.facilityList.length || !builtData.allStaffList.length) &&
        Array.isArray(joinedData) &&
        joinedData.length > 0
      ) {
        builtData = buildFromJoinedData(joinedData)
      }

      const { source, allStaffList, facilityList } = builtData

      if (!facilityList.length && !allStaffList.length) {
        console.warn(
          '%c⚠️ スタッフ・施設データが取得できませんでした',
          apiSelectLogStyle.warn
        )

        return {
          success: false,
          reason: 'no-data',
          source,
          allStaffList,
          facilityList,
        }
      }

      console.log('%c🧱 初期化用データ source', apiSelectLogStyle.info, source)

      console.log('%c🏢 facilityList 全件', apiSelectLogStyle.success, {
        count: facilityList.length,
      })
      console.table(facilityList)

      console.log('%c👤 allStaffList 全件', apiSelectLogStyle.info, {
        count: allStaffList.length,
      })
      console.table(allStaffList)

      const getFilteredStaffList = (facilityId) => {
        const targetFacilityId = toId(facilityId)

        // 施設未選択の場合は全スタッフ表示
        // 空欄時にスタッフも空にしたい場合は、ここを return [] に変更
        if (!targetFacilityId) {
          return allStaffList
        }

        return allStaffList.filter((staff) => {
          return staff.facility_id_array.includes(targetFacilityId)
        })
      }

      const rebuildStaffSelectByFacility = (
        facilityId,
        preferredStaffId = ''
      ) => {
        if (!staffSelect) return []

        const targetFacilityId = toId(facilityId)
        const targetStaffId = toId(preferredStaffId)
        const filteredStaffList = getFilteredStaffList(targetFacilityId)

        clearSelectOptions(staffSelect)

        appendOptions(
          staffSelect,
          filteredStaffList,
          (staff) => staff.staff_id,
          (staff) => staff.staff_name
        )

        const canKeepSelectedStaff =
          targetStaffId &&
          filteredStaffList.some((staff) => staff.staff_id === targetStaffId)

        staffSelect.value = canKeepSelectedStaff ? targetStaffId : ''

        console.log(
          '%c🔎 施設に紐づくスタッフへフィルター',
          apiSelectLogStyle.success,
          {
            facilityId: targetFacilityId,
            preferredStaffId: targetStaffId,
            filteredStaffCount: filteredStaffList.length,
            staffSelectValue: staffSelect.value,
          }
        )
        console.table(filteredStaffList)

        console.log(
          '%c👤 staffSelect options after filter',
          apiSelectLogStyle.info,
          getOptionsSnapshot(staffSelect)
        )

        return filteredStaffList
      }

      const selectedStaffId = toId(iniState?.apiSettings?.staffId || '')
      const selectedFacilityId = toId(iniState?.apiSettings?.facilityId || '')
      const selectedAiType =
        iniState?.apiSettings?.useAI || appState?.USE_AI || 'gemini'
      const selectedBaseUrl = iniState?.apiSettings?.baseURL || ''
      const selectedAutoSynchronization = toBooleanFlag(
        iniState?.apiSettings?.autoSynchronization,
        true
      )
      const selectedAutoSwitching = toBooleanFlag(
        iniState?.apiSettings?.autoSwitching,
        true
      )

      // 施設セレクトは facilitys マスタ全件を表示
      if (facilitySelect) {
        clearSelectOptions(facilitySelect)

        appendOptions(
          facilitySelect,
          facilityList,
          (facility) => facility.id,
          (facility) => facility.name
        )

        facilitySelect.value = selectedFacilityId

        console.log(
          '%c✅ 施設セレクト初期化完了',
          apiSelectLogStyle.success,
          {
            facilityCount: facilityList.length,
            optionCount: facilitySelect.options.length,
            selectedFacilityId,
            selectedFacilityText:
              facilitySelect.selectedOptions?.[0]?.textContent ?? '',
          }
        )
        console.table(getOptionsSnapshot(facilitySelect))

        if (
          selectedFacilityId &&
          !Array.from(facilitySelect.options).some(
            (option) => option.value === selectedFacilityId
          )
        ) {
          console.warn(
            '%c⚠️ iniState の facilityId が施設セレクト候補に存在しません',
            apiSelectLogStyle.warn,
            {
              selectedFacilityId,
              availableValues: Array.from(facilitySelect.options).map(
                (option) => option.value
              ),
            }
          )
        }
      } else {
        console.warn(
          '%c⚠️ facilitySelect 要素が見つかりません',
          apiSelectLogStyle.warn
        )
      }

      // 初期表示時点で、選択中の施設に紐づくスタッフだけ表示
      const initialFilteredStaffList = rebuildStaffSelectByFacility(
        selectedFacilityId,
        selectedStaffId
      )

      // 施設変更時にスタッフを再フィルター
      if (facilitySelect) {
        if (facilitySelect.__apiFacilityChangeHandler) {
          facilitySelect.removeEventListener(
            'change',
            facilitySelect.__apiFacilityChangeHandler
          )
        }

        facilitySelect.__apiFacilityChangeHandler = (event) => {
          const nextFacilityId = event.target.value
          const currentStaffId = staffSelect?.value || ''

          console.log(
            '%c🏢 施設変更 → スタッフ再フィルター',
            apiSelectLogStyle.info,
            {
              nextFacilityId,
              currentStaffId,
              facilityName:
                event.target.selectedOptions?.[0]?.textContent ?? '',
            }
          )

          rebuildStaffSelectByFacility(nextFacilityId, currentStaffId)
        }

        facilitySelect.addEventListener(
          'change',
          facilitySelect.__apiFacilityChangeHandler
        )
      }

      if (aiSelect) {
        aiSelect.value = selectedAiType
      }

      if (baseUrlInput) {
        baseUrlInput.value = selectedBaseUrl
      }

      if (databaseTypeSelect) {
        databaseTypeSelect.value = selectedDatabaseType
      }

      if (autoSynchronizationInput) {
        autoSynchronizationInput.checked = selectedAutoSynchronization
      }

      if (autoSwitchingInput) {
        autoSwitchingInput.checked = selectedAutoSwitching
      }

      console.log('%c🎯 適用値', apiSelectLogStyle.info, {
        selectedStaffId,
        selectedFacilityId,
        selectedAiType,
        selectedBaseUrl,
        selectedDatabaseType,
        selectedAutoSynchronization,
        selectedAutoSwitching,
        actualStaffSelectValue: staffSelect?.value ?? '',
        actualFacilitySelectValue: facilitySelect?.value ?? '',
      })

      console.log(
        '%c🎉 [API SELECT INIT] initializeApiSelectBoxes END',
        apiSelectLogStyle.success,
        {
          source,
          allStaffCount: allStaffList.length,
          facilityCount: facilityList.length,
          initialFilteredStaffCount: initialFilteredStaffList.length,
          selectedStaffId,
          selectedFacilityId,
          actualStaffSelectValue: staffSelect?.value ?? '',
          actualFacilitySelectValue: facilitySelect?.value ?? '',
          selectedDatabaseType,
        }
      )

      return {
        success: true,
        source,
        allStaffList,
        facilityList,
        initialFilteredStaffList,
        selectedStaffId,
        selectedFacilityId,
        selectedDatabaseType,
        staffSelectOptions: getOptionsSnapshot(staffSelect),
        facilitySelectOptions: getOptionsSnapshot(facilitySelect),
      }
    } catch (error) {
      console.error(
        '%c❌ [SettingsModal] APIセレクトボックス初期化エラー',
        apiSelectLogStyle.error,
        error
      )

      return {
        success: false,
        reason: 'error',
        error,
      }
    } finally {
      if (groupOpened) {
        console.groupEnd()
      }
    }
  }, [iniState, appState, getApiByDatabaseType])

  // API設定を保存
  const saveApiSettingsFromForm = useCallback(async (payload = null) => {
    try {
      console.group('💾 [SettingsModal] saveApiSettingsFromForm START')
      console.log('payload:', payload)

      const newIniState = JSON.parse(JSON.stringify(iniState || {}))

      if (!newIniState.appSettings) {
        newIniState.appSettings = {}
      }

      if (!newIniState.userPreferences) {
        newIniState.userPreferences = {}
      }

      if (!newIniState.apiSettings) {
        newIniState.apiSettings = {}
      }

      const payloadApiSettings = payload?.apiSettings || {}

      const apiBaseUrl = document.getElementById('api-base-url')
      const apiStaffId = document.getElementById('api-staff-id')
      const apiFacilityId = document.getElementById('api-facility-id')
      const apiDatabaseType = document.getElementById('api-database-type')
      const apiAiType = document.getElementById('api-ai-type')
      const apiAutoSynchronization = document.getElementById(
        'api-auto-synchronization'
      )
      const apiAutoSwitching = document.getElementById('api-auto-switching')

      newIniState.apiSettings.baseURL =
        apiBaseUrl?.value ??
        payloadApiSettings.baseURL ??
        newIniState.apiSettings.baseURL ??
        ''

      newIniState.apiSettings.staffId =
        apiStaffId?.value ??
        payloadApiSettings.staffId ??
        newIniState.apiSettings.staffId ??
        ''

      newIniState.apiSettings.facilityId =
        apiFacilityId?.value ??
        payloadApiSettings.facilityId ??
        newIniState.apiSettings.facilityId ??
        ''

      newIniState.apiSettings.databaseType =
        apiDatabaseType?.value ??
        payloadApiSettings.databaseType ??
        newIniState.apiSettings.databaseType ??
        'sqlite'

      newIniState.apiSettings.useAI =
        apiAiType?.value ??
        payloadApiSettings.useAI ??
        newIniState.apiSettings.useAI ??
        'gemini'

      newIniState.apiSettings.autoSynchronization = toIniBooleanString(
        apiAutoSynchronization?.checked ??
          payloadApiSettings.autoSynchronization ??
          newIniState.apiSettings.autoSynchronization,
        true
      )

      newIniState.apiSettings.autoSwitching = toIniBooleanString(
        apiAutoSwitching?.checked ??
          payloadApiSettings.autoSwitching ??
          newIniState.apiSettings.autoSwitching,
        true
      )

      console.log(
        '💾 [SettingsModal] 保存する apiSettings:',
        newIniState.apiSettings
      )

      const success = await saveIni(newIniState)

      if (success) {
        setIniState(newIniState)

        const databaseType = newIniState.apiSettings.databaseType || 'sqlite'
        const useAI = newIniState.apiSettings.useAI || 'gemini'
        const staffId = newIniState.apiSettings.staffId || ''
        const facilityId = newIniState.apiSettings.facilityId || ''
        const baseURL = newIniState.apiSettings.baseURL || ''
        const autoSynchronization = toBooleanFlag(
          newIniState.apiSettings.autoSynchronization,
          true
        )
        const autoSwitching = toBooleanFlag(
          newIniState.apiSettings.autoSwitching,
          true
        )

        updateAppState({
          DATABASE_TYPE: databaseType,
          USE_AI: useAI,
          STAFF_ID: staffId,
          FACILITY_ID: facilityId,
          VITE_API_BASE_URL: baseURL,
          AUTO_SYNCHRONIZATION: autoSynchronization,
          AUTO_SWITCHING: autoSwitching,
        })

        const databaseTypeSelect = document.getElementById('api-database-type')
        if (databaseTypeSelect) {
          databaseTypeSelect.value = databaseType
        }

        if (apiAutoSynchronization) {
          apiAutoSynchronization.checked = autoSynchronization
        }

        if (apiAutoSwitching) {
          apiAutoSwitching.checked = autoSwitching
        }

        window.dispatchEvent(
          new CustomEvent('database-type-changed', {
            detail: {
              databaseType,
              autoSynchronization,
              autoSwitching,
              message: `API設定保存により ${databaseType} に切り替えました`,
              checkedAt: new Date().toISOString(),
              source: 'useSettingsModalLogic.saveApiSettingsFromForm',
            },
          })
        )

        document.dispatchEvent(
          new CustomEvent('app-settings-updated', {
            detail: {
              IniState: newIniState,
              apiSettings: newIniState.apiSettings,
            },
          })
        )

        console.log('🔄 [useSettingsModalLogic] DATABASE_TYPE 更新:', {
          databaseType,
        })
        console.log('🔄 [useSettingsModalLogic] USE_AI 更新:', { useAI })
        console.log('🔄 [useSettingsModalLogic] AUTO_SYNCHRONIZATION 更新:', {
          autoSynchronization,
        })
        console.log('🔄 [useSettingsModalLogic] AUTO_SWITCHING 更新:', {
          autoSwitching,
        })

        showSuccessToast('✅ API設定の保存が完了しました')
        console.groupEnd()
        return true
      }

      showErrorToast('❌ API設定の保存に失敗しました')
      console.groupEnd()
      return false
    } catch (error) {
      console.error('❌ API設定保存エラー:', error)
      showErrorToast('❌ エラーが発生しました: ' + error.message)
      console.groupEnd()
      return false
    }
  }, [
    iniState,
    saveIni,
    setIniState,
    updateAppState,
    showSuccessToast,
    showErrorToast,
  ])

  // Config.jsonを再読み込みする
  const reloadConfig = useCallback(async () => {
    try {
      const success = await loadAllReload()

      if (success) {
        populateForm()
        showSuccessToast('✅ Config.jsonを再読み込みしました')
        return true
      }

      return false
    } catch (error) {
      console.error('❌ Config.json再読み込みエラー:', error)
      showErrorToast('❌ Config.json再読み込み中にエラーが発生しました')
      return false
    }
  }, [populateForm, showSuccessToast, showErrorToast])

  return {
    populateForm,
    saveSettings,
    resetToOriginal,
    resetToDefault,
    togglePasswordVisibility,
    saveConfigFromForm,
    initializeSelectBoxes,
    saveApiSettingsFromForm,
    initializeApiSelectBoxes,
    reloadConfig,
  }
}