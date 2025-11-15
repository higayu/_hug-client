// src/components/Sidebar/ChildMemoPanel.jsx
import { useEffect, useState } from 'react'
import { useAppState } from '@/contexts/AppStateContext.jsx'
import { useChildrenList } from '@/hooks/useChildrenList.js'
import { useTabs } from '@/hooks/useTabs/index.js'
import MemoContainer from './MemoTool/MemoContainer.jsx'
import { clickEnterButton, clickAbsenceButton, clickExitButton } from '../../../../utils/attendanceButtonClick.js'

function ChildMemoPanel() {
  const { 
    SELECT_CHILD, 
    attendanceData,
    SELECTED_CHILD_COLUMN5,
    SELECTED_CHILD_COLUMN5_HTML,
    SELECTED_CHILD_COLUMN6,
    SELECTED_CHILD_COLUMN6_HTML,
    setSelectedChildColumns
  } = useAppState()

  const { childrenData, waitingChildrenData, experienceChildrenData } = useChildrenList()
  const { addProfessionalSupportNewTab } = useTabs()

  const [selectedChildData, setSelectedChildData] = useState(null)
  const [isUIEnabled, setIsUIEnabled] = useState(false)

  // store への column5/6 保存
  useEffect(() => {
    console.log("---- ChildMemoPanel: attendanceData 更新 ----")
    console.log("SELECT_CHILD:", SELECT_CHILD)
    console.log("attendanceData:", attendanceData)

    // データがない
    if (!SELECT_CHILD || !attendanceData?.data) {
      console.log("⚠ データなし → UI 無効")
      setIsUIEnabled(false)
      setSelectedChildColumns({
        column5: null,
        column5Html: null,
        column6: null,
        column6Html: null
      })
      return
    }

    const attendanceItem = attendanceData.data.find(
      item => item.children_id === String(SELECT_CHILD)
    )

    console.log("attendanceItem:", attendanceItem)
    console.log("UI 有効？:", !!attendanceItem)

    setIsUIEnabled(!!attendanceItem)

    if (attendanceItem) {
      setSelectedChildColumns({
        column5: attendanceItem.column5 || null,
        column5Html: attendanceItem.column5Html || null,
        column6: attendanceItem.column6 || null,
        column6Html: attendanceItem.column6Html || null
      })
    } else {
      setSelectedChildColumns({
        column5: null,
        column5Html: null,
        column6: null,
        column6Html: null
      })
    }
  }, [SELECT_CHILD, attendanceData, setSelectedChildColumns])

  // 子どもデータの取得
  useEffect(() => {
    if (!SELECT_CHILD) {
      setSelectedChildData(null)
      return
    }

    const child =
      childrenData.find(c => c.children_id === SELECT_CHILD) ||
      waitingChildrenData.find(c => c.children_id === SELECT_CHILD) ||
      experienceChildrenData.find(c => c.children_id === SELECT_CHILD)

    setSelectedChildData(child || null)
  }, [SELECT_CHILD, childrenData, waitingChildrenData, experienceChildrenData])

  // 表示されていない場合
  if (!SELECT_CHILD || !selectedChildData) {
    return (
      <div className="child-memo-panel flex-1 border-l bg-gray-50 p-4 overflow-y-auto">
        <div className="text-sm text-gray-500 text-center mt-8">
          要素を選択してください
        </div>
      </div>
    )
  }

  const column5 = SELECTED_CHILD_COLUMN5
  const column5Html = SELECTED_CHILD_COLUMN5_HTML
  const column6 = SELECTED_CHILD_COLUMN6
  const column6Html = SELECTED_CHILD_COLUMN6_HTML

  const isTimeFormat = (value) => /^\d{2}:\d{2}$/.test(value || "")
  const hasBothEnterAndAbsent = (value) => {
    const v = (value || "").replace(/\s+/g, " ")
    return v.includes("入室") && v.includes("欠席")
  }

  return (
    <div className="child-memo-panel flex-1 border-l border-gray-300 bg-gray-50 p-4 overflow-y-auto flex flex-col h-full">

      {/* 子ども情報 */}
      <div className="bg-white text-center p-2">
        <h3 className="text-sm font-bold text-gray-700 mb-2">
          {selectedChildData.children_id}: {selectedChildData.children_name}
        </h3>
        {selectedChildData.pc_name && (
          <p className="text-xs text-gray-600 mb-2">
            PC名: {selectedChildData.pc_name}
          </p>
        )}
      </div>

      {/* 入退室 UI */}
      <div
        className="flex flex-col mt-2 mb-4 pb-4 border-b border-gray-300"
        style={{
          pointerEvents: isUIEnabled ? "auto" : "none",
          opacity: isUIEnabled ? 1 : 0.5,
          transition: "opacity 0.2s"
        }}
      >
        {column5 === "欠席" || column5 === "欠席(欠席時対応加算を取らない)" ? (
          <div className="text-xs font-bold text-red-600 mb-3">欠席</div>
        ) : hasBothEnterAndAbsent(column5) ? (
          <>
            <button
              className="btn-blue p-2 w-[80px]"
              onClick={() => clickEnterButton(column5Html)}
              disabled={!isUIEnabled}
            >
              入室
            </button>

            <button
              className="btn-red mt-2 p-2 w-[80px]"
              onClick={() => clickAbsenceButton(column5Html)}
              disabled={!isUIEnabled}
            >
              欠席
            </button>
          </>
        ) : isTimeFormat(column5) ? (
          <>
            <div className="">入室: {column5}</div>

            {isTimeFormat(column6) ? (
              <div className="mt-2">退室: {column6}</div>
            ) : (
              <button
                className="btn-green mt-4"
                onClick={() => clickExitButton(column5Html)}
                disabled={!isUIEnabled}
              >
                退室
              </button>
            )}

            {isTimeFormat(column5) && isTimeFormat(column6) && (
              <button
                className="btn-purple mt-4 p-2"
                onClick={addProfessionalSupportNewTab}
                disabled={!isUIEnabled}
              >
                専門的支援
              </button>
            )}
          </>
        ) : (
          <>
            <button
              className="btn-blue p-2 w-[80px]"
              onClick={() => clickEnterButton(column5Html)}
              disabled={!isUIEnabled}
            >
              入室
            </button>

            <button
              className="btn-green mt-2 p-2 w-[80px]"
              onClick={() => clickExitButton(column5Html)}
              disabled={!isUIEnabled}
            >
              退出
            </button>
          </>
        )}

        {/* AI + メモツール */}
        <div className="mt-4 border-t border-gray-300 pt-3">
          <MemoContainer />
        </div>
      </div>

    </div>
  )
}

export default ChildMemoPanel
