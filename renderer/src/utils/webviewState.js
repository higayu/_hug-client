// src/utils/webviewState.js
// WebView状態管理ユーティリティ

let activeWebview = null

/**
 * 現在のアクティブwebviewを取得
 */
export function getActiveWebview() {
  if (!activeWebview) {
    const vw = document.getElementById('hugview')
    if (vw) activeWebview = vw
  }
  return activeWebview
}

/**
 * アクティブwebviewを更新（タブ切り替え時などに使用）
 */
export function setActiveWebview(vw) {
  activeWebview = vw
  try {
    const url = typeof vw?.getURL === 'function' ? vw.getURL() : ''
    const detail = { webview: vw, url }
    document.dispatchEvent(new CustomEvent('active-webview-changed', { detail }))
  } catch (e) {
    // 例外は無視（イベント送出失敗しても致命的ではない）
  }
}

/**
 * 現在のアクティブIDを取得（デバッグ用途）
 */
export function getActiveId() {
  return activeWebview ? activeWebview.id : '(none)'
}

/**
 * WebContents ID を取得（キャッシュ削除に必須）
 */
export function getActiveWebContentsId() {
  if (!activeWebview) return null;
  if (typeof activeWebview.getWebContentsId === "function") {
    return activeWebview.getWebContentsId();
  }
  return null;
}