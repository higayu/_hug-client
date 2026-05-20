
import { useEffect, useRef, useState } from "react"
import { useChildrenList } from "@/hooks/useChildrenList.js"
import { useAppState } from "@/contexts/appState"
import {
  getWeekdayIdFromDate,
  getDateString,
} from "@/utils/dateUtils.js"
import {
  getTodayYmdString,
} from "@/utils/dateYMD.js"
import { useToast } from "@/components/common/ToastContext.jsx"
import TabsContainer from "./common/TabsContainer.jsx"
import TableDataGetButton from "./common/TableDataGetButon.jsx"
import WeekdaySelect from "@/components/common/WeekdaySelect.jsx"

function Sidebar() {
  const { showInfoToast } = useToast()

  // ✅ AppState（唯一の正）
  // 変更後
  const {
    CURRENT_DAY_OF_WEEK,        // 曜日専用
    CURRENT_YMD,         // '2025-11-20'
    setCurrentDate,
    setCurrentYmd,
    DEBUG_FLG,
  } = useAppState()

  const { loadChildren } = useChildrenList()

  const sidebarRef = useRef(null)
  const [isPinned, setIsPinned] = useState(false)

  // =============================================================
  // 初期化（日付・曜日ID）
  // =============================================================
  useEffect(() => {
    // 年月日が未設定 → 今日
    if (!CURRENT_YMD) {
      const today = getTodayYmdString()
  
      console.log("[INIT] CURRENT_YMD が未設定のため今日をセット:", today)

      console.log("today:", today, typeof today)
  
      setCurrentYmd(today)
      console.log("CURRENT_YMD:", CURRENT_YMD, typeof CURRENT_YMD)
      
      const weekdayId = getWeekdayIdFromDate(today)
  
      console.log("[INIT] 今日の日付から weekdayId を算出:", weekdayId)
  
      setCurrentDate({ weekdayId })
      return
    }
  
    // 年月日があるのに weekdayId がない場合
    if (CURRENT_YMD && CURRENT_DAY_OF_WEEK.weekdayId == null) {
      const weekdayId = getWeekdayIdFromDate(CURRENT_YMD)
  
      console.log(
        "[INIT] CURRENT_YMD はあるが weekdayId が未設定。再計算:",
        { CURRENT_YMD, weekdayId }
      )
  
      setCurrentDate({ weekdayId })
    }
  }, [CURRENT_YMD, CURRENT_DAY_OF_WEEK.weekdayId, setCurrentDate, setCurrentYmd])
  


  // =============================================================
  // 日付変更
  // =============================================================
  const handleDateChange = (e) => {
    const selectedDate = e.target.value // 'YYYY-MM-DD'
    if (!selectedDate) return
  
    console.log("[DATE CHANGE] ユーザーが日付を変更:", selectedDate)
  
    // ① 年月日を更新
    setCurrentYmd(selectedDate)
  
    showInfoToast(`📅 日付を ${selectedDate} に設定しました`)
  }
  


  // =============================================================
  // JSX
  // =============================================================
  return (
    <div ref={sidebarRef} className="text-black bg-gray-50 flex flex-col h-full">

    
    {/* ヘッダー */}
    <div
      className="
        sidebar-header
        flex-shrink-0
        p-2
        border border-gray-200
        flex items-start
        max-h-none overflow-visible
        rounded
        justify-center
      "
    >

      {/* 日付と曜日 */}
      <div className="flex gap-6 bg-gray-200 w-[70%] justify-center">
        {/* 日付入力 */}
        <div className="flex flex-col items-center justify-center">
          <label className="font-bold text-sm text-black mb-1.5">
            日付:（個人記録）
          </label>
          <input
            type="date"
            value={CURRENT_YMD ?? ""}
            onChange={handleDateChange}
            className="w-full max-w-[200px] p-2 border border-gray-300 rounded text-sm bg-white text-black cursor-pointer"
          />
        </div>

        {/* 曜日 */}
        <div className="flex flex-col items-center justify-center">
          <label className="font-bold text-sm text-black mb-1.5">
            曜日別：（対応児童）
          </label>
          <WeekdaySelect />
        </div>
      </div>

      {/* サブボタン群 */}
      <div className="flex flex-col gap-2 bg-sky-100 w-[30%] items-center">
      {DEBUG_FLG && (
        <div className="flex gap-2 bg-sky-400 justify-center">

            <button
              onClick={() => setIsPinned(!isPinned)}
              className={`px-1.5 py-0.5 rounded ${
                isPinned ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-600"
              }`}
            >
              {isPinned ? "📌" : "📍"}
            </button>


          <button
            className="px-2 py-1 text-xs rounded bg-blue-500 text-white"
            onClick={loadChildren}
          >
            再取得
          </button>
        </div>
      )}

        <TableDataGetButton />


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
