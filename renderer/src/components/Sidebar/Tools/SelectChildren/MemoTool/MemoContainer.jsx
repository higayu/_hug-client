// renderer/src/components/Sidebar/Tools/SelectChildren/MemoTool/MemoContainer.jsx
import React, { useState } from "react";
import { useAppState } from "@/contexts/AppStateContext.jsx";

import MemoInputBox from "./Parts/MemoInputBox.jsx";
import OpenAiContent from "./Parts/AiContents/OpenAiContent/OpenAiContent.jsx";
import GeminiContent from "./Parts/AiContents/GeminiContent/GeminiContent.jsx";

const AI_COMPONENT_MAP = {
  gemini: GeminiContent,
  chatGPT: OpenAiContent,
};

export default function MemoContainer() {
  const { USE_AI } = useAppState();     // AIの種類だけ
  const [isAi, setIsAi] = useState(false); // Memo / AI 切替（ローカル）

  const AiComponent = AI_COMPONENT_MAP[USE_AI];
  console.log('使用するAI',USE_AI);

  return (
    <div className="flex flex-col">
      {/* ===== タブ ===== */}
      <div className="flex border-b">
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 transition
            ${!isAi
              ? "border-indigo-500 text-indigo-600"
              : "border-transparent text-gray-500 hover:text-gray-700"}
          `}
          onClick={() => setIsAi(false)}
        >
          メモ
        </button>

        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 transition
            ${isAi
              ? "border-indigo-500 text-indigo-600"
              : "border-transparent text-gray-500 hover:text-gray-700"}
          `}
          onClick={() => setIsAi(true)}
        >
          AI
        </button>
      </div>

      {/* ===== 表示切替 ===== */}
      {!isAi && <MemoInputBox />}

      {isAi && AiComponent && <AiComponent />}

      {isAi && !AiComponent && (
        <div className="text-sm text-gray-500 p-3">
          使用するAIが選択されていません
        </div>
      )}
    </div>
  );
}