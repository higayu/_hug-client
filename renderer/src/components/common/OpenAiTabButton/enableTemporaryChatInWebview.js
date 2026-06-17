const TEMP_CHAT_ON_ARIA = "一時チャットをオンにする"
const TEMP_CHAT_OFF_ARIA = "一時チャットをオフにする"
const TEMP_CHAT_BUTTON_SELECTOR =
  "#conversation-header-actions > div > span > button"

const INITIAL_DELAY_MS = 1000
const RETRY_INTERVAL_MS = 800
const MAX_ATTEMPTS = 20

export const isOpenAiChatUrl = (url = "") =>
  typeof url === "string" &&
  (url.includes("chat.openai.com") || url.includes("chatgpt.com"))

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * webview 内の ChatGPT で「一時チャットをオンにする」をクリックする（1回分）
 * PersonalinjectText.js と同様に同期 IIFE で boolean を返す
 *
 * @param {Electron.WebviewTag} vw
 * @returns {Promise<boolean>}
 */
export const enableTemporaryChatInWebview = async (vw) => {
  if (!vw || typeof vw.executeJavaScript !== "function") {
    console.warn("❌ webview が不正です")
    return false
  }

  const url = vw && typeof vw.getURL === "function" ? vw.getURL() : ""
  console.log("url", url)

  if (!isOpenAiChatUrl(url)) {
    console.warn("❌ ChatGPT ドメインではない:", url)
    return false
  }

  try {
    return await vw.executeJavaScript(`
      (() => {
        const ON_LABEL = ${JSON.stringify(TEMP_CHAT_ON_ARIA)};
        const OFF_LABEL = ${JSON.stringify(TEMP_CHAT_OFF_ARIA)};
        const SELECTOR = ${JSON.stringify(TEMP_CHAT_BUTTON_SELECTOR)};

        if (document.querySelector('button[aria-label="' + OFF_LABEL + '"]')) {
          console.log('✅ 一時チャットは既にオン');
          return true;
        }

        let btn = document.querySelector('button[aria-label="' + ON_LABEL + '"]');
        if (!btn) btn = document.querySelector(SELECTOR);

        if (!btn) {
          const header = document.querySelector('#conversation-header-actions');
          if (header) btn = header.querySelector('button');
        }

        if (!btn) {
          console.warn('❌ 一時チャットボタンが見つかりません');
          return false;
        }

        btn.click();
        console.log('✅ 一時チャットをオンにクリック');
        return true;
      })();
    `)
  } catch (err) {
    console.error("❌ 一時チャット有効化スクリプト失敗:", err)
    return false
  }
}

/**
 * ロード完了後に DOM 出現を待ちながら一時チャットを有効化する
 * @param {Electron.WebviewTag} webview
 * @returns {Promise<boolean>}
 */
export async function runEnableTemporaryChatAfterLoad(webview) {
  if (!webview || typeof webview.executeJavaScript !== "function") {
    return false
  }

  await sleep(INITIAL_DELAY_MS)

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    if (attempt > 0) await sleep(RETRY_INTERVAL_MS)

    const url =
      webview && typeof webview.getURL === "function" ? webview.getURL() : ""
    if (!isOpenAiChatUrl(url)) continue

    const ok = await enableTemporaryChatInWebview(webview)
    if (ok) {
      console.log("✅ 一時チャット有効化完了 (attempt:", attempt + 1, ")")
      return true
    }
  }

  console.warn("⚠️ 一時チャット有効化に失敗しました")
  return false
}
