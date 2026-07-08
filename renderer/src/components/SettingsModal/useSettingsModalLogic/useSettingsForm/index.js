// renderer/src/components/SettingsModal/useSettingsModalLogic/useSettingsForm/index.js
import { useCallback } from 'react'
import {
  toBooleanFlag,
  toIniBooleanString,
  cloneObject,
} from '../settingsModalUtils'

export function useSettingsForm({ appState, iniState, setIniState }) {
  const populateForm = useCallback(() => {
    console.log('🔍 [SettingsModal] フォームに値を設定中...')

    const safeIniState = iniState || {}
    const appSettings = safeIniState.appSettings || {}
    const apiSettings = safeIniState.apiSettings || {}
    const features = appSettings.features || {}
    const ui = appSettings.ui || {}
    const windowSettings = appSettings.window || {}

    Object.keys(features).forEach((featureName) => {
      const checkbox = document.getElementById(`feature-${featureName}`)
      if (checkbox) {
        checkbox.checked = features[featureName].enabled === true
      }
    })

    Object.keys(features).forEach((featureName) => {
      const textInput = document.getElementById(`text-${featureName}`)
      if (textInput) {
        textInput.value = features[featureName].buttonText || ''
      }
    })

    Object.keys(features).forEach((featureName) => {
      const colorInput = document.getElementById(`color-${featureName}`)
      if (colorInput) {
        colorInput.value = features[featureName].buttonColor || '#007bff'
      }
    })

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

    const configUsername = document.getElementById('config-username')
    if (configUsername) configUsername.value = appState?.HUG_USERNAME || ''

    const configPassword = document.getElementById('config-password')
    if (configPassword) configPassword.value = appState?.HUG_PASSWORD || ''

    const configGemini = document.getElementById('config-gemini')
    if (configGemini) configGemini.value = appState?.GEMINI_API_KEY || ''

    const configGeminiModel = document.getElementById('config-gemini-model')
    if (configGeminiModel) {
      configGeminiModel.value = appState?.GEMINI_MODEL || 'gemini-3.5-flash'
    }

    const configOpenRouter = document.getElementById('config-openrouter-key')
    if (configOpenRouter) {
      configOpenRouter.value = appState?.OPEN_ROUTER_API_KEY || ''
    }

    const configOpenRouterModel = document.getElementById(
      'config-openrouter-model'
    )
    if (configOpenRouterModel) {
      configOpenRouterModel.value =
        appState?.OPEN_ROUTER_MODEL || 'openai/gpt-oss-120b:free'
    }

    const configDeepSeekMail = document.getElementById('config-deepseek-mail')
    if (configDeepSeekMail) {
      configDeepSeekMail.value = appState?.DEEPSEEK_MAIL || ''
    }

    const configDeepSeekPassword = document.getElementById(
      'config-deepseek-password'
    )
    if (configDeepSeekPassword) {
      configDeepSeekPassword.value = appState?.DEEPSEEK_PASSWORD || ''
    }

    const configOpenaiMail = document.getElementById('config-openai-mail')
    if (configOpenaiMail) {
      configOpenaiMail.value = appState?.OPENAI_MAIL || ''
    }

    const configOpenaiPassword = document.getElementById(
      'config-openai-password'
    )
    if (configOpenaiPassword) {
      configOpenaiPassword.value = appState?.OPENAI_PASSWORD || ''
    }

    const configOllamaUrl = document.getElementById('config-ollama-url')
    if (configOllamaUrl) {
      configOllamaUrl.value = appState?.OLLAMA_URL || ''
    }

    const configOllamaModel = document.getElementById('config-ollama-model')
    if (configOllamaModel) {
      configOllamaModel.value = appState?.OLLAMA_MODEL || 'llama3.1'
    }

    const apiBaseUrl = document.getElementById('api-base-url')
    if (apiBaseUrl) apiBaseUrl.value = apiSettings.baseURL || ''

    const apiStaffId = document.getElementById('api-staff-id')
    if (apiStaffId) apiStaffId.value = apiSettings.staffId || ''

    const apiFacilityId = document.getElementById('api-facility-id')
    if (apiFacilityId) apiFacilityId.value = apiSettings.facilityId || ''

    const apiDatabaseType = document.getElementById('api-database-type')
    if (apiDatabaseType) {
      apiDatabaseType.value =
        apiSettings.databaseType || appState?.DATABASE_TYPE || 'sqlite'
    }

    const apiAiType = document.getElementById('api-ai-type')
    if (apiAiType) {
      apiAiType.value = apiSettings.useAI || appState?.USE_AI || 'gemini'
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

  const updateIniStateFromForm = useCallback(() => {
    const newIniState = cloneObject(iniState)

    if (!newIniState.appSettings) newIniState.appSettings = {}
    if (!newIniState.appSettings.features) newIniState.appSettings.features = {}
    if (!newIniState.appSettings.ui) newIniState.appSettings.ui = {}
    if (!newIniState.appSettings.window) newIniState.appSettings.window = {}
    if (!newIniState.apiSettings) newIniState.apiSettings = {}

    const features = newIniState.appSettings.features

    Object.keys(features).forEach((featureName) => {
      const checkbox = document.getElementById(`feature-${featureName}`)
      if (checkbox) {
        features[featureName].enabled = checkbox.checked
      }
    })

    Object.keys(features).forEach((featureName) => {
      const textInput = document.getElementById(`text-${featureName}`)
      if (textInput) {
        features[featureName].buttonText = textInput.value
      }
    })

    Object.keys(features).forEach((featureName) => {
      const colorInput = document.getElementById(`color-${featureName}`)
      if (colorInput) {
        features[featureName].buttonColor = colorInput.value
      }
    })

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

  const togglePasswordVisibility = useCallback(
    (inputId = 'config-password', btnId = 'toggle-password') => {
      const targetInputId =
        typeof inputId === 'string' ? inputId : 'config-password'
      const targetBtnId =
        typeof btnId === 'string' ? btnId : 'toggle-password'

      const passwordInput = document.getElementById(targetInputId)
      const toggleBtn = document.getElementById(targetBtnId)

      if (!passwordInput || !toggleBtn) return

      if (passwordInput.type === 'password') {
        passwordInput.type = 'text'
        toggleBtn.textContent = '🙈'
        toggleBtn.title = 'パスワードを隠す'
      } else {
        passwordInput.type = 'password'
        toggleBtn.textContent = '👁️'
        toggleBtn.title = 'パスワードを表示'
      }
    },
    []
  )

  return {
    populateForm,
    updateIniStateFromForm,
    togglePasswordVisibility,
  }
}