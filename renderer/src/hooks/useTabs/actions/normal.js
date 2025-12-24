// renderer/src/hooks/useTabs/actions/normal.js

import { createWebview, createTabButton, activateTab, closeTab } from '../common/index.js'

export function addNormalTabAction(appState) {
  console.log('🔍 [useTabs] ＋ボタンがクリックされました')

  const tabsContainer = document.getElementById('tabs')
  const webviewContainer = document.getElementById('webview-container')

  if (!tabsContainer || !webviewContainer) {
    console.error('❌ tabs または webview-container が見つかりません')
    return
  }

  const newId = `hugview-${Date.now()}-${document.querySelectorAll('webview').length}`

  const newWebview = createWebview(
    newId,
    `https://www.hug-ayumu.link/hug/wm/attendance.php?mode=detail&f_id=${appState.FACILITY_ID}&date=${appState.CURRENT_YMD}`
  )

  webviewContainer.appendChild(newWebview)

  const index = tabsContainer.querySelectorAll("button[data-target^='hugview']").length + 1
  const tabButton = createTabButton(newId, `Hug-${index}`, appState.closeButtonsVisible)

  if (!tabButton) return

  // 追加ボタンの前に挿入
  const addTabBtn = document.getElementById('add-tab-btn')
  if (addTabBtn) tabsContainer.insertBefore(tabButton, addTabBtn)
  else tabsContainer.appendChild(tabButton)

  // --- クリックで切り替え ---
  tabButton.addEventListener('click', () => activateTab(newId))

  // --- 閉じる処理 ---
  const closeBtn = tabButton.querySelector('.close-btn')
  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation()
      if (!confirm('このタブを閉じますか？')) return
      closeTab(newId)
    })
  }

  activateTab(newId)
}
