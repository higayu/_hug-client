/**
 * 各種加算・議事録管理画面で
 * 「下書きとして保存する」ボタンをクリックする
 *
 * @param {Electron.WebviewTag} vw
 * @returns {Promise<boolean>}
 */
export const RecordProceedingsDraftSave = async (vw) => {
  if (!vw || typeof vw.executeJavaScript !== 'function') {
    console.warn('❌ webview が不正です');
    return false;
  }

  const TARGET_URL =
    'https://www.hug-ayumu.link/hug/wm/record_proceedings.php';

  const isTargetPage = (url) =>
    typeof url === 'string' && url.includes(TARGET_URL);

  const url =
    vw && typeof vw.getURL === 'function' ? vw.getURL() : '';

  if (!isTargetPage(url)) {
    console.warn('❌ 議事録管理ページではありません');
    return false;
  }

  return await vw.executeJavaScript(`
    (() => {
      // 下書き保存ボタンを取得
      const draftBtn = document.querySelector(
        'button.save[value="draft"]'
      );

      if (!draftBtn) {
        console.warn('❌ 下書き保存ボタンが見つかりません');
        return false;
      }

      // 無効状態チェック
      if (draftBtn.disabled) {
        console.warn('⚠️ 下書き保存ボタンが disabled です');
        return false;
      }

      // フォーカス → クリック
      draftBtn.focus();
      draftBtn.click();

      console.log('✅ 下書き保存ボタンをクリックしました');
      return true;
    })();
  `);
};
