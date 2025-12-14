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


const clickEnterButton = async (promptText) => {
  if (!promptText.trim()) {
    showWarningToast("プロンプトが空です");
    return;
  }

  if (!aiText.trim()) {
    showWarningToast("AIに送信するテキストが空です");
    return;
  }

  const vw = getActiveWebview();
  const url = typeof vw?.getURL === "function" ? vw.getURL() : "";

  if (!isChatGPT(url)) {
    showWarningToast("OpenAIとは違うドメインです");
    return;
  }

  const success = await vw.executeJavaScript(`
    (() => {
      const textarea = document.querySelector(
        'textarea[name="prompt-textarea"]'
      );
      if (!textarea) return false;

      const originalDisplay = textarea.style.display;
      textarea.style.display = "block";
      textarea.focus();
      textarea.value = ${JSON.stringify(aiText)};

      textarea.dispatchEvent(
        new InputEvent("input", {
          bubbles: true,
          inputType: "insertText",
          data: ${JSON.stringify(aiText)},
        })
      );

      textarea.style.display = originalDisplay;
      return true;
    })()
  `);

  if (!success) {
    showErrorToast("入力欄が見つかりません");
  }
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
