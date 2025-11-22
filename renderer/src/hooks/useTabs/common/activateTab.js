// renderer/src/hooks/useTabs/common/activateTab.js
// タブをアクティブにする共通関数

import { setActiveWebview } from '@/utils/webviewState.js'

/**
 * タブをアクティブにする共通関数
 * @param {string} targetId - アクティブにするwebviewのID
 */
export function activateTab(targetId) {
  const tabsContainer = document.getElementById('tabs')
  const content = document.getElementById('content')
  
  if (!tabsContainer || !content) return

  // すべてのタブからactive-tabクラスを削除
  tabsContainer.querySelectorAll('button').forEach(btn => {
    btn.classList.remove('active-tab')
  })

  // すべてのwebviewを非表示
  document.querySelectorAll('webview').forEach(v => {
    v.classList.add('hidden')
  })

  // 対象のwebviewを表示
  const targetView = document.getElementById(targetId)
  if (targetView) {
    targetView.classList.remove('hidden')
    setActiveWebview(targetView)
    
    // タブボタンにactive-tabクラスを追加
    const tabBtn = tabsContainer.querySelector(`button[data-target="${targetId}"]`)
    if (tabBtn) {
      tabBtn.classList.add('active-tab')
    }
  }
}

/**
 * id="hugview-first-button"を持つタブボタンを強制的にアクティブにする関数
 */
export function activateHugViewFirstButton() {
  const hugButton = document.getElementById('hugview-first-button')
  
  if (!hugButton) {
    console.warn('⚠️ hugview-first-button が見つかりません')
    return
  }

  // data-target属性からtargetIdを取得
  const targetId = hugButton.getAttribute('data-target')
  
  if (!targetId) {
    console.warn('⚠️ hugview-first-button に data-target 属性が見つかりません')
    return
  }

  // activateTab関数を使用してタブをアクティブにする
  activateTab(targetId)
}