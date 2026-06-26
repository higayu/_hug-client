// renderer/src/components/Sidebar/Tools/MemoTool/Parts/AiContents/common/send/sendPromptToDeepSeek.js
import { getActiveWebview } from "@/utils/webview/webviewState.js";

const DEEPSEEK_DOMAIN = "chat.deepseek.com";

const isChatGPT = (url = "") =>
  typeof url === "string" && url.includes(DEEPSEEK_DOMAIN);

export async function sendPromptToDeepSeek({ textValue }) {
  console.log("① sendPromptToDeepSeek 開始");

  if (!textValue || textValue.trim() === "") {
    console.warn("❌ textValue が空");
    return false;
  }

  const vw = getActiveWebview();
  if (!vw) {
    console.warn("❌ webview が取得できない");
    return false;
  }

  const url = typeof vw.getURL === "function" ? vw.getURL() : "";
  if (!isChatGPT(url)) {
    console.warn("❌ deepseek ドメインではない:", url);
    return false;
  }

  try {
    const success = await vw.executeJavaScript(`
      (() => {
        // DeepSeek用のセレクター
        const SELECTORS = [
          '#root > div > div.c3ecdb44 > div._7780f2e > div > div.ds-virtual-list.ds-virtual-list--printable.ds-scroll-area.ds-scroll-area--show-on-focus-within.ds-scroll-area--enabled._2bd7b35 > div._871cbca > div.aaff8b8f > div > div > div._24fad49 > textarea',
          'textarea[contenteditable="true"]',
          '[role="textbox"]',
          'textarea'
        ];

        const findEditor = () =>
          SELECTORS.map(s => document.querySelector(s)).find(Boolean);

        const findButton = () =>
          document.querySelector('button[type="submit"]')
          || document.querySelector('[data-testid="send-button"]')
          || document.querySelector('button:has(svg[data-icon="paper-plane"])');

        const injectAndSend = (editor) => {
          editor.focus();
          
          // textareaの場合はvalueを直接設定
          if (editor.tagName === 'TEXTAREA') {
            editor.value = ${JSON.stringify(textValue)};
            editor.dispatchEvent(new Event('input', { bubbles: true }));
          } else {
            // contenteditableの場合
            editor.innerHTML = "";
            document.execCommand(
              "insertText",
              false,
              ${JSON.stringify(textValue)}
            );
            editor.dispatchEvent(new Event("input", { bubbles: true }));
          }

          setTimeout(() => {
            const btn = findButton();
            if (btn && !btn.disabled) {
              btn.click();
            }
          }, 100);
        };

        return new Promise(resolve => {
          const editor = findEditor();
          if (editor) {
            injectAndSend(editor);
            return resolve(true);
          }

          const observer = new MutationObserver(() => {
            const ed = findEditor();
            if (ed) {
              observer.disconnect();
              injectAndSend(ed);
              resolve(true);
            }
          });

          observer.observe(document.body, {
            childList: true,
            subtree: true
          });

          setTimeout(() => {
            observer.disconnect();
            resolve(false);
          }, 7000);
        });
      })();
    `);

    return success;
  } catch (e) {
    console.error("❌ executeJavaScript 失敗", e);
    return false;
  }
}
