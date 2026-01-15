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

  const TARGET_URL ='https://www.hug-ayumu.link/hug/wm/contact_book.php';

  const url = vw && typeof vw.getURL === 'function' ? vw.getURL() : '';
  console.log('url',url);


  return await vw.executeJavaScript(`
    (() => {
      // 下書き保存ボタンを取得（最優先）
      let draftBtn =
        document.querySelector('button.draft[data-save-button]') ||
        document.querySelector('button.draft');

      if (!draftBtn) {
        console.warn('❌ 下書き保存ボタンが見つかりません');
        return false;
      }

      if (draftBtn.disabled) {
        console.warn('⚠️ 下書き保存ボタンが disabled です');
        return false;
      }

      // 念のため value を確認
      const val = draftBtn.value;
      if (val !== '1') {
        console.warn('⚠️ 想定外の value:', val);
      }

      // フォーカス → クリック
      draftBtn.focus();
      draftBtn.click();

      console.log('✅ 下書き保存ボタンをクリックしました');
      return true;
    })();
  `);
};
