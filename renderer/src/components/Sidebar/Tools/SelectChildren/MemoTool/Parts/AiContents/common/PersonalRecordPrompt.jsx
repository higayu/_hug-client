// renderer/src/components/Sidebar/Tools/MemoTool/Parts/AiContents/common/PromptBox.jsx
import React, { useState, useEffect } from "react";
import { getActiveWebview } from '@/utils/webviewState.js'
import { useAppState } from "@/contexts/AppStateContext.jsx";
import { useToast } from '@/components/common/ToastContext.jsx'

export default function PersonalRecordPrompt() {
  const { appState, PROMPTS } = useAppState();

  // "personalRecord" と "professional" のプロンプトを2つの textarea に対応
  const [text1, setText1] = useState("");
  const [aiText, setAiText] = useState("");   // AIに送るテキスト
  const {
    showSuccessToast,
    showErrorToast,
    showWarningToast,
    showInfoToast,
  } = useToast()

  const OPEN_AI_DOMAIN = "chatgpt.com";

  const isChatGPT = (url) => {
    const result = typeof url === "string" && url.includes(OPEN_AI_DOMAIN);
    return result;
  };

  // 🔥 初期化時ログ & 初期値セット
  useEffect(() => {
    console.log("🟦 PromptBox 初期化（マウント）");
    console.log(" appState:", appState);
    console.log(" PROMPTS:", PROMPTS);

    // プロンプトの初期値反映
    if (PROMPTS) {
      setText1(PROMPTS.personalRecord?.content ?? "");
    }
  }, []);

  const clickEnterButton = async () => {
    console.log("① clickEnterButton 開始");

    const vw = getActiveWebview();
    console.log("② webview取得", vw);

    if (!vw) {
      console.warn("❌ webview が取得できない");
      return;
    }

    console.log("③ webview isLoading:", vw.isLoading?.());

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

    const inject = (editor) => {
      editor.focus();
      editor.innerHTML = "";

      const text = ${JSON.stringify(aiText)};
      document.execCommand("insertText", false, text);

      editor.dispatchEvent(new Event("input", { bubbles: true }));
      console.log("✅ editor input injected");
    };

    return new Promise((resolve) => {
      const editor = findEditor();
      if (editor) {
        inject(editor);
        return resolve(true);
      }

      console.log("⏳ editor not found, waiting...");

      const observer = new MutationObserver(() => {
        const ed = findEditor();
        if (ed) {
          observer.disconnect();
          inject(ed);
          resolve(true);
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      setTimeout(() => {
        observer.disconnect();
        console.warn("❌ editor still not found (timeout)");
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

      {/* --- AI入力 --- */}
      <div className="mt-4">
        <label className="font-semibold">個人記録用プロンプト</label>
        <textarea
          className="w-full h-32 border border-gray-300 rounded-lg p-2 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          value={text1}
          readOnly
        />
      </div>

      {/* ===== Textarea 1 ===== */}
      <div className="flex flex-col gap-1">
        <label className="font-bold text-gray-700 block mb-1">
          AIに送信するテキスト
        </label>
        <textarea
          className="w-full h-24 p-2 border text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          value={aiText}
          placeholder="AIに送信する内容を入力..."
          onChange={(e) => setAiText(e.target.value)}
        />
        <button
        className="bg-green-700 p-2 rounded text-white"
        onClick={() => clickEnterButton(text1)}
        >
          実行
        </button>
      </div>
    </div>
  );
}
