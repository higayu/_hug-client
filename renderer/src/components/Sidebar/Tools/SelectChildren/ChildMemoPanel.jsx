// src/components/Sidebar/ChildMemoPanel.jsx
import { useEffect, useState } from 'react'
import { useAppState } from '@/contexts/appState'
import { useChildrenList } from '@/hooks/useChildrenList.js'
import { useTabs } from '@/hooks/useTabs/index.js'
import {
  clickEnterButton,
  clickAbsenceButton,
  clickExitButton
} from '@/utils/attendanceButtonClick.js'

function ChildMemoPanel() {
  const {
    appState,
    attendanceData,
    setSelectedChildColumns,
    DEBUG_FLG,
  } = useAppState()

  const IS_STOP = !DEBUG_FLG // まだ不完全のため停止
  const SELECT_CHILD = appState.SELECT_CHILD

  const {
    childrenData,
    waitingChildrenData,
    experienceChildrenData
  } = useChildrenList()

  const { addProfessionalSupportNewTab } = useTabs()

  const [selectedChildData, setSelectedChildData] = useState(null)
  const [attendanceItem, setAttendanceItem] = useState(null)
  const [isUIEnabled, setIsUIEnabled] = useState(false)

  /* ===============================
   * 出欠データ解決
   * =============================== */
  useEffect(() => {
    if (!SELECT_CHILD) {
      setAttendanceItem(null)
      setIsUIEnabled(false)
      setSelectedChildColumns({
        column5: null,
        column5Html: null,
        column6: null,
        column6Html: null
      })
      return
    }

    const list = attendanceData?.data
    if (!Array.isArray(list)) {
      setAttendanceItem(null)
      setIsUIEnabled(false)
      return
    }

    const item = list.find(
      i => String(i.children_id) === String(SELECT_CHILD)
    )

    setAttendanceItem(item || null)
    setIsUIEnabled(!!item)

    if (item) {
      setSelectedChildColumns({
        column5: item.column5 ?? null,
        column5Html: item.column5Html ?? null,
        column6: item.column6 ?? null,
        column6Html: item.column6Html ?? null
      })
    }
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
   * UI判定
   * =============================== */
  const column5 = attendanceItem?.column5 ?? null
  const column5Html = attendanceItem?.column5Html ?? null
  const column6 = attendanceItem?.column6 ?? null
  const column6Html = attendanceItem?.column6Html ?? null

  const isTimeFormat = (v) => /^\d{2}:\d{2}$/.test(v || '')

  // ★ 修正ポイント：欠席系をすべて拾う
  const isAbsent =
    typeof column5 === 'string' && column5.startsWith('欠席')

  const hasEntered = isTimeFormat(column5)
  const hasExited = isTimeFormat(column6)

  const disabledBtnClass = 'grayscale opacity-50 cursor-not-allowed'

  /* ===============================
   * Render
   * =============================== */
  return (
    <div className="child-memo-panel flex-1 min-h-0 border-l border-gray-300 bg-gray-50 flex flex-col">

      {/* スクロール領域 */}
      <div className="flex-1 min-h-0 overflow-y-auto p-2">
        <div
          className={`flex flex-col rounded bg-gray-200 gap-2 p-2 ${
            !isUIEnabled ? 'opacity-60' : ''
          }`}
        >
          {isAbsent ? (
            <div className="text-xs font-bold text-red-600">
              {column5}
            </div>
          ) : hasEntered ? (
            <>
              <div>入室: {column5}</div>

              {hasExited && (
                <div>退室: {column6}</div>
              )}

              {!hasExited && (
                <button
                  className={`btn-green mt-2 ${
                    !isUIEnabled || IS_STOP ? disabledBtnClass : ''
                  }`}
                  onClick={() => clickExitButton(column6Html)}
                  disabled={!isUIEnabled || IS_STOP}
                >
                  退室
                </button>
              )}

              {hasExited && (
                <button
                  className={`btn-purple mt-2 p-2 ${
                    !isUIEnabled ? disabledBtnClass : ''
                  }`}
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
                className={`btn-blue p-2 w-[80px] ${
                  !isUIEnabled || IS_STOP ? disabledBtnClass : ''
                }`}
                onClick={() => clickEnterButton(column5Html)}
                disabled={!isUIEnabled || IS_STOP}
              >
                入室
              </button>

              <button
                className={`btn-red mt-2 p-2 w-[80px] ${
                  !isUIEnabled || IS_STOP ? disabledBtnClass : ''
                }`}
                onClick={() => clickAbsenceButton(column5Html)}
                disabled={!isUIEnabled || IS_STOP}
              >
                欠席
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ChildMemoPanel
