// renderer/src/components/Sidebar/TabsContainer.jsx
import { useState } from 'react'
import ToolContent from '../Tools/SelectChildren/ToolContent.jsx'
import SQLManager from '../Tools/SQLManager/index.jsx'
import ChildrenTable from '../Tools/InsertManageChildren/index.jsx'
import UpdateManager from '../Tools/UpdateManager/index.jsx'
//import { useAppState } from '@/contexts/AppStateContext.jsx'
import { useAppState } from '@/contexts/appState'

function TabsContainer() {
  // デフォルトでツールタブを開く
  const { activeSidebarTab: activeTab, setActiveSidebarTab: setActiveTab } = useAppState();


  const tabs = [
    { id: 'tools', label: '🧰 ツール' },
    { id: 'insertManageChildren', label: '👶 子ども管理' },
    { id: 'updateManager', label: '👨‍👧‍👦 児童担当編集' },
   // { id: 'sqlManager', label: '🗄️ SQL管理' },
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

        {activeTab === 'insertManageChildren' && (
          <div className="h-full flex flex-col">
            <ChildrenTable />
          </div>
        )}

        {activeTab === 'updateManager' && (
          <div className="h-full flex flex-col">
            <UpdateManager />
          </div>
        )}

      </div>
    </div>
  )
}

export default TabsContainer
