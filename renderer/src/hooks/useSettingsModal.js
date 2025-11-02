import { useEffect, useState, useCallback } from 'react'
import { loadIni } from '../../modules/config/ini.js'
import { loadConfig } from '../../modules/config/config.js'
import { loadCustomButtons, loadAvailableActions } from '../../modules/config/customButtons.js'

export function useSettingsModal(isOpen) {
  const [isLoading, setIsLoading] = useState(false)

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
  }, [isOpen])

  return { isLoading }
}

