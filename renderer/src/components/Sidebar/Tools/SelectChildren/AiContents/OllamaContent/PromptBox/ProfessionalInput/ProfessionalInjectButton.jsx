// @/components/Sidebar/Tools/SelectChildren/PersonalInput/PersonalInjectButton.jsx
import React from 'react';
import { getActiveWebview } from '@/utils/webview/webviewState.js';
import { useToast } from "@/components/common/ToastContext.jsx";
import { ProfessionalInjectText } from './ProfessionalInjectText.js';
import { ArrowRightIcon } from '@heroicons/react/24/solid';
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
      className="
        w-40 h-10
        bg-purple-500 hover:bg-purple-600
        text-white rounded
        flex items-center justify-center gap-2
        group
      "
      onClick={clickEnterButton}
      type="button"
    >
      <span>専門的加算</span>
      <ArrowRightIcon
        className="
          w-4 h-4
          transition-transform
          group-hover:translate-x-1
        "
      />
    </button>
  );
}
