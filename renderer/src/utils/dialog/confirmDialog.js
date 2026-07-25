// renderer/src/utils/dialog/confirmDialog.js
//
// window.confirm() の共通置き換え関数。
// window.confirm() は renderer の JS スレッドを完全に止めてしまい、
// webview構成のこのアプリでは入力ブロック/フリーズの原因になっていた。
// 必ずこの関数を経由するようにする。
//
// 使い方:
//   import { confirmDialog } from "@/utils/confirmDialog.js"
//
//   if (!(await confirmDialog("このタブを閉じますか？"))) return

export async function confirmDialog(message) {
  return await window.electronAPI.confirmDialog(message)
}