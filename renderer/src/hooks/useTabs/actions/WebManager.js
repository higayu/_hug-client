// renderer/src/hooks/useTabs/actions/WebManager.js

import { createWebview, createTabButton, activateTab, closeTab } from '../common/index.js'

function getWebManagerUrl(iniState) {
  return `${iniState?.apiSettings?.baseURL}/houday/build-file/yoshijima/childkadai-table`
}

export function addWebManagerAction(appState, iniState) {
  const tabsContainer = document.getElementById('tabs')
  const webviewContainer = document.getElementById('webview-container')

  if (!tabsContainer || !webviewContainer) {
    console.error('tabs または webview-container が見つかりません')
    return
  }

  const newId = `hugview-${appState.CURRENT_YMD}-${document.querySelectorAll('webview').length}`
  const newWebview = createWebview(newId, getWebManagerUrl(iniState))

  webviewContainer.appendChild(newWebview)

  const tabButton = createTabButton(
    newId,
    'データ確認',
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

  let initialized = false

  newWebview.addEventListener('did-finish-load', () => {
    if (initialized) return
    initialized = true

    newWebview.executeJavaScript(`
    `)
  }, { once: true })

  activateTab(newId)
}

export function addWebManagerAction_OutWindow(appState, iniState) {
  const url = getWebManagerUrl(iniState)

  if (!url || url.includes('undefined')) {
    console.error('WebManager URL の生成に失敗しました', {
      baseURL: iniState?.apiSettings?.baseURL,
      currentYmd: appState?.CURRENT_YMD,
    })
    return
  }

  if (window.electronAPI?.openWebManagerPage) {
    window.electronAPI.openWebManagerPage({
      url,
      title: 'Webページ',
    })
    return
  }

  window.open(url, '_blank', 'noopener,noreferrer')
}
