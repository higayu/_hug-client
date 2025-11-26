// renderer/src/hooks/useTabs/actions/WebManager.js

import { createWebview, createTabButton, activateTab, closeTab } from '../common/index.js'

// ★ iniState を引数で受け取るように変更
export function addWebManagerAction(appState, iniState) {

  const tabsContainer = document.getElementById('tabs')
  const webviewContainer = document.getElementById('webview-container')

  if (!tabsContainer || !webviewContainer) {
    console.error('❌ tabs または webview-container が見つかりません')
    return
  }

  const newId = `hugview-${appState.DATE_STR}-${document.querySelectorAll('webview').length}`

  // ★ Hook をここで使わないので、iniState は外から渡された値を使う
  const newWebview = createWebview(
    newId,
    `${iniState?.apiSettings?.baseURL}/houday/build-file/`
  )

  webviewContainer.appendChild(newWebview)

  const tabButton = createTabButton(
    newId,
    `データ管理`,
    appState.closeButtonsVisible
  )

  if (!tabButton) return

  tabsContainer.appendChild(tabButton)

  tabButton.addEventListener('click', () => activateTab(newId))

  const closeBtn = tabButton.querySelector('.close-btn')
  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation()
      if (!confirm('このタブを閉じますか？')) return
      closeTab(newId)
    })
  }

  // --- 初回ロード処理 ---
  let initialized = false

  newWebview.addEventListener('did-finish-load', () => {
    if (initialized) return
    initialized = true

    // 日付を日本語へ変換
    const parts = appState.DATE_STR.split('-')
    const jpDate = `${parts[0]}年${parseInt(parts[1])}月${parseInt(parts[2])}日`

    const parseTime = (s) => {
      if (!s) return null
      const m = s.match(/^(\d{2}):(\d{2})$/)
      return m ? { h: String(parseInt(m[1])), m: String(parseInt(m[2])) } : null
    }

    const st = parseTime(appState.SELECTED_CHILD_COLUMN5)
    const et = parseTime(appState.SELECTED_CHILD_COLUMN6)

    newWebview.executeJavaScript(`
    `)
  }, { once: true })

  activateTab(newId)
}
