// renderer/src/components/Sidebar/ToolContent.jsx

import { useEffect, useState } from 'react'
import TodayChildrenList from './TodayChildrenList.jsx'
import ChildMemoPanel from './ChildMemoPanel.jsx'
import MemoContainer from './MemoTool/MemoContainer.jsx'

function ToolContent() {
  const [activeTool, setActiveTool] = useState('default')

  useEffect(() => {
    console.log('🧰 ToolContent がマウントされました')
  }, [])

  return (
    <div className="w-full flex flex-col">
      <div className="tool-content flex flex-1 min-h-0 overflow-hidden">
        {/* SidebarContent と ChildMemoPanel を横並びに配置 */}
        <TodayChildrenList />
        <ChildMemoPanel />
      </div>
      {/* AI + メモツール */}
      <div className="mt-4 border-t rounded bg-gray-200 border-gray-300 pt-3">
        <MemoContainer />
      </div>
    </div>

  )
}

export default ToolContent
