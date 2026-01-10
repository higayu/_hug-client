// renderer/src/components/Sidebar/Tools/MemoTool/Parts/AiContents/common/PromptBox.jsx
import React, { useState, useEffect } from "react";
import { getActiveWebview } from '@/utils/webviewState.js'
//import { useAppState } from "@/contexts/AppStateContext.jsx";
import { useAppState } from '@/contexts/appState';
import { useChildrenList } from "@/hooks/useChildrenList.js";

export default function ProfessionalPrompt1() {
  const { appState, PROMPTS } = useAppState();
  const { childrenData, waitingChildrenData, experienceChildrenData} = useChildrenList();
  const { SELECT_CHILD } = useAppState();

  // "personalRecord" と "professional" のプロンプトを2つの textarea に対応
  const [text1, setText1] = useState("");
  const [aiText, setAiText] = useState("");   // AIに送るテキスト
  const [dbNote, setDbNote] = useState("");

  // 🔍 SELECT_CHILD 変更→DBメモ読み込み
  useEffect(() => {
    if (!SELECT_CHILD) {
      setDbNote("");
      return;
    }

    let child =
      childrenData.find((c) => c.children_id === SELECT_CHILD) ||
      waitingChildrenData.find((c) => c.children_id === SELECT_CHILD) ||
      experienceChildrenData.find((c) => c.children_id === SELECT_CHILD);

    setDbNote(child?.notes || "");
  }, [SELECT_CHILD, childrenData, waitingChildrenData, experienceChildrenData]);


  // 🔥 初期化時ログ & 初期値セット
  useEffect(() => {
    console.log("🟦 PromptBox 初期化（マウント）");
    console.log(" appState:", appState);
    console.log(" PROMPTS:", PROMPTS);

    // プロンプトの初期値反映
    if (PROMPTS) {
      setText1(PROMPTS.professional1?.content ?? "");
    }
  }, []);

  const OPEN_AI_DOMAIN = "chatgpt.com";

  const isChatGPT = (url) => {
    const result = typeof url === "string" && url.includes(OPEN_AI_DOMAIN);
    return result;
  };

  const clickEnterButton = async () => {
    console.log("① clickEnterButton 開始");

    const vw = getActiveWebview();
    console.log("② webview取得", vw);

    if (!vw) {
      console.warn("❌ webview が取得できない");
      return;
    }
    const url = vw && typeof vw.getURL === "function" ? vw.getURL() : "";
    if(!isChatGPT(url)){
      console.warn("❌ ChartGPT のドメインが取得できない");
      return;
    }

    console.log("③ webview isLoading:", vw.isLoading?.());

    const TextValue = `${dbNote}\n\n\n${text1}\n\n\n${aiText}`;

    // WebView ready 待ち
    await vw.executeJavaScript(`
      (() => {
        const SELECTORS = [
          '[contenteditable="true"][role="textbox"]',
          '[data-testid="prompt-textarea"][contenteditable="true"]',
          'div[contenteditable="true"]'
        ];

        const findEditor = () => {
          for (const sel of SELECTORS) {
            const el = document.querySelector(sel);
            if (el) return el;
          }
          return null;
        };

        const findButton = () =>
          document.querySelector('#composer-submit-button')
          || document.querySelector('[data-testid="send-button"]');

        const injectAndSend = (editor) => {
          editor.focus();
          editor.innerHTML = "";

          const text = ${JSON.stringify(TextValue)};
          document.execCommand("insertText", false, text);

          editor.dispatchEvent(new Event("input", { bubbles: true }));

          // 少し待ってから送信（重要）
          setTimeout(() => {
            const btn = findButton();
            if (btn && !btn.disabled) {
              btn.click();
              console.log("🚀 send button clicked");
            } else {
              console.warn("❌ send button not ready");
            }
          }, 100);
        };

        return new Promise((resolve) => {
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
            console.warn("❌ editor not found (timeout)");
            resolve(false);
          }, 7000);
        });
      })();
    `);

    console.log("⑥ executeJavaScript 呼び出し直前");

    let success;
    try {
      success = await vw.executeJavaScript(`/* 後述 */`);
    } catch (e) {
      console.error("❌ executeJavaScript 例外", e);
      return;
    }

    console.log("⑦ executeJavaScript 完了:", success);
  };

  return (
    <div className="flex flex-col gap-4 p-3 w-full">

      {/* --- DB保存済みメモ --- */}
      <div className="mt-4">
        <h4 className="text-xs font-bold text-gray-700 mb-2">
          保存済みメモ（専門支援内容 / DB）
        </h4>

        <div className="text-xs leading-relaxed bg-gray-700 text-white whitespace-pre-wrap break-words p-2 border border-gray-200 rounded min-h-[100px]">
          {dbNote || "メモがありません"}
        </div>
      </div>

      {/* ===== Textarea 1 ===== */}
      <div className="flex flex-col gap-1">
        <label className="font-semibold">専門的支援加算用プロンプト1</label>
        <textarea
          className="w-full h-20 border bg-gray-900 text-white border-gray-300 rounded-lg p-2 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          value={text1}
          readOnly
        />
      </div>

      {/* --- AI入力 --- */}
      <div className="mt-4">
        <label className="font-bold text-gray-700 block mb-1">
          AIに送信するテキスト
        </label>
        <textarea
          className="w-full h-40 p-2 border bg-gray-700 text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          value={aiText}
          placeholder="AIに送信する内容を入力..."
          onChange={(e) => setAiText(e.target.value)}
        />
      </div>

        <button
        className="bg-green-500 hover:bg-green-600 p-2 rounded text-white"
        onClick={() => clickEnterButton()}
        >
          実行
        </button>
    </div>
  );
}
