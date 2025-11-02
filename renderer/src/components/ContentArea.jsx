import { useEffect } from 'react'
import Sidebar from './Sidebar.jsx'

function ContentArea({ preloadPath }) {
  useEffect(() => {
    if (!preloadPath) return

    // グローバルにpreloadパスを保存
    window.preloadPath = preloadPath

    const webview = document.getElementById('hugview')
    if (webview && webview.getAttribute('preload') !== preloadPath) {
      webview.setAttribute('preload', preloadPath)
      console.log('✅ [ContentArea] 初期webviewにpreload属性を設定:', preloadPath)
    }
  }, [preloadPath])

  return (
    <div id="content">
      <div id="settings" className="open text-black">
        <Sidebar />
      </div>
      <webview
        id="hugview"
        src="https://www.hug-ayumu.link/hug/wm/"
        allowpopups="true"
        disablewebsecurity="true"
      ></webview>
    </div>
  )
}

export default ContentArea

