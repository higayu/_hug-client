import { useEffect, useState } from 'react'
import { useIniState } from '../contexts/IniStateContext.jsx'
import { useCustomButtons } from '../contexts/CustomButtonsContext.jsx'
import { loadConfig } from '../utils/configUtils.js'

export function useSettingsModal(isOpen) {
  const [isLoading, setIsLoading] = useState(false)
  const { loadIni } = useIniState()
  const { loadCustomButtons, loadAvailableActions } = useCustomButtons()

  // モーダルが開かれた時に設定を再読み込み
  useEffect(() => {
    if (!isOpen) return

    const loadSettings = async () => {
      setIsLoading(true)
      try {
        console.log('🔄 [useSettingsModal] 設定を再読み込み中...')
        await loadIni()
        await loadConfig()
        await loadCustomButtons()
        await loadAvailableActions()
        console.log('✅ [useSettingsModal] 設定の再読み込み完了')
      } catch (error) {
        console.error('❌ [useSettingsModal] 設定の再読み込みエラー:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadSettings()
  }, [isOpen, loadIni, loadCustomButtons, loadAvailableActions])

  return { isLoading }
}

