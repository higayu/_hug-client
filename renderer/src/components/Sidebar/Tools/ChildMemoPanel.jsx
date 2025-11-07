// src/components/Sidebar/ChildMemoPanel.jsx
// 選択された要素のメモを表示するパネルコンポーネント

import { useEffect, useRef, useState } from 'react'
import { useAppState } from '../../../contexts/AppStateContext.jsx'
import { useChildrenList } from '../../../hooks/useChildrenList.js'
import { useTabs } from '../../../hooks/useTabs/index.js'
import { MESSAGES } from '../../../utils/constants.js'
import { clickEnterButton, clickAbsenceButton } from '../../../utils/attendanceButtonClick.js'

function ChildMemoPanel() {
  const { 
    SELECT_CHILD, 
    SELECT_CHILD_NAME, 
    attendanceData,
    SELECTED_CHILD_COLUMN5,
    SELECTED_CHILD_COLUMN5_HTML,
    SELECTED_CHILD_COLUMN6,
    SELECTED_CHILD_COLUMN6_HTML,
    setSelectedChildColumns
  } = useAppState()
  const { childrenData, waitingChildrenData, experienceChildrenData, saveTempNote, loadTempNote } = useChildrenList()
  const { addProfessionalSupportNewTab } = useTabs()
  const [selectedChildData, setSelectedChildData] = useState(null)
  const notesInputsRef = useRef({})
  
  // storeから値を取得（優先的に使用）
  const column5 = SELECTED_CHILD_COLUMN5
  const column5Html = SELECTED_CHILD_COLUMN5_HTML
  const column6 = SELECTED_CHILD_COLUMN6
  const column6Html = SELECTED_CHILD_COLUMN6_HTML
  
  // SELECT_CHILDまたはattendanceDataが変更されたときに、storeに値を保存
  useEffect(() => {
    if (!SELECT_CHILD || !attendanceData || !attendanceData.data || !Array.isArray(attendanceData.data)) {
      // データがない場合はクリア
      setSelectedChildColumns({
        column5: null,
        column5Html: null,
        column6: null,
        column6Html: null
      })
      return
    }
    
    const attendanceItem = attendanceData.data.find(item => 
      item.children_id && item.children_id === String(SELECT_CHILD)
    )
    
    if (attendanceItem) {
      setSelectedChildColumns({
        column5: attendanceItem.column5 || null,
        column5Html: attendanceItem.column5Html || null,
        column6: attendanceItem.column6 || null,
        column6Html: attendanceItem.column6Html || null
      })
    } else {
      // 該当するデータがない場合はクリア
      setSelectedChildColumns({
        column5: null,
        column5Html: null,
        column6: null,
        column6Html: null
      })
    }
  }, [SELECT_CHILD, attendanceData, setSelectedChildColumns])

  // column5が時間形式（HH:MM）かどうかをチェック
  const isTimeFormat = (value) => {
    if (!value) return false
    const timePattern = /^\d{2}:\d{2}$/
    return timePattern.test(value)
  }

  // column5が"入室"と"欠席"の両方を含む複合値かどうかをチェック
  const hasBothEnterAndAbsent = (value) => {
    if (!value) return false
    const normalizedValue = value.replace(/\s+/g, ' ') // 改行や複数の空白を1つの空白に統一
    return normalizedValue.includes('入室') && normalizedValue.includes('欠席')
  }

  // 選択された要素のデータを取得
  useEffect(() => {
    if (!SELECT_CHILD) {
      setSelectedChildData(null)
      return
    }

    // 通常の子どもリストから検索
    let child = childrenData.find(c => c.children_id === SELECT_CHILD)
    
    // 見つからない場合はキャンセル待ちリストから検索
    if (!child) {
      child = waitingChildrenData.find(c => c.children_id === SELECT_CHILD)
    }
    
    // 見つからない場合は体験子どもリストから検索
    if (!child) {
      child = experienceChildrenData.find(c => c.children_id === SELECT_CHILD)
    }

    setSelectedChildData(child || null)

    // データが変更されたときに一時メモを読み込む
    if (child) {
      setTimeout(() => {
        const enterInput = document.getElementById(`enter-${SELECT_CHILD}`)
        const exitInput = document.getElementById(`exit-${SELECT_CHILD}`)
        const memoTextarea = document.getElementById(`memo-${SELECT_CHILD}`)
        if (enterInput && exitInput && memoTextarea) {
          notesInputsRef.current[SELECT_CHILD] = { enterInput, exitInput, memoTextarea }
          loadTempNote(SELECT_CHILD, enterInput, exitInput, memoTextarea)
        }
      }, 100)
    }
  }, [SELECT_CHILD, childrenData, waitingChildrenData, experienceChildrenData, loadTempNote])

  // 一時メモの保存ハンドラー
  const handleSaveTempNote = async () => {
    if (!SELECT_CHILD) return
    const inputs = notesInputsRef.current[SELECT_CHILD]
    if (inputs) {
      await saveTempNote(SELECT_CHILD, inputs.enterInput.value, inputs.exitInput.value, inputs.memoTextarea.value)
    }
  }

  // 選択されていない場合は何も表示しない
  if (!SELECT_CHILD || !selectedChildData) {
    return (
      <div className="child-memo-panel flex-1 border-l border-gray-300 bg-gray-50 p-4 overflow-y-auto">
        <div className="text-sm text-gray-500 text-center mt-8">
          要素を選択してください
        </div>
      </div>
    )
  }

  return (
    <div className="child-memo-panel flex-1 border-l border-gray-300 bg-gray-50 p-4 overflow-y-auto flex flex-col h-full">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-gray-700 mb-2">
          {selectedChildData.children_id}: {selectedChildData.children_name}
        </h3>
        {selectedChildData.pc_name && (
          <p className="text-xs text-gray-600 mb-2">
            PC名: {selectedChildData.pc_name}
          </p>
        )}
      </div>

      <div className="flex-1 flex flex-col">
        <div className="mb-4 pb-4 border-b border-gray-300">
          {column5 === "欠席" ? (
            <div className="flex items-center gap-2 mb-3">
              <label className="text-xs font-bold text-red-600">欠席</label>
            </div>
          ) : hasBothEnterAndAbsent(column5) ? (
            <>
              {/* 入室と欠席の両方を含む場合 - 入室ボタンと欠席ボタンを表示 */}
              <div className="flex items-center gap-2 mb-3">
                <label className="text-xs font-bold text-gray-700 w-12">入室:</label>
                <button
                  onClick={async (e) => {
                    e.stopPropagation()
                    if (column5Html) {
                      await clickEnterButton(column5Html)
                    } else {
                      console.log('入室ボタンクリック（column5Htmlなし）')
                    }
                  }}
                  className={`flex-1 px-3 py-1.5 text-xs border-none rounded cursor-pointer transition-colors ${
                    column5Html 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'bg-gray-400 text-white hover:bg-gray-500'
                  }`}
                  title={column5Html ? "入室情報あり" : "入室ボタン"}
                >
                  {column5Html ? (
                    <span dangerouslySetInnerHTML={{ __html: column5Html }} />
                  ) : (
                    '入室'
                  )}
                </button>
              </div>
              
              <div className="flex items-center gap-2 mb-3">
                <label className="text-xs font-bold text-gray-700 w-12">欠席:</label>
                <button
                  onClick={async (e) => {
                    e.stopPropagation()
                    if (column5Html) {
                      await clickAbsenceButton(column5Html)
                    } else {
                      console.log('欠席ボタンクリック（column5Htmlなし）')
                    }
                  }}
                  className="flex-1 px-3 py-1.5 text-xs border-none rounded cursor-pointer transition-colors bg-red-600 text-white hover:bg-red-700"
                  title="欠席ボタン"
                >
                  欠席
                </button>
              </div>
            </>
          ) : isTimeFormat(column5) ? (
            <>
              {/* 時間形式の場合 - 入室時間をラベルで表示、退室時間または退室ボタンを表示 */}
              <div className="flex items-center gap-2 mb-3">
                <label className="text-xs font-bold text-gray-700 w-12">入室:</label>
                <label className="text-xs font-bold text-gray-700">{column5}</label>
              </div>
              
              {/* 退室時間または退室ボタン - column6が時間形式の場合はラベル、そうでない場合はボタン */}
              <div className="flex items-center gap-2 mb-3">
                <label className="text-xs font-bold text-gray-700 w-12">退室:</label>
                {isTimeFormat(column6) ? (
                  // column6が時間形式の場合 - 退室時間をラベルで表示
                  <>
                    {column6Html ? (
                      <span 
                        className="text-xs font-bold text-gray-700"
                        dangerouslySetInnerHTML={{ __html: column6Html }}
                      />
                    ) : (
                      <label className="text-xs font-bold text-gray-700">{column6}</label>
                    )}
                  </>
                ) : (
                  // column6が時間形式でない場合 - 退室ボタンを表示
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      // TODO: column5Htmlの値に応じた機能を実装
                      // column5Htmlがある場合とない場合で異なる処理を行う
                      if (column5Html) {
                        console.log('退室処理（入室情報あり）:', column5Html)
                        // 入室情報がある場合の退室処理（未実装）
                      } else {
                        console.log('退室ボタンクリック')
                        // 退室ボタンクリック時の処理（未実装）
                      }
                    }}
                    className={`flex-1 px-3 py-1.5 text-xs border-none rounded cursor-pointer transition-colors ${
                      column5Html 
                        ? 'bg-green-600 text-white hover:bg-green-700' 
                        : 'bg-gray-400 text-white hover:bg-gray-500'
                    }`}
                    title={column5Html ? "退室処理（入室情報あり）" : "退室ボタン"}
                  >
                    退室
                  </button>
                )}
              </div>
              
              {/* 専門的支援計画ページへの自動入力ボタン - column5とcolumn6が両方時間形式の場合のみ表示 */}
              {isTimeFormat(column5) && isTimeFormat(column6) && (
                <div className="flex items-center gap-2 mb-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      addProfessionalSupportNewTab()
                    }}
                    className="flex-1 px-3 py-1.5 text-xs border-none rounded cursor-pointer transition-colors bg-purple-600 text-white hover:bg-purple-700"
                    title="専門的支援計画ページを開いて自動入力"
                  >
                    専門的支援を開く
                  </button>
                </div>
              )}
            </>
          ) : (
            <>
              {/* 入室ボタン - column5Htmlの値によって機能が変わる */}
              <div className="flex items-center gap-2 mb-3">
                <label className="text-xs font-bold text-gray-700 w-12">入室:</label>
                <button
                  onClick={async (e) => {
                    e.stopPropagation()
                    if (column5Html) {
                      await clickEnterButton(column5Html)
                    } else {
                      console.log('入室ボタンクリック（column5Htmlなし）')
                    }
                  }}
                  className={`flex-1 px-3 py-1.5 text-xs border-none rounded cursor-pointer transition-colors ${
                    column5Html 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'bg-gray-400 text-white hover:bg-gray-500'
                  }`}
                  title={column5Html ? "入室情報あり" : "入室ボタン"}
                >
                  {column5Html ? (
                    <span dangerouslySetInnerHTML={{ __html: column5Html }} />
                  ) : (
                    '入室'
                  )}
                </button>
              </div>
              
              {/* 退出ボタン - column5Htmlの値によって機能が変わる */}
              <div className="flex items-center gap-2 mb-3">
                <label className="text-xs font-bold text-gray-700 w-12">退出:</label>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    // TODO: column5Htmlの値に応じた機能を実装
                    // column5Htmlがある場合とない場合で異なる処理を行う
                    if (column5Html) {
                      console.log('退出処理（入室情報あり）:', column5Html)
                      // 入室情報がある場合の退出処理（未実装）
                    } else {
                      console.log('退出ボタンクリック')
                      // 退出ボタンクリック時の処理（未実装）
                    }
                  }}
                  className={`flex-1 px-3 py-1.5 text-xs border-none rounded cursor-pointer transition-colors ${
                    column5Html 
                      ? 'bg-green-600 text-white hover:bg-green-700' 
                      : 'bg-gray-400 text-white hover:bg-gray-500'
                  }`}
                  title={column5Html ? "退出処理（入室情報あり）" : "退出ボタン"}
                >
                  退出
                </button>
              </div>
            </>
          )}
          <div className="mb-3">
            <label className="text-xs font-bold text-gray-700 block mb-1">メモ:</label>
            <textarea
              id={`memo-${SELECT_CHILD}`}
              className="w-full p-1.5 border border-gray-300 rounded text-xs bg-white resize-y min-h-[100px] font-inherit text-black focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
              placeholder={MESSAGES.PLACEHOLDERS?.MEMO || 'メモを入力...'}
              rows={5}
              onInput={handleSaveTempNote}
            />
          </div>
          <button
            onClick={handleSaveTempNote}
            className="w-full px-3 py-1.5 bg-blue-600 text-white border-none rounded text-xs cursor-pointer hover:bg-blue-700 transition-colors"
          >
            保存
          </button>
        </div>

        <div className="flex-1">
          <h4 className="text-xs font-bold text-gray-700 mb-2">保存済みメモ:</h4>
          <div className="text-xs leading-relaxed text-black whitespace-pre-wrap break-words p-2 bg-white border border-gray-200 rounded min-h-[100px]">
            {selectedChildData.notes || 'メモがありません'}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChildMemoPanel

