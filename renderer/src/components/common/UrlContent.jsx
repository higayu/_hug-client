import { useEffect, useState } from 'react'
import { getActiveWebview } from '@/utils/webviewState.js'

export default function UrlContent() {
  const [currentUrl, setCurrentUrl] = useState('')

  useEffect(() => {
    let cleanupWebviewListeners = null

    const readUrl = async (vw) => {
      if (!vw) {
        setCurrentUrl('')
        return
      }

      try {
        const maybe = vw.getURL?.()
        const url = typeof maybe === 'string' ? maybe : await maybe
        const fallback = vw.getAttribute?.('src') || ''
        setCurrentUrl(url || fallback || '')
      } catch {
        // dom-ready 前は「読まない」が正解
      }
    }

    const attachWebviewListeners = (vw) => {
      if (!vw) return () => {}

      const onNavigate = () => readUrl(vw)

      vw.addEventListener('dom-ready', onNavigate)
      vw.addEventListener('did-navigate', onNavigate)
      vw.addEventListener('did-navigate-in-page', onNavigate)
      vw.addEventListener('did-finish-load', onNavigate)

      return () => {
        vw.removeEventListener('dom-ready', onNavigate)
        vw.removeEventListener('did-navigate', onNavigate)
        vw.removeEventListener('did-navigate-in-page', onNavigate)
        vw.removeEventListener('did-finish-load', onNavigate)
      }
    }

    const initial = getActiveWebview()
    cleanupWebviewListeners = attachWebviewListeners(initial)

    const onActiveChanged = (e) => {
      const vw = e?.detail?.webview || getActiveWebview()
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
    <div className="flex items-center w-full">
      <input
        type="text"
        readOnly
        value={currentUrl}
        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
        placeholder="URLを取得中..."
      />
    </div>
  )
}
