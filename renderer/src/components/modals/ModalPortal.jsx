import { createPortal } from "react-dom";

/**
 * 子要素を document.body に Portal で描画する。
 * モーダルのオーバレイが親の overflow/transform の影響を受けず、画面全体に表示される。
 */
export function ModalPortal({ children }) {
  return createPortal(children, document.body);
}
