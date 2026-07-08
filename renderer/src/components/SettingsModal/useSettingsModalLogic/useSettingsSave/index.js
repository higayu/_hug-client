// renderer/src/components/SettingsModal/useSettingsModalLogic/useSettingsSave/index.js
import { useCallback } from 'react'
import { saveConfig } from '@/utils/config/configUtils'
import { loadAllReload } from '@/utils/config/reloadSettings.js'
import { updateButtonVisibility } from '@/utils/app/buttonVisibility.js'
import { toBooleanFlag } from '../settingsModalUtils'

export function useSettingsSave({
  updateIniStateFromForm,
  saveIni,
  saveCustomButtonsContext,
  reloadCustomButtons,
  updateAppState,
  populateForm,
  showSuccessToast,
  showErrorToast,
}) {
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

        try {
          const apiSettings = newState?.apiSettings ?? {}

          const databaseType =
            apiSettings.databaseType === 'mariadb' ||
            apiSettings.databaseType === 'sqlite'
              ? apiSettings.databaseType
              : 'sqlite'

          const autoSynchronization = toBooleanFlag(
            apiSettings.autoSynchronization,
            true
          )

          const autoSwitching = toBooleanFlag(
            apiSettings.autoSwitching,
            true
          )

          console.log('[SettingsModal/saveSettings] database-type-changed dispatch', {
            databaseType,
            autoSynchronization,
            autoSwitching,
            apiSettings,
          })

          window.dispatchEvent(
            new CustomEvent('database-type-changed', {
              detail: {
                databaseType,
                autoSynchronization,
                autoSwitching,
                message: `設定保存により ${databaseType} でデータベースを再取得します`,
                checkedAt: new Date().toISOString(),
                source: 'useSettingsModalLogic.saveSettings',
              },
            })
          )
        } catch (error) {
          console.warn(
            '⚠️ [SettingsModal/saveSettings] database-type-changed 発火に失敗:',
            error
          )
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
    saveSettings,
    saveConfigFromForm,
    reloadConfig,
  }
}