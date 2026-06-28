import { useEffect, useState } from 'react'
import { getActiveWebview } from '@/utils/webview/webviewState.js'
//import { useIniState } from '@/contexts/IniStateContext.jsx'
//import { useAppState } from '@/contexts/AppStateContext.jsx'
import { useAppState } from '@/contexts/appState'
import { useToast } from  '@/components/common/ToastContext.jsx'

function FeaturesTab() {
  const [currentUrl, setCurrentUrl] = useState('')
  const { iniState } = useAppState()

  // URL stateの変更を監視
  useEffect(() => {
    console.log('📝 [FeaturesTab] currentUrl state updated:', currentUrl)
  }, [currentUrl])

  useEffect(() => {
    let cleanupWebviewListeners = null

    const readUrl = async (vw) => {
      console.log('🔍 [FeaturesTab] readUrl called', { 
        webview: vw ? vw.id : 'null',
        webviewElement: vw,
        hasGetURL: !!vw?.getURL
      })
      
      if (!vw) {
        console.log('⚠️ [FeaturesTab] webview is null')
        setCurrentUrl('')
        return
      }
      try {
        console.log('📡 [FeaturesTab] Calling getURL()...')
        const maybe = vw.getURL?.()
        console.log('📡 [FeaturesTab] getURL() result:', { maybe, type: typeof maybe })
        
        const url = typeof maybe === 'string' ? maybe : await maybe
        console.log('📡 [FeaturesTab] Resolved URL:', url)
        
        const fallback = vw.getAttribute?.('src') || ''
        console.log('📡 [FeaturesTab] Fallback src attribute:', fallback)
        
        const finalUrl = url || fallback || ''
        console.log('✅ [FeaturesTab] Final URL to set:', finalUrl)
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
      console.log('🔗 [FeaturesTab] Attaching listeners to webview:', vw.id)
      const onNavigate = () => {
        console.log('🔗 [FeaturesTab] Navigation event fired, reading URL...')
        readUrl(vw)
      }
      vw.addEventListener('did-navigate', onNavigate)
      vw.addEventListener('did-navigate-in-page', onNavigate)
      vw.addEventListener('did-finish-load', onNavigate)
      vw.addEventListener('dom-ready', onNavigate)
      console.log('✅ [FeaturesTab] Listeners attached to webview:', vw.id)
      return () => {
        try {
          console.log('🧹 [FeaturesTab] Removing listeners from webview:', vw.id)
          vw.removeEventListener('did-navigate', onNavigate)
          vw.removeEventListener('did-navigate-in-page', onNavigate)
          vw.removeEventListener('did-finish-load', onNavigate)
          vw.removeEventListener('dom-ready', onNavigate)
        } catch {}
      }
    }

    // 初期取得
    console.log('🚀 [FeaturesTab] Initializing URL reading...')
    const initial = getActiveWebview()
    console.log('🚀 [FeaturesTab] Initial webview:', { 
      webview: initial ? initial.id : 'null',
      hasGetURL: !!initial?.getURL 
    })
    readUrl(initial)
    cleanupWebviewListeners = attachWebviewListeners(initial)
    console.log('🚀 [FeaturesTab] Event listeners attached to initial webview')

    // アクティブ変更イベント
    const onActiveChanged = (e) => {
      console.log('🔄 [FeaturesTab] Active webview changed event:', e?.detail)
      const vw = e?.detail?.webview || getActiveWebview()
      console.log('🔄 [FeaturesTab] New active webview:', { 
        webview: vw ? vw.id : 'null',
        hasGetURL: !!vw?.getURL 
      })
      readUrl(vw)
      if (cleanupWebviewListeners) cleanupWebviewListeners()
      cleanupWebviewListeners = attachWebviewListeners(vw)
      console.log('🔄 [FeaturesTab] Event listeners attached to new active webview')
    }
    document.addEventListener('active-webview-changed', onActiveChanged)
    console.log('🚀 [FeaturesTab] Active webview changed event listener registered')

    return () => {
      document.removeEventListener('active-webview-changed', onActiveChanged)
      if (cleanupWebviewListeners) cleanupWebviewListeners()
    }
  }, [])

  const handleCopy = async () => {
    try {
      console.log('🔍 [FeaturesTab] コピーボタンがクリックされました', { currentUrl })
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

