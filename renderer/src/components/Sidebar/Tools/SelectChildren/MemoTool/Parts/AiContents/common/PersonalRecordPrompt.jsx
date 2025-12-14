// renderer/src/components/Sidebar/Tools/MemoTool/Parts/AiContents/common/PromptBox.jsx
import React, { useState, useEffect } from "react";
import { useAppState } from "@/contexts/AppStateContext.jsx";

export default function PersonalRecordPrompt() {
  const { appState, PROMPTS } = useAppState();

  // "personalRecord" と "professional" のプロンプトを2つの textarea に対応
  const [text1, setText1] = useState("");
  const [aiText, setAiText] = useState("");   // AIに送るテキスト

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

  return (
    <div className="flex flex-col gap-4 p-3 w-full">

      {/* --- AI入力 --- */}
      <div className="mt-4">
        <label className="font-bold text-gray-700 block mb-1">
          AIに送信するテキスト
        </label>

        <textarea
          className="w-full h-24 p-2 border text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          value={aiText}
          placeholder="AIに送信する内容を入力..."
          onChange={(e) => setAiText(e.target.value)}
        />
      </div>

      {/* ===== Textarea 1 ===== */}
      <div className="flex flex-col gap-1">
        <label className="font-semibold">個人記録用プロンプト</label>
        <textarea
          className="w-full h-32 border border-gray-300 rounded-lg p-2 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          value={text1}
          onChange={(e) => setText1(e.target.value)}
          placeholder="personalRecord.content の編集..."
        />
        <button
        className="bg-green-700 p-2 rounded text-white"
        >
          実行
        </button>
      </div>
    </div>
  );
}
