// renderer/src/components/Sidebar/Tools/SelectChildren/MemoTool/Parts/MemoEditor.jsx
import React, { useRef } from "react";
import { useToast } from "@/components/common/ToastContext.jsx";

export default function MemoEditor({
  label,
  value,
  onChange,
  onSave,
  disabled,
  minHeight = 100,
}) {
  const ref = useRef(null);
  const { showSuccessToast, showErrorToast } = useToast();

  const handleSave = async () => {
    try {
      const result = await onSave();
      if (result) {
        showSuccessToast(`${label} を保存しました`);
      } else {
        showErrorToast(`${label} の保存に失敗しました`);
      }
    } catch (e) {
      console.error(e);
      showErrorToast(`${label} の保存中にエラー`);
    }
  };

  return (
    <div className="mt-3">
      <div className="flex gap-2 mt-1 mb-1 items-start">
        <label className="px-2 py-1 text-xs font-bold text-gray-700">
          {label}
        </label>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => ref.current?.focus()}
          className="px-2 py-1 text-xs bg-sky-200 rounded hover:bg-gray-300"
        >
          入力に戻す
        </button>
      </div>

      <textarea
        ref={ref}
        className="w-full p-2 border border-gray-300 rounded text-xs bg-white resize-y
                   text-black focus:outline-none focus:border-blue-600
                   focus:ring-2 focus:ring-blue-200"
        style={{ minHeight }}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />

      <button
        onClick={handleSave}
        disabled={disabled}
        className="mt-2 w-full px-3 py-2 bg-blue-600 text-white rounded
                   text-xs hover:bg-blue-700 disabled:opacity-50"
      >
        このメモを保存
      </button>
    </div>
  );
}
