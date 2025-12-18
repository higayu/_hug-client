// @/components/Sidebar/Tools/SelectChildren/MemoTool/Parts/AiContents/OpenAiContent/common/AccountInfoPanel.jsx
import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import ToggleSecretText from "@/components/common/ToggleSecretText.jsx";
import CopyButton from "@/components/common/CopyButton.jsx";

/**
 * AccountInfoPanel (collapsible)
 * @param {object} props
 * @param {string} props.title - パネルのタイトル
 * @param {Array<{ label: string; value: string }>} props.items - 表示する項目
 */
export default function AccountInfoPanel({ title, items }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="w-full text-xs text-left bg-gray-50 border border-gray-200 rounded-lg">
      {/* header */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-2 py-1 font-semibold text-gray-700 hover:bg-gray-100 rounded-t-lg"
        aria-expanded={open}
      >
        <span>{title}</span>
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {/* body */}
      {open && (
        <div className="px-2 pb-2 space-y-1">
          {items.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between gap-2"
            >
              <ToggleSecretText label={item.label} value={item.value} />
              <CopyButton text={item.value} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
