// renderer/src/components/Sidebar/Tools/SelectChildren/MemoTool/MemoContainer.jsx
import React, { useState } from "react";

import MemoInputBox from "./Parts/MemoInputBox";
import AiContents from "./Parts/AiContents";

export default function MemoContainer() {
  const [isAi, setIsAi] = useState(false);

  return (
    <div className="flex h-full">
      {/* ===== 左：中身 ===== */}
      <div className="flex-1 overflow-auto">
        {!isAi && 
          <div>
            <MemoInputBox
              memoType={1}
              label="一時メモ１（編集可能）"
              minHeight={120}
            />
            <MemoInputBox
              memoType={2}
              label="一時メモ２（編集可能）"
              minHeight={100}
            />
          </div>
        }
        {isAi && <AiContents />}
      </div>

      {/* ===== 右：タブ ===== */}
      <div className="flex flex-col justify-center border-l bg-white">
        <button
          className={`px-1 py-4 h-[50%] text-sm font-medium border-l-2 transition
            ${
              !isAi
                ? "border-indigo-500 text-indigo-600 bg-sky-300"
                : "border-transparent text-gray-500 hover:bg-gray-700"
            }`}
          onClick={() => setIsAi(false)}
        >
          メモ
        </button>

        <button
          className={`px-1 py-4 h-[50%] text-sm font-medium border-l-2 transition
            ${
              isAi
                ? "border-indigo-500 text-indigo-600 bg-sky-300"
                : "border-transparent text-gray-500 hover:bg-gray-700"
            }`}
          onClick={() => setIsAi(true)}
        >
          AI
        </button>
      </div>
    </div>
  );
}
