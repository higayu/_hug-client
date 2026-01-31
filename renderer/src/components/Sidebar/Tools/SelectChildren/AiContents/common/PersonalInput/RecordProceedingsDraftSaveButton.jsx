// @/components/Sidebar/Tools/SelectChildren/PersonalInput/PersonalInjectButton.jsx
import React from 'react';
import { getActiveWebview } from '@/utils/webviewState.js';
import { useToast } from "@/components/common/ToastContext.jsx";
import { RecordProceedingsDraftSave } from './RecordProceedingsDraftSave.js';
import { ArrowRightIcon } from '@heroicons/react/24/solid';

/**
 * 各種加算・議事録管理画面で
 * 「下書きとして保存する」ボタンをクリックする
 */
export default function RecordProceedingsDraftSaveButton() {

  const { showErrorToast, showSuccessToast, showWarningToast } = useToast();

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
      const result = await RecordProceedingsDraftSave(vw, clipboardText);
      if (!result) {
        showWarningToast('❌ 下書きとして保存に失敗しました');
        return;
      }
      showSuccessToast('✅ 下書きとして保存に成功しました');
    } catch (e) {
      showErrorToast('❌ 下書きとして保存に失敗しました');
    }
  };

  return (
    <button
      className="
        w-22 p-1
        bg-sky-500 hover:bg-sky-600
        text-white rounded
        text-sm mb-2
        flex items-center justify-center gap-2
        group
      "
      onClick={clickEnterButton}
      type="button"
    >
      <span>下書きとして保存</span>
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
