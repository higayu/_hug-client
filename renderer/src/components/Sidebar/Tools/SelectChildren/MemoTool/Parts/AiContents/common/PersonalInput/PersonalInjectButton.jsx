// @/components/Sidebar/Tools/SelectChildren/PersonalInput/PersonalInjectButton.jsx
import React from 'react';
import { getActiveWebview } from '@/utils/webviewState.js';
import { useToast } from "@/components/common/ToastContext.jsx";
import { PersonalinjectText } from './PersonalinjectText.js';
/**
 * 個人記録を注入するボタン
 */
export default function PersonalInjectButton() {

  const { showErrorToast, showSuccessToast,showWarningToast } = useToast();

  const clickEnterButton = async () => {
    const vw = getActiveWebview();
    if (!vw) return;
    let clipboardText = '';
    // ① クリップボード取得（文字列なら採用）
    try {
      const clip = await navigator.clipboard.readText();
      if (typeof clip === 'string' && clip.trim() !== '') {
        clipboardText = clip;
      }
    } catch (e) {
      showWarningToast('⚠️ クリップボード取得不可', e);
    }
    // ③ textarea に注入
    try {
      const result = await PersonalinjectText(vw, clipboardText);
      if (!result) {
        showWarningToast('❌ 個人記録の注入に失敗しました');
        return;
      }
      showSuccessToast('✅ 注入結果:成功');
    } catch (e) {
      showErrorToast('❌ 個人記録の注入に失敗しました');
    }
  };

  return (
    <button
      className="w-40 h-10  bg-green-700 hover:bg-green-800 text-white rounded"
      onClick={clickEnterButton}
      type="button"
    >
      個人記録の入力
    </button>
  );
}
