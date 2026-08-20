// renderer/src/components/Sidebar/ToolContent.jsx

import { useEffect, useState } from 'react';
import TodayChildrenList from './TodayChildrenList';
import ChildMemoPanel from './ChildMemoPanel';
import AiContents from "./AiContents";

function ToolContent() {
  const [activeTool, setActiveTool] = useState('default');

  useEffect(() => {
    console.log('🧰 ToolContent がマウントされました')
  }, [])

  return (
    <div className="w-full flex flex-col">
      {/* SidebarContent と ChildMemoPanel を横並びに配置 */}
      <div className="tool-content flex flex-1 min-h-0 overflow-hidden">
        <div className="flex-[5] min-w-0">
          <TodayChildrenList />
        </div>
        <div className="flex-[5] min-w-0">
          <ChildMemoPanel />
        </div>
      </div>
      {/* AI + メモツール */}
      <div className="mt-4 border-t rounded bg-gray-200 border-gray-300 pt-3">
        <AiContents />
      </div>
    </div>

  )
}

export default ToolContent
