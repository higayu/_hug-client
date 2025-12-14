// renderer/src/components/Sidebar/Tools/MemoTool/Parts/AiInputBox.jsx
import React, { useState, useEffect } from "react";
import { useAppState } from "@/contexts/AppStateContext.jsx";
import { useChildrenList } from "@/hooks/useChildrenList.js";
import { useToast } from  '@/components/common/ToastContext.jsx'
import { useNote } from "@/hooks/useNote.js";

export default function AiInputBox() {
  const { SELECT_CHILD } = useAppState();
  const { childrenData, waitingChildrenData, experienceChildrenData} = useChildrenList();
  const { saveTemp, loadTemp } = useNote();
  const { showSuccessToast, showErrorToast } = useToast();
  const [memo1, setMemo1] = useState("");       // 一時メモ1
  const [memo2, setMemo2] = useState("");     // 一時メモ2
  const [dbNote, setDbNote] = useState("");   // DBの保存済みメモ


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


  // 🔄 一時メモ読込（memo + memo2）
  useEffect(() => {
    if (!SELECT_CHILD) {
      setMemo1("");
      setMemo2("");
      return;
    }

    const proxy = {
      set value(v) {
        // v がオブジェクトなら memo1 と memo2 をセット
        if (typeof v === "object" && v !== null) {
          setMemo1(v.memo1 || "");
          setMemo2(v.memo2 || "");
        } else {
          // 旧仕様：string の場合は memo のみに反映
          setMemo1(v);
        }
      }
    };

    loadTemp(SELECT_CHILD, proxy);

  }, [SELECT_CHILD, loadTemp]);


  // 💾 一時メモ保存（まとめて保存）
  const handleSaveClick = async () => {
    if (!SELECT_CHILD) return;
      memo1,
      memo2
    try {
      const result = await saveTemp(SELECT_CHILD, memo1,memo2);
      if (result) {
        console.log("✅ 一時メモ保存成功");
        showSuccessToast("一時メモ保存成功");
      } else {
        console.error("❌ 一時メモ保存失敗");
        showErrorToast("一時メモ保存失敗");
      }
    } catch (error) {

      console.error("❌ 一時メモ保存エラー:", error);
      showErrorToast("一時メモ保存エラー");
    }
  };


  return (
    <div className="flex flex-col w-full rounded mb-2 p-2 shadow-sm">

      {/* --- 一時メモ1 --- */}
      <div>
        <label className="text-xs font-bold text-gray-700 block mb-1">
          一時メモ１（編集可能）
        </label>

        <textarea
          className="w-full p-2 border border-gray-300 rounded text-xs bg-white resize-y min-h-[100px]
                     text-black focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
          placeholder="メモを入力..."
          value={memo1}
          onChange={(e) => setMemo1(e.target.value)}
          rows={4}
        />
      </div>

      {/* --- 一時メモ2 --- */}
      <div className="mt-3">
        <label className="text-xs font-bold text-gray-700 block mb-1">
          一時メモ２（編集可能）
        </label>

        <textarea
          className="w-full p-2 border border-gray-300 rounded text-xs bg-white resize-y min-h-[80px]
                     text-black focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
          placeholder="メモを入力..."
          value={memo2}
          onChange={(e) => setMemo2(e.target.value)}
          rows={3}
        />
      </div>

      <button
        onClick={handleSaveClick}
        className="w-full px-3 py-1.5 bg-blue-600 text-white border-none rounded text-xs cursor-pointer hover:bg-blue-700 transition-colors mt-3"
      >
        一時メモを保存（まとめて）
      </button>

      {/* --- DB保存済みメモ --- */}
      <div className="mt-4">
        <h4 className="text-xs font-bold text-gray-700 mb-2">
          保存済みメモ（専門支援内容 / DB）
        </h4>

        <div className="text-xs leading-relaxed bg-gray-400 text-white whitespace-pre-wrap break-words p-2 border border-gray-200 rounded min-h-[100px]">
          {dbNote || "メモがありません"}
        </div>
      </div>

    </div>
  );
}
