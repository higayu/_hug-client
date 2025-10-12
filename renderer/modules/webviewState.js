// modules/webviewState.js
let activeWebview = null;

/**
 * 現在のアクティブwebviewを取得
 */
export function getActiveWebview() {
  if (!activeWebview) {
    const vw = document.getElementById("hugview");
    if (vw) activeWebview = vw;
  }
  return activeWebview;
}

/**
 * アクティブwebviewを更新（タブ切り替え時などに使用）
 */
export function setActiveWebview(vw) {
  activeWebview = vw;
}

/**
 * 現在のアクティブIDを取得（デバッグ用途）
 */
export function getActiveId() {
  return activeWebview ? activeWebview.id : "(none)";
}
