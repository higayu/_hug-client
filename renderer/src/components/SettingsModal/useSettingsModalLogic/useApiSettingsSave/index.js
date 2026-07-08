// renderer/src/components/SettingsModal/useSettingsModalLogic/useApiSettingsSave/index.js
import { useCallback } from 'react'
import {
  toBooleanFlag,
  toIniBooleanString,
  cloneObject,
} from '../settingsModalUtils'

export function useApiSettingsSave({
  iniState,
  saveIni,
  setIniState,
  updateAppState,
  showSuccessToast,
  showErrorToast,
}) {
  const saveApiSettingsFromForm = useCallback(async (payload = null) => {
    let groupOpened = false

    try {
      console.group('💾 [SettingsModal] saveApiSettingsFromForm START')
      groupOpened = true
      console.log('payload:', payload)

      const newIniState = cloneObject(iniState)

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

      if (!success) {
        showErrorToast('❌ API設定の保存に失敗しました')
        return false
      }

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
      return true
    } catch (error) {
      console.error('❌ API設定保存エラー:', error)
      showErrorToast('❌ エラーが発生しました: ' + error.message)
      return false
    } finally {
      if (groupOpened) {
        console.groupEnd()
      }
    }
  }, [
    iniState,
    saveIni,
    setIniState,
    updateAppState,
    showSuccessToast,
    showErrorToast,
  ])

  return {
    saveApiSettingsFromForm,
  }
}