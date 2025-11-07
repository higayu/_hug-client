// renderer/src/components/Sidebar/TabsContainer.jsx
import { useState } from 'react'
import ToolContent from './Tools/ToolContent.jsx'
import SQLiteManager from './sqlitemanager/index.jsx' // ← SQLite Manager を追加

function TabsContainer() {
  // デフォルトでツールタブを開く
  const [activeTab, setActiveTab] = useState('tools')

  const tabs = [
    { id: 'tools', label: '🧰 ツール' },
    { id: 'sqlite', label: '🗄️ SQLite管理' },
  ]

  return (
    <div className="flex flex-col w-full h-full">
      {/* --- タブバー --- */}
      <div className="flex border-b border-gray-300 bg-gray-100">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 text-sm font-semibold transition-colors duration-200 ${
              activeTab === tab.id
                ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* --- コンテンツ切り替え --- */}
      <div className="flex-1 overflow-auto p-2 bg-white">
        {activeTab === 'tools' && (
          <div className="h-full flex flex-col">
            <ToolContent />
          </div>
        )}

        {activeTab === 'sqlite' && (
          <div className="h-full flex flex-col">
            <SQLiteManager />
          </div>
        )}

      </div>
    </div>
  )
}

export default TabsContainer
