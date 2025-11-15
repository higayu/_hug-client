// renderer/src/hooks/useTabs/common/closeTab.js
// タブを閉じる共通関数

import { getActiveWebview, setActiveWebview } from '@/utils/webviewState.js'

/**
 * タブを閉じる共通関数
 * @param {string} targetId - 閉じるwebviewのID
 */
export function closeTab(targetId) {
  const tabsContainer = document.getElementById('tabs')
  const content = document.getElementById('content')
  
  if (!tabsContainer || !content) return

  const webview = document.getElementById(targetId)
  const tabButton = tabsContainer.querySelector(`button[data-target="${targetId}"]`)

  if (!webview || !tabButton) return

  // デフォルトのwebviewに戻す
  if (getActiveWebview() === webview) {
    const defaultView = document.getElementById('hugview')
    if (defaultView) {
      defaultView.classList.remove('hidden')
      setActiveWebview(defaultView)
      const defaultTabBtn = tabsContainer.querySelector('button[data-target="hugview"]')
      if (defaultTabBtn) {
        defaultTabBtn.classList.add('active-tab')
      }
    }
  }

  webview.remove()
  tabButton.remove()
}
