// renderer/src/components/Sidebar/Tools/MemoTool/Parts/AiInputBox.jsx
import React, { useState, useEffect } from "react";
import { useAppState } from "@/contexts/AppStateContext.jsx";
import { useChildrenList } from "@/hooks/useChildrenList.js";

export default function AiInputBox() {
  const { SELECT_CHILD } = useAppState();
  const { childrenData, waitingChildrenData, experienceChildrenData, saveTempNote, loadTempNote } = useChildrenList();

  const [memo, setMemo] = useState("");      // 一時メモ
  const [aiText, setAiText] = useState("");  // AIに送るテキスト
  const [dbNote, setDbNote] = useState("");  // DBの保存済みメモ


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


  // 🔄 一時メモ読込
  useEffect(() => {
    if (!SELECT_CHILD) {
      setMemo("");
      return;
    }

    // loadTempNote は textarea.value に書き込む仕様 → setter のみ使う
    const textareaProxy = {
      set value(v) {
        setMemo(v);
      }
    };

    loadTempNote(SELECT_CHILD, textareaProxy);

  }, [SELECT_CHILD, loadTempNote]);


  // 💾 一時メモ保存
  const handleSaveClick = async () => {
    if (!SELECT_CHILD) return;
    await saveTempNote(SELECT_CHILD, memo);
  };


  return (
    <div className="flex flex-col w-full bg-white p-2 shadow-sm">

      {/* --- 一時メモ --- */}
      <div>
        <label className="text-xs font-bold text-gray-700 block mb-1">
          一時メモ（編集可能）
        </label>

        <textarea
          className="w-full p-2 border border-gray-300 rounded text-xs bg-white resize-y min-h-[100px]
                     text-black focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
          placeholder="メモを入力..."
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          rows={5}
        />
      </div>

      <button
        onClick={handleSaveClick}
        className="w-full px-3 py-1.5 bg-blue-600 text-white border-none rounded text-xs cursor-pointer hover:bg-blue-700 transition-colors mt-2"
      >
        一時メモを保存
      </button>


      {/* --- AI入力 --- */}
      <div className="mt-4">
        <label className="text-xs font-bold text-gray-700 block mb-1">
          AIに送信するテキスト
        </label>

        <textarea
          className="w-full h-24 p-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          value={aiText}
          placeholder="AIに送信する内容を入力..."
          onChange={(e) => setAiText(e.target.value)}
        />
      </div>


      {/* --- DB保存済みメモ --- */}
      <div className="mt-4">
        <h4 className="text-xs font-bold text-gray-700 mb-2">
          保存済みメモ（専門支援内容 / DB）
        </h4>

        <div className="text-xs leading-relaxed text-black whitespace-pre-wrap break-words p-2 bg-white border border-gray-200 rounded min-h-[100px]">
          {dbNote || "メモがありません"}
        </div>
      </div>

    </div>
  );
}
