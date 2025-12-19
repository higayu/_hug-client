/**
 * ebox 内の table 配下にある
 * textarea[name="customize[contents][]"] にテキストを注入する
 *
 * @param {Electron.WebviewTag} vw
 * @param {string} text
 * @returns {Promise<boolean>}
 */
export const ProfessionalInjectText = async (vw, text) => {
  if (!vw || typeof vw.executeJavaScript !== 'function') {
    console.warn('❌ webview が不正です');
    return false;
  }
  const TARGET_URL = "https://www.hug-ayumu.link/hug/wm/record_proceedings.php?mode=edit";
  const isProfessional = (url_string) => {
    const result = typeof url_string === "string" && url_string.includes(TARGET_URL);
    return result;
  };
  const url = vw && typeof vw.getURL === "function" ? vw.getURL() : "";
  if(!isProfessional(url)){
    console.warn("❌ 専門的支援加算のURLが取得できない");
    return false;
  }

  return await vw.executeJavaScript(`
    (() => {
      const TARGET_TEXT = ${JSON.stringify(text)};

      // ① div.ebox を取得
      const eboxes = document.querySelectorAll('div.ebox');
      if (!eboxes.length) {
        console.warn('❌ div.ebox が見つかりません');
        return false;
      }

      let textarea = null;

      // ② ebox → table → textarea を探索
      for (const ebox of eboxes) {
        const tables = ebox.querySelectorAll('table');
        for (const table of tables) {
          const ta = table.querySelector(
            'textarea[name="customize[contents][]"]'
          );
          if (ta) {
            textarea = ta;
            break;
          }
        }
        if (textarea) break;
      }

      if (!textarea) {
        console.warn(
          '❌ textarea[name="customize[contents][]"] が見つかりません'
        );
        return false;
      }

      // ③ 値をセット
      textarea.focus();
      textarea.value = TARGET_TEXT;

      // ④ イベント発火（重要）
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
      textarea.dispatchEvent(new Event('change', { bubbles: true }));

      console.log('✅ customize contents textarea に値をセットしました');
      return true;
    })();
  `);
};
