// renderer/src/components/Sidebar/Tools/MemoTool/Parts/AiContents/common/PromptBox.jsx
import React, { useState, useEffect } from "react";
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

  return (
    <div className="flex flex-col gap-4 p-3 w-full">

      {/* --- DB保存済みメモ --- */}
      <div className="mt-4">
        <h4 className="text-xs font-bold text-gray-700 mb-2">
          保存済みメモ（専門支援内容 / DB）
        </h4>

        <div className="text-xs leading-relaxed bg-gray-400 text-white whitespace-pre-wrap break-words p-2 border border-gray-200 rounded min-h-[100px]">
          {dbNote || "メモがありません"}
        </div>
      </div>

      {/* ===== Textarea 1 ===== */}
      <div className="flex flex-col gap-1">
        <label className="font-semibold">専門的支援加算用プロンプト1</label>
        <textarea
          className="w-full h-32 border border-gray-300 rounded-lg p-2 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
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
          className="w-full h-24 p-2 border text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          value={aiText}
          placeholder="AIに送信する内容を入力..."
          onChange={(e) => setAiText(e.target.value)}
        />
      </div>

        <button
        className="bg-green-700 p-2 rounded text-white"
        >
          実行
        </button>
    </div>
  );
}
