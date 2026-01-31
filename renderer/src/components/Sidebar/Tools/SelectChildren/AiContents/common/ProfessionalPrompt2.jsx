// renderer/src/components/Sidebar/Tools/MemoTool/Parts/AiContents/common/ProfessionalPrompt2.jsx
import React, { useState, useEffect } from "react";
import { useAppState } from "@/contexts/appState";
import { sendPromptToChatGPT } from "./send/sendPromptToChatGPT";
import ProfessionalInjectButton from "./ProfessionalInput/ProfessionalInjectButton";
import ProfessionalDraftSaveButton from './ProfessionalInput/ProfessionalDraftSaveButton';

export default function ProfessionalPrompt2() {
  const { appState, PROMPTS } = useAppState();

  const [text1, setText1] = useState("");
  const [aiText, setAiText] = useState("");

  // 🔥 初期値セット
  useEffect(() => {
    console.log("🟦 PromptBox 初期化（マウント）");
    console.log(" appState:", appState);
    console.log(" PROMPTS:", PROMPTS);

    if (PROMPTS) {
      setText1(PROMPTS.professional2?.content ?? "");
    }
  }, []);

  // ★ 送信する文字列を組み立てるだけ
  const textValue = `${text1}\n\n\n${aiText}`;

  const clickEnterButton = async () => {
    if (!aiText || aiText.trim() === "") return;
    await sendPromptToChatGPT({ textValue });
  };

  return (
    <div className="flex flex-col gap-4 p-3 w-full">

      {/* ===== プロンプト ===== */}
      <div className="flex flex-col gap-1">
        <label className="font-semibold">専門的支援加算用プロンプト2</label>
        <textarea
          className="w-full h-20 bg-gray-900 text-white rounded-lg p-2"
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
          className="w-full h-40 bg-gray-700 text-white rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          value={aiText}
          placeholder="AIに送信する内容を入力..."
          onChange={(e) => setAiText(e.target.value)}
        />
      </div>

      <div className="flex flex-row justify-between items-center">
        <button
          className="w-[250px] bg-green-500 hover:bg-green-600 p-2 rounded text-white"
          onClick={clickEnterButton}
          disabled={!aiText}
        >
          実行
        </button>

         <div className="flex flex-col justify-end">
            <ProfessionalDraftSaveButton/>
            <ProfessionalInjectButton />
         </div>

      </div>
    </div>
  );
}
