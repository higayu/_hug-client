// renderer/src/components/Sidebar/Tools/SelectChildren/MemoTool/MemoContainer.jsx
import React, { useState } from "react";
//import { useAppState } from "@/contexts/AppStateContext.jsx";
import { useAppState } from '@/contexts/appState';

import MemoInputBox from "./Parts/MemoInputBox.jsx";
import OpenAiContent from "./Parts/AiContents/OpenAiContent/OpenAiContent.jsx";
import GeminiContent from "./Parts/AiContents/GeminiContent/GeminiContent.jsx";

const AI_COMPONENT_MAP = {
  gemini: GeminiContent,
  chatGPT: OpenAiContent,
};

export default function MemoContainer() {
  const { USE_AI } = useAppState();
  const [isAi, setIsAi] = useState(false);
  const AiComponent = AI_COMPONENT_MAP[USE_AI];

  return (
    <div className="flex h-full">
      {/* ===== 左：中身 ===== */}
      <div className="flex-1 overflow-auto">
        {!isAi && <MemoInputBox />}
        {isAi && AiComponent && <AiComponent />}
        {isAi && !AiComponent && (
          <div className="text-sm text-gray-500 p-3">
            使用するAIが選択されていません
          </div>
        )}
      </div>
  
      {/* ===== 右：タブ ===== */}
      <div className="flex flex-col justify-center border-l bg-white">
        <button
          className={`px-1 py-4 h-[50%] text-sm font-medium border-l-2 transition
            ${!isAi
              ? "border-indigo-500 text-indigo-600 bg-sky-300"
              : "border-transparent text-gray-500 hover:bg-gray-700"}
          `}
          onClick={() => setIsAi(false)}
        >
          メモ
        </button>
  
        <button
          className={`px-1 py-4 h-[50%] text-sm font-medium border-l-2 transition
            ${isAi
              ? "border-indigo-500 text-indigo-600 bg-sky-300"
              : "border-transparent text-gray-500 hover:bg-gray-700"}
          `}
          onClick={() => setIsAi(true)}
        >
          AI
        </button>
      </div>
    </div>
  );
  
}
