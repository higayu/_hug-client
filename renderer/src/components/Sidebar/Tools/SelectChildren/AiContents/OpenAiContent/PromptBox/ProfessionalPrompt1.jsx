// renderer/src/components/Sidebar/Tools/MemoTool/Parts/AiContents/common/ProfessionalPrompt1.jsx
import React, { useState, useEffect } from "react";
import { useAppState } from "@/contexts/appState";
import { useChildrenList } from "@/hooks/useChildrenList.js";
import { sendPromptToChatGPT } from "./send/sendPromptToChatGPT";
import { useTabs } from "@/hooks/useTabs/index.js";

export default function ProfessionalPrompt1() {
  const { appState, PROMPTS, SELECT_CHILD } = useAppState();
  const {
    childrenData,
    waitingChildrenData,
    experienceChildrenData,
  } = useChildrenList();

  const [text1, setText1] = useState("");
  const [aiText, setAiText] = useState("");
  const [dbNote, setDbNote] = useState("");

  // 🔍 SELECT_CHILD 変更 → DBメモ読み込み
  useEffect(() => {
    if (!SELECT_CHILD) {
      setDbNote("");
      return;
    }

    const child =
      childrenData.find(c => c.children_id === SELECT_CHILD) ||
      waitingChildrenData.find(c => c.children_id === SELECT_CHILD) ||
      experienceChildrenData.find(c => c.children_id === SELECT_CHILD);

    setDbNote(child?.notes || "");
  }, [SELECT_CHILD, childrenData, waitingChildrenData, experienceChildrenData]);

  // 🔥 初期値セット
  useEffect(() => {
    if (PROMPTS) {
      setText1(PROMPTS.professional1?.content ?? "");
    }
  }, []);

  const { addProfessionalSupportCheckTab } = useTabs();

  // ★ 送信する文字列を組み立てるだけ
  const textValue = `${dbNote}\n\n\n${text1}\n\n\n${aiText}`;

  const clickEnterButton = async () => {
    if (!aiText || aiText.trim() === "") return;

    await sendPromptToChatGPT({ textValue });
  };

  return (
    <div className="flex flex-col gap-4 p-3 w-full">

      {/* --- DB保存済みメモ --- */}
      <div className="mt-4">
        <h4 className="text-xs font-bold text-gray-700 mb-2">
          保存済みメモ（専門支援内容 / DB）
        </h4>
        <div className="text-xs bg-gray-700 text-white p-2 rounded whitespace-pre-wrap">
          {dbNote || "メモがありません"}
        </div>
      </div>

      {/* --- プロンプト --- */}
      <div>
        <label className="font-semibold">専門的支援加算用プロンプト1</label>
        <textarea
          className="w-full h-20 bg-gray-900 text-white rounded p-2"
          value={text1}
          readOnly
        />
      </div>

      {/* --- AI入力 --- */}
      <div>
        <label className="font-bold text-gray-700 block mb-1">
          AIに送信するテキスト
        </label>
        <textarea
          className="w-full h-40 bg-gray-700 text-white rounded p-2"
          value={aiText}
          placeholder="AIに送信する内容を入力..."
          onChange={(e) => setAiText(e.target.value)}
        />
      </div>

      <div className="flex flex-row justify-between items-center">
          <button
            className="w-[70%] bg-green-500 hover:bg-green-600 p-2 rounded text-white"
            onClick={clickEnterButton}
            disabled={!aiText}
          >
            実行
          </button>
          <button
            className="btn-purple hover:bg-purple-600 p-2 rounded text-white"
            onClick={addProfessionalSupportCheckTab}
          >
            専門的支援チェック
          </button>
      </div>
    </div>
  );
}
