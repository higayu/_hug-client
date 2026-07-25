// renderer/src/hooks/useTabs/common/restoreFocusAfterWebviewAction.js
//
// webviewタブの切り替え・close操作のあと、
// フォーカスがrenderer側（メモ欄など）に戻らなくなる問題への対策。
//
// DeepseekTabButton / OpenAiTabButton にだけ入っていた
// restoreRendererFocus 相当の処理を、
// activateTab / closeTab など「通常タブ」の経路からも
// 呼び出せるように共通化したもの。
//
// 使い方:
//   import { restoreFocusAfterWebviewAction } from "@/hooks/useTabs/common/restoreFocusAfterWebviewAction.js"
//   restoreFocusAfterWebviewAction()
//
// activateTab.js / closeTab.js の処理の最後で呼ぶ。

/**
 * 現在フォーカス可能なメモ欄(textarea)を探して明示的にフォーカスする。
 * すでに他の入力要素を操作中の場合は奪わない。
 */
function focusFirstAvailableTextarea() {
  const activeElement = document.activeElement

  const isAlreadyEditingSomethingElse =
    activeElement &&
    activeElement !== document.body &&
    (
      activeElement instanceof HTMLInputElement ||
      activeElement instanceof HTMLTextAreaElement ||
      activeElement instanceof HTMLSelectElement ||
      activeElement.isContentEditable
    )

  if (isAlreadyEditingSomethingElse) {
    return
  }

  const textarea =
    document.querySelector(
      '[data-memo-input="true"]:not([disabled]):not([readonly])',
    ) ??
    document.querySelector("textarea:not([disabled]):not([readonly])")

  if (textarea instanceof HTMLTextAreaElement) {
    textarea.focus({ preventScroll: true })
  }
}

/**
 * webviewタブの切り替え・close操作の直後に呼ぶ。
 * DOM更新が終わってからフォーカスを戻すため、
 * requestAnimationFrameを二重に使ってタイミングをずらす。
 */
export function restoreFocusAfterWebviewAction() {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      // 念のためrendererウィンドウ自体にもOSフォーカスを戻す
      window.focus()
      focusFirstAvailableTextarea()
    })
  })
}