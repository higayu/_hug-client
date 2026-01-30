// renderer\src\components\Sidebar\Tools\SelectChildren\MemoTool\Parts\MemoInputBox.jsx
import React, { useState, useEffect } from "react";
import { useAppState } from "@/contexts/appState";
import { useNote } from "@/hooks/useNote.js";
import MemoEditor from "./MemoEditor";

export default function MemoInputBox() {
  const { SELECT_CHILD } = useAppState();
  const { saveTemp1, saveTemp2, loadTemp } = useNote();

  const [memo1, setMemo1] = useState("");
  const [memo2, setMemo2] = useState("");

  // 🔄 読み込み
  useEffect(() => {
    if (!SELECT_CHILD) {
      setMemo1("");
      setMemo2("");
      return;
    }

    const proxy = {
      set value(v) {
        if (typeof v === "object" && v !== null) {
          setMemo1(v.memo1 || "");
          setMemo2(v.memo2 || "");
        } else {
          setMemo1(v);
        }
      },
    };

    loadTemp(SELECT_CHILD, proxy);
  }, [SELECT_CHILD, loadTemp]);

  return (
    <div className="flex flex-col w-full rounded mb-2 p-2 shadow-sm">
      <MemoEditor
        label="一時メモ１（編集可能）"
        value={memo1}
        onChange={setMemo1}
        disabled={!SELECT_CHILD}
        minHeight={120}
        onSave={() => saveTemp1(SELECT_CHILD, memo1)}
      />

      <MemoEditor
        label="一時メモ２（編集可能）"
        value={memo2}
        onChange={setMemo2}
        disabled={!SELECT_CHILD}
        minHeight={100}
        onSave={() => saveTemp2(SELECT_CHILD, memo2)}
      />
    </div>
  );
}

