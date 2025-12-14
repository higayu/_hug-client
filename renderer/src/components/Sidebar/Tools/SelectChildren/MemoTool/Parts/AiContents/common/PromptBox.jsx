// renderer\src\components\Sidebar\Tools\SelectChildren\MemoTool\Parts\AiContents\common\PromptBox.jsx
import React, { useState } from "react";
import PersonalRecordPrompt from "./PersonalRecordPrompt";
import ProfessionalPrompt1 from "./ProfessionalPrompt1";
import ProfessionalPrompt2 from "./ProfessionalPrompt2";

const COMPONENT_MAP = {
  personal: {
    label: "個人",
    component: PersonalRecordPrompt,
  },
  professional1: {
    label: "専門的支援①",
    component: ProfessionalPrompt1,
  },
  professional2: {
    label: "専門的支援②",
    component: ProfessionalPrompt2,
  },
};

export default function PromptBox() {
  const [activeKey, setActiveKey] = useState("personal");

  const ActiveComponent = COMPONENT_MAP[activeKey].component;

  return (
    <div className="flex flex-col bg-gray-400 gap-4 p-3 w-full">
      {/* ===== タブ ===== */}
      <div className="flex gap-2 flex-wrap">
        {Object.entries(COMPONENT_MAP).map(([key, { label }]) => (
          <button
            key={key}
            className={`px-3 py-1 rounded text-sm ${
              activeKey === key
                ? "bg-sky-400 text-white"
                : "bg-gray-200"
            }`}
            onClick={() => setActiveKey(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ===== 表示 ===== */}
      <ActiveComponent />
    </div>
  );
}
