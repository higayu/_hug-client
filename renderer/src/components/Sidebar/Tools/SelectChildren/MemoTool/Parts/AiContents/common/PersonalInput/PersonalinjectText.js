/**
 * ebox-content.careContent 内の textarea[name="note"] に
 * 指定したテキストを注入する
 *
 * @param {Electron.WebviewTag} vw
 * @param {string} text
 * @returns {Promise<boolean>}
 */
export const PersonalinjectText = async (vw, text) => {
  if (!vw || typeof vw.executeJavaScript !== 'function') {
    console.warn('❌ webview が不正です');
    return false;
  }

  const TARGET_URL = "https://www.hug-ayumu.link/hug/wm/contact_book.php";
  const isPersonalRecord = (url_string) => {
    const result = typeof url_string === "string" && url_string.includes(TARGET_URL);
    return result;
  };

  const url = vw && typeof vw.getURL === "function" ? vw.getURL() : "";

  if(!isPersonalRecord(url)){
      console.warn("❌ 個人記録のURLが取得できない");
      return false;
   }

  return await vw.executeJavaScript(`
    (() => {
      const TARGET_TEXT = ${JSON.stringify(text)};

      // ebox-content careContent を探索
      const containers = document.querySelectorAll(
        'div.ebox-content.careContent'
      );

      let textarea = null;

      for (const container of containers) {
        const ta = container.querySelector('textarea[name="note"]');
        if (ta) {
          textarea = ta;
          break;
        }
      }

      // フォールバック
      if (!textarea) {
        textarea = document.querySelector('textarea[name="note"]');
      }

      if (!textarea) {
        console.warn('❌ textarea[name="note"] が見つかりません');
        return false;
      }

      textarea.focus();
      textarea.value = TARGET_TEXT;

      // 入力イベント発火
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
      textarea.dispatchEvent(new Event('change', { bubbles: true }));

      console.log('✅ textarea[name="note"] に値をセット');
      return true;
    })();
  `);
};
