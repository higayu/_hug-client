import React, { useState } from "react";

export default function PromptBox({ componentMap, ...componentProps }) {
  const keys = Object.keys(componentMap || {});
  const [activeKey, setActiveKey] = useState(keys[0] || "");

  if (!activeKey || !componentMap?.[activeKey]) {
    return null;
  }

  const ActiveComponent = componentMap[activeKey].component;

  return (
    <div className="flex flex-col bg-gray-400 gap-4 p-1 w-full rounded-br-md">
      <ActiveComponent {...componentProps} promptKey={activeKey} />

      <div className="flex flex-wrap bg-gray-700">
        {Object.entries(componentMap).map(([key, { label }]) => (
          <button
            key={key}
            type="button"
            className={`min-w-[100px] px-3 py-2 border-gray-500 rounded-b-lg text-sm ${
              activeKey === key
                ? "bg-sky-400 text-white"
                : "bg-gray-200 hover:bg-blue-400"
            }`}
            onClick={() => setActiveKey(key)}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
