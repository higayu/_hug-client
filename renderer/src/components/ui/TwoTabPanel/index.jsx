// renderer/src/components/ui/TwoTabPanel.jsx
import React, { useState } from "react"

export default function TwoTabPanel({
  tabs = ["タブ1", "タブ2"],
  children,
  defaultActive = 0,
  className = "",
}) {
  const [activeTab, setActiveTab] = useState(defaultActive)

  const childArray = React.Children.toArray(children)

  const tabContents = [
    childArray[0] ?? null,
    childArray[1] ?? null,
  ]

  return (
    <div className={`w-full rounded-xl border border-gray-200 bg-white shadow-sm ${className}`}>
      <div className="flex border-b border-gray-200">
        {tabs.slice(0, 2).map((label, index) => {
          const isActive = activeTab === index

          return (
            <button
              key={index}
              type="button"
              onClick={() => setActiveTab(index)}
              className={[
                "flex-1 px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100",
                index === 0 ? "rounded-tl-xl" : "",
                index === 1 ? "rounded-tr-xl" : "",
              ].join(" ")}
            >
              {label}
            </button>
          )
        })}
      </div>

      <div className="p-3">
        {tabContents[activeTab]}
      </div>
    </div>
  )
}