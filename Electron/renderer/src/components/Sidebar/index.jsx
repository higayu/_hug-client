import { useRef } from "react"
import TabsContainer from "./common/TabsContainer"
import SidebarHeader from "./common/SidebarHeader"

function Sidebar() {
  const sidebarRef = useRef(null)

  return (
    <div
      ref={sidebarRef}
      className="text-black bg-gray-50 flex flex-col h-full"
    >
      <SidebarHeader />

      {/* メインコンテンツ */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <TabsContainer />
      </div>
    </div>
  )
}

export default Sidebar