import { useState } from 'react'

function SidebarContent() {
  const [childrenCollapsed, setChildrenCollapsed] = useState(false)
  const [waitingCollapsed, setWaitingCollapsed] = useState(true)

  // 対応児童リストの折りたたみ
  const toggleChildrenList = () => {
    setChildrenCollapsed(!childrenCollapsed)
  }

  // キャンセル待ちリストの折りたたみ
  const toggleWaitingList = () => {
    setWaitingCollapsed(!waitingCollapsed)
  }

  return (
    <div className="sidebar-content flex-1 overflow-y-auto overflow-x-hidden min-h-0">
      <div className="collapsible-section my-2.5">
        <label
          htmlFor="childrenList"
          onClick={toggleChildrenList}
          className="collapsible-header flex justify-between items-center cursor-pointer py-2 m-0 select-none transition-colors hover:bg-gray-100 rounded px-1"
          id="childrenHeader"
        >
          <span className="text-black">対応児童:</span>
          <span className={`toggle-icon text-xs transition-transform ${childrenCollapsed ? '-rotate-90' : ''}`}>
            ▼
          </span>
        </label>
        <ul
          id="childrenList"
          className={`collapsible-content list-none p-0 m-0 transition-all duration-300 ease-out ${
            childrenCollapsed
              ? 'max-h-0 opacity-0 overflow-hidden'
              : 'max-h-[5000px] opacity-100 overflow-y-visible'
          }`}
        ></ul>
      </div>

      <hr className="my-4 border-none border-t border-gray-200" />
      <div className="collapsible-section my-2.5">
        <label
          htmlFor="waitingChildrenList"
          onClick={toggleWaitingList}
          className="collapsible-header flex justify-between items-center cursor-pointer py-2 m-0 select-none transition-colors hover:bg-gray-100 rounded px-1"
          id="waitingHeader"
        >
          <span className="text-black">キャンセル待ち子ども:</span>
          <span className={`toggle-icon text-xs transition-transform ${waitingCollapsed ? '-rotate-90' : ''}`}>
            ▼
          </span>
        </label>
        <ul
          id="waitingChildrenList"
          className={`collapsible-content list-none p-0 m-0 transition-all duration-300 ease-out ${
            waitingCollapsed
              ? 'max-h-0 opacity-0 overflow-hidden'
              : 'max-h-[5000px] opacity-100 overflow-y-visible'
          }`}
        ></ul>
      </div>

      <hr className="my-4 border-none border-t border-gray-200" />
      <label htmlFor="ExperienceChildrenList" className="block my-2.5 mt-2.5 mb-1.5 font-bold text-black text-sm">
        体験子ども:
      </label>
      <ul id="ExperienceChildrenList" className="list-none p-0 m-0"></ul>

      <hr className="my-4 border-none border-t border-gray-200" />
      {/* 出勤データ取得ボタン */}
      <div className="attendance-section my-4 p-2.5 bg-gray-100 rounded border border-gray-200">
        <button
          id="fetchAttendanceBtn"
          className="attendance-button w-full p-2.5 bg-blue-600 text-white border-none rounded text-sm font-bold cursor-pointer transition-colors mb-2.5 hover:bg-blue-700 active:scale-[0.98] disabled:bg-gray-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          📊 出勤データ取得
        </button>
        <div
          id="attendanceResult"
          className="attendance-result p-2.5 bg-white border border-gray-200 rounded text-xs max-h-[200px] overflow-y-auto break-words hidden"
        ></div>
      </div>
    </div>
  )
}

export default SidebarContent

