// renderer/src/components/Sidebar/TabsContainer.jsx
import { useMemo } from 'react'
import ToolContent from './SelectChildren'
import InsertChildren from './InsertChildren'
import UpdateManager from './UpdateManager'
import TestContent from './TestContent';
import { useAppState } from '@/AppStateContext';
import SpeechToText from './SpeechToText';

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
        { id: 'TestContent', label: 'テストコンテンツ' },
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
      <div className="flex-1 overflow-auto bg-white">
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
            <InsertChildren />
          </div>
        )}

        {activeTab === 'updateManager' && (
          <div className="h-full flex flex-col">
            <UpdateManager />
          </div>
        )}

        {DEBUG_FLG && activeTab === 'TestContent' && (
          <div className="h-full flex flex-col">
            <TestContent />
          </div>
        )}

      </div>
    </div>
  )
}

export default TabsContainer