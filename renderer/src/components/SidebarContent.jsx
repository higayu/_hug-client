// src/components/SidebarContent.jsx
// 子どもリストを表示するコンポーネント

import { useState, useRef, useCallback } from 'react'
import { useChildrenList } from '../hooks/useChildrenList.js'
import { useAppState } from '../contexts/AppStateContext.jsx'
import { ELEMENT_IDS, MESSAGES, EVENTS } from '../utils/constants.js'

function SidebarContent() {
  const { childrenData, waitingChildrenData, experienceChildrenData, handleFetchAttendanceForChild, saveTempNote, loadTempNote, SELECT_CHILD } = useChildrenList()
  const { setSelectedChild, setSelectedPcName } = useAppState()
  const [childrenCollapsed, setChildrenCollapsed] = useState(false)
  const [waitingCollapsed, setWaitingCollapsed] = useState(true)
  const [expandedNotes, setExpandedNotes] = useState({})
  const notesInputsRef = useRef({})

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

  // ノート表示/非表示の切り替え
  const toggleNotes = useCallback((childId) => {
    setExpandedNotes(prev => {
      const wasExpanded = prev[childId]
      const newState = {
        ...prev,
        [childId]: !wasExpanded
      }
      
      // ノートが展開されたときに一時メモを読み込む
      if (!wasExpanded) {
        setTimeout(() => {
          const enterInput = document.getElementById(`enter-${childId}`)
          const exitInput = document.getElementById(`exit-${childId}`)
          const memoTextarea = document.getElementById(`memo-${childId}`)
          if (enterInput && exitInput && memoTextarea) {
            notesInputsRef.current[childId] = { enterInput, exitInput, memoTextarea }
            loadTempNote(childId, enterInput, exitInput, memoTextarea)
          }
        }, 100)
      }
      
      return newState
    })
  }, [loadTempNote])

  // 一時メモの保存ハンドラー
  const handleSaveTempNote = async (childId) => {
    const inputs = notesInputsRef.current[childId]
    if (inputs) {
      await saveTempNote(childId, inputs.enterInput.value, inputs.exitInput.value, inputs.memoTextarea.value)
    }
  }

  // 通常の子どもリストアイテム
  const renderChildItem = (c, isFirst = false) => {
    const isSelected = SELECT_CHILD === c.children_id
    const notesExpanded = expandedNotes[c.children_id]

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
        onContextMenu={(e) => {
          e.preventDefault()
          e.stopPropagation()
          toggleNotes(c.children_id)
        }}
      >
        <span
          className="flex-1 cursor-pointer text-black"
          onClick={() => handleChildSelect(c.children_id, c.children_name, c.pc_name || '')}
        >
          {c.children_id}: {c.children_name}　:{c.pc_name || ''}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation()
            // 空のボタン処理（一時的に無効化）
          }}
          className="px-2 py-1 text-xs bg-gray-400 text-white border-none rounded cursor-pointer flex-shrink-0 hover:bg-gray-500"
          title="入室ボタン"
        >
          📊
        </button>
        {notesExpanded && (
          <div className="notes-display mt-1.5 p-2 bg-gray-50 border border-gray-300 rounded text-xs text-gray-700 whitespace-pre-wrap break-words max-h-[100px] overflow-y-auto w-full">
            <div className="mb-2 pb-2 border-b border-gray-300">
              <div className="flex items-center gap-2 mb-2">
                <label className="text-[11px] font-bold text-gray-700 mr-1">入室:</label>
                <input
                  type="time"
                  id={`enter-${c.children_id}`}
                  className="w-20 p-1.5 border border-gray-300 rounded text-[11px] bg-white text-black focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
                  onChange={() => handleSaveTempNote(c.children_id)}
                />
                <label className="text-[11px] font-bold text-gray-700 mr-1">退出:</label>
                <input
                  type="time"
                  id={`exit-${c.children_id}`}
                  className="w-20 p-1.5 border border-gray-300 rounded text-[11px] bg-white text-black focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
                  onChange={() => handleSaveTempNote(c.children_id)}
                />
              </div>
              <label className="text-[11px] font-bold text-gray-700 mr-1 w-full mt-2 block">メモ:</label>
              <textarea
                id={`memo-${c.children_id}`}
                className="w-full p-1.5 border border-gray-300 rounded text-[11px] bg-white resize-y min-h-[60px] font-inherit text-black focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
                placeholder={MESSAGES.PLACEHOLDERS?.MEMO || 'メモを入力...'}
                rows={3}
                onInput={() => handleSaveTempNote(c.children_id)}
              />
              <button
                onClick={() => handleSaveTempNote(c.children_id)}
                className="px-2 py-1 bg-blue-600 text-white border-none rounded text-[10px] cursor-pointer ml-auto hover:bg-blue-700 mt-2"
              >
                保存
              </button>
            </div>
            <div className="mt-2 text-xs leading-snug text-black">
              {c.notes || 'メモがありません'}
            </div>
          </div>
        )}
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
          {childrenData.length === 0 ? (
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
          {waitingChildrenData.length === 0 ? (
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
        {experienceChildrenData.length === 0 ? (
          <li>{MESSAGES.INFO.NO_EXPERIENCE}</li>
        ) : (
          experienceChildrenData.map(c => renderSimpleChildItem(c, 'experience'))
        )}
      </ul>
    </div>
  )
}

export default SidebarContent
