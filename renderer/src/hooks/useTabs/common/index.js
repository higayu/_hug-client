// renderer/src/hooks/useTabs/common/index.js
// タブの共通機能をエクスポート＆クラスでまとめる
import { createWebview } from './createWebview.js'
import { createTabButton } from './createTabButton.js'
import { activateTab, activateHugViewFirstButton } from './activateTab.js'
import { closeTab } from './closeTab.js'
import { clearActiveWebviewCache } from './clearCacheTab.js'

/**
 * TabsCommon
 * - 既存の関数をひとまとめにした軽量ラッパー
 * - 既存の個別エクスポートも維持するので後方互換あり
 */
export class TabsCommon {
  createWebview(id, url) {
    return createWebview(id, url)
  }

  createTabButton(targetId, label, showClose) {
    return createTabButton(targetId, label, showClose)
  }

  activateTab(targetId) {
    return activateTab(targetId)
  }

  activateHugViewFirstButton() {
    return activateHugViewFirstButton()
  }

  closeTab(targetId) {
    return closeTab(targetId)
  }

  clearActiveWebviewCache() {
    return clearActiveWebviewCache()
  }
}

// 従来の名前付きエクスポートも残す
export {
  createWebview,
  createTabButton,
  activateTab,
  activateHugViewFirstButton,
  closeTab,
  clearActiveWebviewCache,
}
