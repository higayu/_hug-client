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
    <div 
      id="content" 
      className="relative flex-1 overflow-visible flex z-[1] min-h-0 h-full"
    >
      <div 
        id="settings" 
        className="settings-sidebar open w-0 bg-[#f8f8f8] border-r-0 p-0 flex-none h-full shadow-[2px_0_8px_rgba(0,0,0,0.1)] transition-all overflow-hidden z-50 flex flex-col text-black"
      >
        <Sidebar />
      </div>
      <webview
        id="hugview"
        src="https://www.hug-ayumu.link/hug/wm/"
        allowpopups="true"
        disablewebsecurity="true"
        preload={preloadPath}
        className="flex-1 w-full h-full min-h-0 border-none relative z-[1] overflow-hidden"
      ></webview>
    </div>
  )
}

export default ContentArea

