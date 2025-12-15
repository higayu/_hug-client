// src/components/Sidebar/SelectChildrenList/TodayChildrenList.jsx
// 子どもリストを表示するコンポーネント

import { useState } from 'react'
import { useChildrenList } from '@/hooks/useChildrenList.js'
//import { useAppState } from '@/contexts/AppStateContext.jsx'
import { useAppState } from '@/contexts/appState'
import { ELEMENT_IDS, MESSAGES, EVENTS } from '@/utils/constants.js'

function TodayChildrenList() {
  const { childrenData, waitingChildrenData, experienceChildrenData, handleFetchAttendanceForChild, SELECT_CHILD } = useChildrenList()
  const { setSelectedChild, setSelectedPcName, attendanceData } = useAppState()
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

  // 子どもを選択
  const handleChildSelect = (childId, childName, pcName = '') => {
     console.log('🖱 [TodayChildrenList] child click', {
        childId,
        childName,
        pcName,
      })
    setSelectedChild(childId, childName)
    if (pcName) {
      setSelectedPcName(pcName)
    } else {
      setSelectedPcName('')
    }
    
    // window.AppStateも更新（後方互換性のため）
    if (window.AppState) {
      window.AppState.SELECT_CHILD = childId
      window.AppState.SELECT_CHILD_NAME = childName
      window.AppState.SELECT_PC_NAME = pcName || ''
    }
    
    console.log(`${MESSAGES.INFO.CHILD_SELECTED}: ${childName} (${childId})`)
  }


  // 通常の子どもリストアイテム
  const renderChildItem = (c, isFirst = false) => {
    const isSelected = SELECT_CHILD === c.children_id
    
    // attendanceDataから該当するchildren_idのデータを取得
    let column5Html = null
    if (attendanceData && attendanceData.data && Array.isArray(attendanceData.data)) {
      const attendanceItem = attendanceData.data.find(item => 
        item.children_id && item.children_id === String(c.children_id)
      )
      if (attendanceItem && attendanceItem.column5Html) {
        column5Html = attendanceItem.column5Html
      }
    }

    return (
      <li
        key={c.children_id}
        data-child-id={c.children_id}
        className={`p-2.5 my-1.5 border border-gray-200 rounded cursor-pointer transition-colors flex items-center justify-between gap-2.5 text-black ${
          isSelected
            ? 'bg-gradient-to-b from-cyan-100 to-cyan-400 border-l-4 border-l-cyan-700 font-bold'
            : 'bg-gray-50 hover:bg-gray-200'
        }`}
        style={isSelected ? {
          background: 'linear-gradient(to bottom, #cffafe, #22d3ee)',
          borderLeft: '4px solid #0e7490',
          fontWeight: 'bold'
        } : {}}
      >
        <span
          className="flex-1 cursor-pointer text-black"
          onClick={() => handleChildSelect(c.children_id, c.children_name, c.pc_name || '')}
        >
          {c.children_id}: {c.children_name}　:{c.pc_name || ''}
        </span>
      </li>
    )
  }

  // キャンセル待ち/体験子どもリストアイテム
  const renderSimpleChildItem = (c, listType) => {
    const isSelected = SELECT_CHILD === c.children_id
    const baseClass = listType === 'waiting'
      ? 'p-1.5 my-1.5 border-b border-gray-300 cursor-pointer transition-colors hover:bg-yellow-100 text-black'
      : 'p-1.5 my-1.5 border-b border-gray-300 cursor-pointer transition-colors hover:bg-blue-100 text-black'

    return (
      <li
        key={c.children_id}
        data-child-id={c.children_id}
        className={baseClass}
        style={isSelected ? {
          background: 'linear-gradient(to bottom, #cffafe, #22d3ee)',
          borderLeft: '4px solid #0e7490',
          fontWeight: 'bold'
        } : {}}
        onClick={() => handleChildSelect(c.children_id, c.children_name, listType === 'waiting' ? (c.pc_name || '') : '')}
      >
        {c.children_id}: {c.children_name}　:{c.pc_name || ''}
      </li>
    )
  }

  return (
    <div className="sidebar-content flex-1 overflow-y-auto overflow-x-hidden min-h-0">
      {/* 対応児童リスト */}
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
          id={ELEMENT_IDS.CHILDREN_LIST}
          className={`collapsible-content list-none p-0 m-0 transition-all duration-300 ease-out ${
            childrenCollapsed
              ? 'max-h-0 opacity-0 overflow-hidden'
              : 'max-h-[5000px] opacity-100 overflow-y-visible'
          }`}
        >
          {!Array.isArray(childrenData) || childrenData.length === 0 ? (
            <li>{MESSAGES.INFO.NO_CHILDREN}</li>
          ) : (
            childrenData.map((c, i) => renderChildItem(c, i === 0 && !SELECT_CHILD))
          )}
        </ul>
      </div>

      <hr className="my-4 border-none border-t border-gray-200" />

      {/* キャンセル待ち子どもリスト */}
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
          id={ELEMENT_IDS.WAITING_CHILDREN_LIST}
          className={`collapsible-content list-none p-0 m-0 transition-all duration-300 ease-out ${
            waitingCollapsed
              ? 'max-h-0 opacity-0 overflow-hidden'
              : 'max-h-[5000px] opacity-100 overflow-y-visible'
          }`}
        >
          {!Array.isArray(waitingChildrenData) || waitingChildrenData.length === 0 ? (
            <li>{MESSAGES.INFO.NO_WAITING}</li>
          ) : (
            waitingChildrenData.map(c => renderSimpleChildItem(c, 'waiting'))
          )}
        </ul>
      </div>

      <hr className="my-4 border-none border-t border-gray-200" />

      {/* 体験子どもリスト */}
      <label htmlFor="ExperienceChildrenList" className="block my-2.5 mt-2.5 mb-1.5 font-bold text-black text-sm">
        体験子ども:
      </label>
      <ul id={ELEMENT_IDS.EXPERIENCE_CHILDREN_LIST} className="list-none p-0 m-0">
        {!Array.isArray(experienceChildrenData) || experienceChildrenData.length === 0 ? (
          <li>{MESSAGES.INFO.NO_EXPERIENCE}</li>
        ) : (
          experienceChildrenData.map(c => renderSimpleChildItem(c, 'experience'))
        )}
      </ul>
    </div>
  )
}

export default TodayChildrenList

