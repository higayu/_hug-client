// renderer/src/components/Sidebar/ToolContent.jsx

import { useEffect, useState } from 'react'
import SidebarContent from './SidebarContent.jsx'
import ChildMemoPanel from './ChildMemoPanel.jsx'
import TableDataGetButon from './TableDataGetButon.jsx'

function ToolContent() {
  const [activeTool, setActiveTool] = useState('default')

  useEffect(() => {
    console.log('🧰 ToolContent がマウントされました')
  }, [])

  return (
    <div>
      <TableDataGetButon />
      <div className="tool-content flex flex-1 min-h-0 overflow-hidden">
        {/* SidebarContent と ChildMemoPanel を横並びに配置 */}
        <SidebarContent />
        <ChildMemoPanel />
      </div>
    </div>

  )
}

export default ToolContent
