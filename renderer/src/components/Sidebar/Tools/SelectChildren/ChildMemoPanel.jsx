// src/components/Sidebar/ChildMemoPanel.jsx
import { useEffect, useState } from 'react'
import { useAppState } from '@/contexts/appState'
import { useChildrenList } from '@/hooks/useChildrenList.js'
import { useTabs } from '@/hooks/useTabs/index.js'
import {
  clickEnterButton,
  clickAbsenceButton,
  clickExitButton
} from '@/utils/attendanceButtonClick.js';

function ChildMemoPanel() {
  const {
    appState,
    attendanceData,
    setSelectedChildColumns
  } = useAppState()

  const SELECT_CHILD = appState.SELECT_CHILD

  const { childrenData, waitingChildrenData, experienceChildrenData } =
    useChildrenList()
  const { addProfessionalSupportNewTab } = useTabs()

  const [selectedChildData, setSelectedChildData] = useState(null)
  const [attendanceItem, setAttendanceItem] = useState(null)
  const [isUIEnabled, setIsUIEnabled] = useState(false)

  /* ===============================
   * 出欠データ解決
   * =============================== */
  useEffect(() => {
    console.group('🧩 [ChildMemoPanel] attendance 判定')

    if (!SELECT_CHILD) {
      setAttendanceItem(null)
      setIsUIEnabled(false)
      setSelectedChildColumns({
        column5: null,
        column5Html: null,
        column6: null,
        column6Html: null
      })
      console.groupEnd()
      return
    }

    const list = attendanceData?.data
    if (!Array.isArray(list)) {
      console.warn('❌ attendanceData.data が配列ではない')
      setAttendanceItem(null)
      setIsUIEnabled(false)
      console.groupEnd()
      return
    }

    const item = list.find(
      i => String(i.children_id) === String(SELECT_CHILD)
    )

    console.log('attendanceItem:', item)

    setAttendanceItem(item || null)
    setIsUIEnabled(!!item)

    if (item) {
      // Redux には保存だけする（UIは直接参照しない）
      setSelectedChildColumns({
        column5: item.column5 ?? null,
        column5Html: item.column5Html ?? null,
        column6: item.column6 ?? null,
        column6Html: item.column6Html ?? null
      })
    }

    console.groupEnd()
  }, [SELECT_CHILD, attendanceData, setSelectedChildColumns])

  /* ===============================
   * 子どもデータ解決
   * =============================== */
  useEffect(() => {
    if (!SELECT_CHILD) {
      setSelectedChildData(null)
      return
    }

    const child =
      childrenData.find(c => String(c.children_id) === String(SELECT_CHILD)) ||
      waitingChildrenData.find(c => String(c.children_id) === String(SELECT_CHILD)) ||
      experienceChildrenData.find(c => String(c.children_id) === String(SELECT_CHILD))

    setSelectedChildData(child || null)
  }, [SELECT_CHILD, childrenData, waitingChildrenData, experienceChildrenData])

  /* ===============================
   * 未選択表示
   * =============================== */
  if (!SELECT_CHILD || !selectedChildData) {
    return (
      <div className="child-memo-panel flex-1 border-l bg-gray-50 p-4 overflow-y-auto">
        <div className="text-sm text-gray-500 text-center mt-8">
          要素を選択してください
        </div>
      </div>
    )
  }

  /* ===============================
   * UI判定（attendanceItemのみ）
   * =============================== */
  const column5 = attendanceItem?.column5 ?? null
  const column5Html = attendanceItem?.column5Html ?? null
  const column6 = attendanceItem?.column6 ?? null
  const column6Html = attendanceItem?.column6Html ?? null

  const isTimeFormat = (v) => /^\d{2}:\d{2}$/.test(v || '')
  const isAbsent = column5 === '欠席'
  const hasEntered = isTimeFormat(column5)
  const hasExited = isTimeFormat(column6)

  /* ===============================
   * Render
   * =============================== */
  return (
    <div className="child-memo-panel flex-1 border-l border-gray-300 bg-gray-50 overflow-y-auto flex flex-col h-full">
      {/* 子ども情報 */}
      <div className="bg-white text-center rounded p-2 mb-2">
        <h3 className="text-sm font-bold text-gray-700 m-2">
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
        className="flex flex-col rounded bg-gray-200 mb-1 p-2 gap-2"
        style={{
          pointerEvents: isUIEnabled ? 'auto' : 'none',
          opacity: isUIEnabled ? 1 : 0.5,
          transition: 'opacity 0.2s'
        }}
      >
        {isAbsent ? (
          <div className="text-xs font-bold text-red-600 mb-3">欠席</div>
        ) : hasEntered ? (
          <>
            <div>入室: {column5}</div>

            {hasExited ? (
              <div className="mt-2">退室: {column6}</div>
            ) : (
              <button
                className="btn-green mt-4"
                onClick={() => clickExitButton(column6Html)}
                disabled={!isUIEnabled}
              >
                退室
              </button>
            )}

            {hasExited && (
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
              className="btn-red mt-2 p-2 w-[80px]"
              onClick={() => clickAbsenceButton(column5Html)}
              disabled={!isUIEnabled}
            >
              欠席
            </button>
          </>
        )}
      </div>

    </div>
  )
}

export default ChildMemoPanel
