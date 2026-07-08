import { useEffect, useState } from 'react'
import { getActiveWebview } from '@/utils/webview/webviewState.js'
import { useAppState } from '@/AppStateContext';
import { useToast } from  '@/components/common/ToastContext.jsx'

function FeaturesTab() {
  const [currentUrl, setCurrentUrl] = useState('')
  const { iniState } = useAppState()

  // URL stateの変更を監視
  useEffect(() => {
    console.log('📝 [FeaturesTab]  state', currentUrl)
  }, [currentUrl])

  useEffect(() => {
    let cleanupWebviewListeners = null

    const readUrl = async (vw) => {
      
      if (!vw) {
        console.log('⚠️ [FeaturesTab] webview is null')
        setCurrentUrl('')
        return
      }
      try {
        const maybe = vw.getURL?.()
        
        const url = typeof maybe === 'string' ? maybe : await maybe
        
        const fallback = vw.getAttribute?.('src') || ''
        
        const finalUrl = url || fallback || ''
        setCurrentUrl(finalUrl)
      } catch (e) {
        console.error('❌ [FeaturesTab] Error reading URL:', e)
        setCurrentUrl('')
      }
    }

    const attachWebviewListeners = (vw) => {
      if (!vw) {
        console.log('⚠️ [FeaturesTab] Cannot attach listeners: webview is null')
        return () => {}
      }

      const onNavigate = () => {
        console.log('🔗 [FeaturesTab] Navigation event fired, reading URL...')
        readUrl(vw)
      }
      vw.addEventListener('did-navigate', onNavigate)
      vw.addEventListener('did-navigate-in-page', onNavigate)
      vw.addEventListener('did-finish-load', onNavigate)
      vw.addEventListener('dom-ready', onNavigate)

      return () => {
        try {

          vw.removeEventListener('did-navigate', onNavigate)
          vw.removeEventListener('did-navigate-in-page', onNavigate)
          vw.removeEventListener('did-finish-load', onNavigate)
          vw.removeEventListener('dom-ready', onNavigate)
        } catch {}
      }
    }

    // 初期取得
    const initial = getActiveWebview()

    readUrl(initial)
    cleanupWebviewListeners = attachWebviewListeners(initial)

    // アクティブ変更イベント
    const onActiveChanged = (e) => {
      const vw = e?.detail?.webview || getActiveWebview()

      readUrl(vw)
      if (cleanupWebviewListeners) cleanupWebviewListeners()
      cleanupWebviewListeners = attachWebviewListeners(vw)
    }
    document.addEventListener('active-webview-changed', onActiveChanged)

    return () => {
      document.removeEventListener('active-webview-changed', onActiveChanged)
      if (cleanupWebviewListeners) cleanupWebviewListeners()
    }
  }, [])

  const handleCopy = async () => {
    try {
      if (!currentUrl) return
      await navigator.clipboard.writeText(currentUrl)
      showInfoToast('✅ URLがクリップボードにコピーされました')
    } catch (e) {
      // 失敗時は入力選択にフォールバック
      const input = document.getElementById('current-webview-url')
      if (input) {
        input.select()
        document.execCommand('copy')
      }
    }
  }

  return (
    <div>
      <h3 className="text-gray-700 text-lg mb-4 pb-2 border-b border-gray-200">機能の有効/無効</h3>
      <div className="mb-6">
        <label className="flex items-center gap-2 mb-3 py-2 cursor-pointer font-medium text-gray-700">
          <input type="checkbox" id="feature-getUrl" data-path="appSettings.features.getUrl.enabled" className="w-[18px] h-[18px] accent-blue-600" />
          <span>URL取得</span>
        </label>
      </div>


      {iniState?.appSettings?.features?.getUrl?.enabled && (
        <>
          <h3 className="text-gray-700 text-lg mb-4 pb-2 border-b border-gray-200">現在のURL</h3>
          <div className="mb-6" id="current-url-container">
            <div className="flex items-center mb-3 py-2 w-full">
              <label htmlFor="current-webview-url" className="font-medium text-gray-700 min-w-[120px]">アクティブWebViewのURL:</label>
              <input type="text" id="current-webview-url" readOnly value={currentUrl} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm flex-1" placeholder="URLを取得中..." />
              <button type="button" onClick={handleCopy} disabled={!currentUrl} className="ml-2 px-3 py-2 text-sm rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50">コピー</button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default FeaturesTab

