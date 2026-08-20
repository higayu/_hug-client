import { useState } from 'react'
import AiContents from './AiContents'
import ChildKadai from './ChildKadai'

const TABS = [
  { id: 'ai', label: 'AI支援' },
  { id: 'child-kadai', label: '児童課題' },
]

export default function MainPanel() {
  const [activeTab, setActiveTab] = useState('ai')

  return (
    <section className="min-w-0" aria-label="メインパネル">
      <div className="flex gap-1 border-b border-gray-300 px-3" role="tablist">
        {TABS.map((tab) => {
          const active = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-t px-4 py-2 text-sm font-medium ${active
                ? '-mb-px border border-b-white border-gray-300 bg-white text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'}`}
            >
              {tab.label}
            </button>
          )
        })}
      </div>
      <div className="min-w-0 bg-white" role="tabpanel">
        {activeTab === 'ai' ? <AiContents /> : <ChildKadai />}
      </div>
    </section>
  )
}
