// renderer/src/components/Sidebar/Tools/SelectChildren/MemoTool/Parts/MemoInputBox.jsx
import React from "react";
import MemoEditor from "./MemoEditor";

export default function MemoInputBox() {
  return (
    <div className="flex flex-col w-full rounded mb-2 p-2 shadow-sm">
      <MemoEditor
        memoType={1}
        label="一時メモ１（編集可能）"
        minHeight={120}
      />

      <MemoEditor
        memoType={2}
        label="一時メモ２（編集可能）"
        minHeight={100}
      />
    </div>
  );
}
