// src/components/CustomButtonsPanel/useCustomButtonHandlers.js

import { useAppState } from '@/AppStateContext';
import { useSelector } from 'react-redux'
import { useToast } from '@/provider/ToastProvider/ToastContext'
import { getActiveWebview } from '@/utils/webview/webviewState.js'
import { loadAllReload } from '@/utils/config/reloadSettings.js'
import {
  handleAdditionCompare,
  handleCustomAction1,
  handleProfessionalSupportSearch
} from './webviewActions'

export function useCustomButtonHandlers() {
  const { appState } = useAppState()
  const facilitys = useSelector((state) => state.database.facilitys)
  const { showSuccessToast, showErrorToast } = useToast()

  const handleButtonClick = async (buttonConfig) => {
    switch (buttonConfig.action) {
      case 'individualSupportPlan':
        if (!appState.SELECT_CHILD) {
          showErrorToast('児童を選択してください')
          return
        }
        window.electronAPI?.openIndividualSupportPlan(
          appState.SELECT_CHILD,
          appState.FACILITY_ID
        )
        break
      case 'specializedSupportPlan':
        if (!appState.SELECT_CHILD) {
          showErrorToast('児童を選択してください')
          return
        }
        window.electronAPI?.openSpecializedSupportPlan(
          appState.SELECT_CHILD,
          appState.FACILITY_ID
        )
        break
      case 'importSetting': {
        const result = await window.electronAPI?.importConfigFile()
        if (!result?.success) {
          if (result?.message || result?.error) {
            showErrorToast(result.message || result.error)
          }
          return
        }
        await loadAllReload()
        showSuccessToast(`${result.fileName || '設定ファイル'}を読み込みました`)
        break
      }
      case 'getUrl': {
        const webview = getActiveWebview()
        const url = webview?.getURL?.()
        if (!url || url === 'about:blank') {
          showErrorToast('表示中のURLを取得できませんでした')
          return
        }
        await navigator.clipboard.writeText(url)
        showSuccessToast('表示中のURLをコピーしました')
        break
      }
      case 'loadIni':
        if (await loadAllReload()) {
          showSuccessToast('設定を再読み込みしました')
        } else {
          showErrorToast('設定の再読み込みに失敗しました')
        }
        break
      case 'customAction1':
        await handleCustomAction1(buttonConfig, appState)
        break
      case 'professionalSupportSearch':
        handleProfessionalSupportSearch(appState, facilitys)
        break
      case 'additionCompare':
        handleAdditionCompare(appState, facilitys)
        break
      default:
        showErrorToast(`未対応の機能です：${buttonConfig.text}`)
    }
  }

  return { handleButtonClick }
}
