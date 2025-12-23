import { useDispatch, useSelector } from "react-redux"
import { useEffect, useRef, useState } from "react"
import { useChildrenList } from "@/hooks/useChildrenList.js"
import { useAppState } from "@/contexts/appState"
import { getWeekdayFromDate, getDateString } from "@/utils/dateUtils.js"
import { useToast } from "@/components/common/ToastContext.jsx"
import TabsContainer from "./common/TabsContainer.jsx"
import TableDataGetButton from "./common/TableDataGetButon.jsx"

function Sidebar() {
  const { showInfoToast } = useToast()

  // ✅ Redux / AppState（唯一の正）
  const { setCurrentDate, CURRENT_DATE } = useAppState()

  // 再取得
  const { loadChildren } = useChildrenList()
  const dispatch = useDispatch()

  // 🔥 day_of_week マスタ（DB）
  const dayOfWeekList = useSelector(
    (state) => state.database?.day_of_week ?? []
  )

  const sidebarRef = useRef(null)
  const [isPinned, setIsPinned] = useState(false)

  const initialDate = CURRENT_DATE.dateStr || getDateString()

  // =============================================================
  // 初期化（日付・曜日ID）
  // =============================================================
  useEffect(() => {
    if (!dayOfWeekList.length) return

    // weekdayId 未設定 → dateStr から決定
    if (!CURRENT_DATE.weekdayId) {
      const label = getWeekdayFromDate(initialDate)
      const weekdayObj =
        dayOfWeekList.find((w) => w.label_jp === label) ??
        dayOfWeekList[0]

      setCurrentDate({ weekdayId: weekdayObj.id })
    }

    // dateStr 未設定 → 今日
    if (!CURRENT_DATE.dateStr) {
      setCurrentDate({ dateStr: initialDate })
    }
  }, [dayOfWeekList])

  // =============================================================
  // 日付変更
  // =============================================================
  const handleDateChange = (e) => {
    const selectedDate = e.target.value
    if (!selectedDate) return

    const weekdayLabel = getWeekdayFromDate(selectedDate)
    const weekdayObj =
      dayOfWeekList.find((w) => w.label_jp === weekdayLabel) ??
      dayOfWeekList[0]

    setCurrentDate({
      dateStr: selectedDate,
      weekdayId: weekdayObj.id,
    })

    showInfoToast(
      `📅 日付を ${selectedDate}（${weekdayObj.label_jp}）に設定しました`
    )

    window.dispatchEvent(
      new CustomEvent("date-changed", {
        detail: {
          date: selectedDate,
          weekdayId: weekdayObj.id,
          weekdayLabel: weekdayObj.label_jp,
        },
      })
    )
  }

  // =============================================================
  // 曜日変更（Select）
  // =============================================================
  const handleWeekdayChange = (e) => {
    const selectedId = Number(e.target.value)
    const selectedObj = dayOfWeekList.find((w) => w.id === selectedId)
    if (!selectedObj) return

    setCurrentDate({ weekdayId: selectedObj.id })

    showInfoToast(`📅 曜日を ${selectedObj.label_jp} に設定しました`)
  }

  // =============================================================
  // 曜日変更イベント通知（id + label）
  // =============================================================
  useEffect(() => {
    if (!CURRENT_DATE.weekdayId || !dayOfWeekList.length) return

    const weekdayObj = dayOfWeekList.find(
      (w) => w.id === CURRENT_DATE.weekdayId
    )

    window.dispatchEvent(
      new CustomEvent("weekday-changed", {
        detail: {
          weekdayId: CURRENT_DATE.weekdayId,
          weekdayLabel: weekdayObj?.label_jp,
        },
      })
    )
  }, [CURRENT_DATE.weekdayId, dayOfWeekList])

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

        {/* 曜日 Select */}
        <div className="date-weekday-section flex-1 flex flex-col">
          <label className="font-bold text-sm text-black mt-2.5 mb-1.5">
            曜日別（対応児童）:
          </label>

          <select
            id="weekdaySelect"
            name="weekdaySelect"
            value={CURRENT_DATE.weekdayId ?? ""}
            onChange={handleWeekdayChange}
            className="w-full p-2 border border-gray-300 rounded text-sm bg-white text-black"
          >
            {dayOfWeekList
              .slice()
              .sort((a, b) => a.sort_order - b.sort_order)
              .map((w) => (
                <option key={w.id} value={w.id}>
                  {w.label_jp}
                </option>
              ))}
          </select>
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
