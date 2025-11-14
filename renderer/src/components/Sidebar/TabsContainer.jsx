// renderer/src/components/Sidebar/TabsContainer.jsx
import { useState } from 'react'
import ToolContent from './Tools/SelectChildren/ToolContent.jsx'
import SQLManager from './Tools/SQLManager/index.jsx'
import ChildrenTable from './Tools/AddManageChildren/index.jsx'
import ManagerEditTable from './Tools/ManagerEdit/ManagerEditTable.jsx'

function TabsContainer() {
  // デフォルトでツールタブを開く
  const [activeTab, setActiveTab] = useState('tools')

  const tabs = [
    { id: 'tools', label: '🧰 ツール' },
    { id: 'addManageChildren', label: '👶 子ども管理' },
    { id: 'managerEdit', label: '👨‍👧‍👦 児童担当編集' },
    { id: 'sqlManager', label: '🗄️ SQL管理' },
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

        {activeTab === 'sqlManager' && (
          <div className="h-full flex flex-col">
            <SQLManager />
          </div>
        )}

        {activeTab === 'addManageChildren' && (
          <div className="h-full flex flex-col">
            <ChildrenTable />
          </div>
        )}

        {activeTab === 'managerEdit' && (
          <div className="h-full flex flex-col">
            <ManagerEditTable />
          </div>
        )}

      </div>
    </div>
  )
}

export default TabsContainer
