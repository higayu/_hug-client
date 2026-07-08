// renderer/src/components/SettingsModal/useSettingsModalLogic/index.js
import { useEffect, useRef, useCallback } from 'react'
import { useAppState } from '@/AppStateContext'
import { useCustomButtons } from '@/components/CustomButtonsContext'
import { useToast } from '@/components/common/ToastContext.jsx'
import { useCustomButtonManager } from '@/hooks/useCustomButtonManager.js'

import { useSettingsForm } from './useSettingsForm'
import { useSettingsSave } from './useSettingsSave'
import { useApiSettingsSave } from './useApiSettingsSave'
import { useApiSelectBoxes } from './useApiSelectBoxes'
import { defaultIniState } from './settingsModalDefaults'

export function useSettingsModalLogic(isOpen) {
  const { showSuccessToast, showErrorToast } = useToast()

  const {
    appState,
    updateAppState,
    iniState,
    saveIni,
    setIniState,
  } = useAppState()

  const { saveCustomButtons: saveCustomButtonsContext } = useCustomButtons()
  const { reloadCustomButtons } = useCustomButtonManager()

  const originalSettingsRef = useRef(null)

  const {
    populateForm,
    updateIniStateFromForm,
    togglePasswordVisibility,
  } = useSettingsForm({
    appState,
    iniState,
    setIniState,
  })

  const {
    saveSettings,
    saveConfigFromForm,
    reloadConfig,
  } = useSettingsSave({
    updateIniStateFromForm,
    saveIni,
    saveCustomButtonsContext,
    reloadCustomButtons,
    updateAppState,
    populateForm,
    showSuccessToast,
    showErrorToast,
  })

  const { saveApiSettingsFromForm } = useApiSettingsSave({
    iniState,
    saveIni,
    setIniState,
    updateAppState,
    showSuccessToast,
    showErrorToast,
  })

  const { initializeApiSelectBoxes } = useApiSelectBoxes({
    iniState,
    appState,
  })

  useEffect(() => {
    if (isOpen && !originalSettingsRef.current) {
      originalSettingsRef.current = JSON.parse(JSON.stringify(iniState || {}))
      console.log('✅ [SettingsModal] 元の設定をバックアップしました')
    }

    if (!isOpen) {
      originalSettingsRef.current = null
    }
  }, [isOpen, iniState])

  const resetToOriginal = useCallback(() => {
    if (!confirm('編集前の状態に戻しますか？')) return

    if (originalSettingsRef.current) {
      setIniState(JSON.parse(JSON.stringify(originalSettingsRef.current)))

      setTimeout(() => {
        populateForm()
      }, 0)

      console.log('✅ [SettingsModal] 編集前の状態に戻しました')
    }
  }, [populateForm, setIniState])

  const resetToDefault = useCallback(async () => {
    if (
      !confirm(
        '設定をデフォルト値にリセットしますか？\nこの操作は保存しない限り反映されません。'
      )
    ) {
      return
    }

    try {
      const clonedDefaultIniState = JSON.parse(JSON.stringify(defaultIniState))

      setIniState(clonedDefaultIniState)

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
  }, [populateForm, setIniState, showSuccessToast, showErrorToast])

  const initializeSelectBoxes = useCallback(async () => {
    console.log('✅ [SettingsModal] Configセレクトボックス初期化（不要）')
  }, [])

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