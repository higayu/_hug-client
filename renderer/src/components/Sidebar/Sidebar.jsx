
import { useEffect, useRef, useState } from "react"
import { useChildrenList } from "@/hooks/useChildrenList.js"
import { useAppState } from "@/contexts/appState"
import {
  getWeekdayIdFromDate,
  getDateString,
} from "@/utils/dateUtils.js"
import { useToast } from "@/components/common/ToastContext.jsx"
import TabsContainer from "./common/TabsContainer.jsx"
import TableDataGetButton from "./common/TableDataGetButon.jsx"
import WeekdaySelect from "@/components/common/WeekdaySelect.jsx"

function Sidebar() {
  const { showInfoToast } = useToast()

  // ✅ AppState（唯一の正）
  const { setCurrentDate, CURRENT_DATE } = useAppState()

  // 再取得（手動）
  const { loadChildren } = useChildrenList()

  const sidebarRef = useRef(null)
  const [isPinned, setIsPinned] = useState(false)

  const initialDate = CURRENT_DATE.dateStr || getDateString()

  // =============================================================
  // 初期化（日付・曜日ID）
  // =============================================================
  useEffect(() => {
    // dateStr 未設定 → 今日
    if (!CURRENT_DATE.dateStr) {
      setCurrentDate({ dateStr: initialDate })
    }

    // weekdayId 未設定 → dateStr から算出
    if (!CURRENT_DATE.weekdayId) {
      const weekdayId = getWeekdayIdFromDate(initialDate)
      setCurrentDate({ weekdayId })
    }
  }, [CURRENT_DATE.dateStr, CURRENT_DATE.weekdayId, initialDate, setCurrentDate])

  // =============================================================
  // 日付変更
  // =============================================================
  const handleDateChange = (e) => {
    const selectedDate = e.target.value
    if (!selectedDate) return

    const weekdayId = getWeekdayIdFromDate(selectedDate)

    setCurrentDate({
      dateStr: selectedDate,
      weekdayId,
    })

    showInfoToast(`📅 日付を ${selectedDate} に設定しました`)
  }

  // =============================================================
  // JSX
  // =============================================================
  return (
    <div ref={sidebarRef} className="text-black bg-gray-50 flex flex-col h-full">
      {/* ヘッダー */}
      <div className="sidebar-header flex-shrink-0 pb-2.5 border-b border-gray-200 mb-2.5 flex gap-5 items-start">
        {/* 日付入力 */}
        <div className="date-weekday-section flex-1 flex flex-col">
          <label className="font-bold text-sm text-black mt-2.5 mb-1.5">
            日付:（個人記録）
          </label>
          <input
            type="date"
            value={CURRENT_DATE.dateStr ?? ""}
            onChange={handleDateChange}
            className="w-full p-2 border border-gray-300 rounded text-sm bg-white text-black max-w-[200px] cursor-pointer"
          />
        </div>

        {/* 曜日 Select（完全委譲） */}
        <div className="date-weekday-section flex-1 flex flex-col">
          <label className="font-bold text-sm text-black mt-2.5 mb-1.5">
            曜日別（対応児童）:
          </label>
          <WeekdaySelect />
        </div>

        {/* 固定ボタン */}
        <button
          onClick={() => setIsPinned(!isPinned)}
          className={`p-1.5 rounded ${
            isPinned ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-600"
          }`}
        >
          {isPinned ? "📌" : "📍"}
        </button>

        <div className="flex flex-col gap-1 items-start">
          <TableDataGetButton />
          <button
            className="mt-1 px-2 py-1 text-xs rounded bg-blue-500 text-white"
            onClick={loadChildren}
          >
            再取得
          </button>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <TabsContainer />
      </div>
    </div>
  )
}

export default Sidebar
