import { useEffect, useState } from 'react'
import { getActiveWebview } from '@/utils/webviewState.js'
import CopyButton from "./CopyButton"

export default function UrlContent() {
  const [currentUrl, setCurrentUrl] = useState('')

  useEffect(() => {
    let cleanupWebviewListeners = null

    const readUrl = async (vw) => {
      console.log('🔍 [UrlContent] readUrl', {
        webview: vw ? vw.id : 'null',
        hasGetURL: !!vw?.getURL
      })

      if (!vw) {
        setCurrentUrl('')
        return
      }

      try {
        const maybe = vw.getURL?.()
        const url = typeof maybe === 'string' ? maybe : await maybe
        const fallback = vw.getAttribute?.('src') || ''
        const finalUrl = url || fallback || ''

        console.log('✅ [UrlContent] final URL:', finalUrl)
        setCurrentUrl(finalUrl)
      } catch (e) {
        console.error('❌ [UrlContent] getURL error:', e)
        setCurrentUrl('')
      }
    }

    const attachWebviewListeners = (vw) => {
      if (!vw) return () => {}

      console.log('🔗 [UrlContent] attach listeners:', vw.id)

      const onNavigate = () => readUrl(vw)

      vw.addEventListener('dom-ready', onNavigate)
      vw.addEventListener('did-navigate', onNavigate)
      vw.addEventListener('did-navigate-in-page', onNavigate)
      vw.addEventListener('did-finish-load', onNavigate)

      return () => {
        try {
          console.log('🧹 [UrlContent] cleanup listeners:', vw.id)
          vw.removeEventListener('dom-ready', onNavigate)
          vw.removeEventListener('did-navigate', onNavigate)
          vw.removeEventListener('did-navigate-in-page', onNavigate)
          vw.removeEventListener('did-finish-load', onNavigate)
        } catch {}
      }
    }

    // 初期 webview
    const initial = getActiveWebview()
    console.log('🚀 [UrlContent] initial webview:', initial?.id)

    readUrl(initial)
    cleanupWebviewListeners = attachWebviewListeners(initial)

    // active webview 切り替え
    const onActiveChanged = (e) => {
      console.log('🔄 [UrlContent] active-webview-changed:', e?.detail)
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

  return (
    <div className="flex items-center  w-full">
      <input
        type="text"
        readOnly
        value={currentUrl}
        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm flex-1"
        placeholder="URLを取得中..."
      />
      {/* <CopyButton text={currentUrl} /> */}
    </div>
  )
}
