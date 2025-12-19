// @/components/Sidebar/Tools/SelectChildren/PersonalInput/PersonalInjectButton.jsx
import React from 'react';
import { getActiveWebview } from '@/utils/webviewState.js';
import { useToast } from "@/components/common/ToastContext.jsx";
import { ProfessionalInjectText } from './ProfessionalInjectText.js';
/**
 * 専門的支援加算を注入するボタン
 */
export default function ProfessionalInjectButton() {

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
      const result = await ProfessionalInjectText(vw, clipboardText);
      if (!result) {
        showWarningToast('❌ 専門的支援加算の注入に失敗しました');
        return;
      }
      showSuccessToast('✅ 注入結果:成功');
    } catch (e) {
      showErrorToast('❌ 専門的支援加算の注入に失敗しました');
    }
  };

  return (
    <button
      className="w-60 h-10  bg-green-700 hover:bg-green-800 text-white rounded"
      onClick={clickEnterButton}
      type="button"
    >
      専門的支援加算の入力
    </button>
  );
}
