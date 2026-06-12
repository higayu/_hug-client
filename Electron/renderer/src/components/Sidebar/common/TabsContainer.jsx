// renderer/src/components/Sidebar/TabsContainer.jsx
import { useMemo } from 'react'
import ToolContent from '@/components/Sidebar/Tools/SelectChildren'
import SQLManager from '@/components/Sidebar/Tools/SQLManager'
import ChildrenTable from '@/components/Sidebar/Tools/InsertManageChildren'
import UpdateManager from '@/components/Sidebar/Tools/UpdateManager'
import GetKojinkiroku from '@/components/Sidebar/common/GetKojinkiroku'
import { useAppState } from '@/contexts/appState'
import SpeechToText from '@/components/common/SpeechToText'

function TabsContainer() {
  const {
    activeSidebarTab: activeTab,
    setActiveSidebarTab: setActiveTab,
    DEBUG_FLG,
  } = useAppState()

  const tabs = useMemo(() => {
    const baseTabs = [
      { id: 'tools', label: '🧰 ツール' },
      { id: 'speechToText', label: '🎙 音声入力' },
      { id: 'insertManageChildren', label: '👶 子ども管理' },
      { id: 'updateManager', label: '👥 担当編集' },
    ]

    if (DEBUG_FLG) {
      baseTabs.push(
        { id: 'GetKojinkiroku', label: '入退室テスト' },
        { id: 'SQLManager', label: 'テーブル' },
      )
    }

    return baseTabs
  }, [DEBUG_FLG])

  return (
    <div className="flex flex-col w-full h-full">
      {/* --- タブバー --- */}
      <div className="flex w-full overflow-x-auto border-b border-gray-300 bg-gray-100">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex-none whitespace-nowrap px-3 py-2 text-xs font-semibold leading-none transition-colors duration-200 ${
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

        {activeTab === 'speechToText' && (
          <div className="h-full flex flex-col">
            <SpeechToText />
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

        {DEBUG_FLG && activeTab === 'GetKojinkiroku' && (
          <div className="h-full flex flex-col">
            <GetKojinkiroku />
          </div>
        )}

        {DEBUG_FLG && activeTab === 'SQLManager' && (
          <div className="h-full flex flex-col">
            <SQLManager />
          </div>
        )}
      </div>
    </div>
  )
}

export default TabsContainer