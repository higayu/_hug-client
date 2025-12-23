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

  // appState（既存互換のため label_jp も維持）
  const { setDate, setWeekday, DATE_STR, WEEK_DAY } = useAppState()

  // 再取得
  const { loadChildren } = useChildrenList()
  const dispatch = useDispatch()

  // 🔥 day_of_week マスタ（DB）
  const dayOfWeekList = useSelector(
    (state) => state.database?.day_of_week ?? []
  )

  const initialDate = DATE_STR || getDateString()

  // -----------------------------
  // state
  // -----------------------------
  const [dateValue, setDateValue] = useState(initialDate)

  // 🔥 曜日は「オブジェクトごと」保持
  const [weekdayValue, setWeekdayValue] = useState(null)

  const [isPinned, setIsPinned] = useState(false)
  const sidebarRef = useRef(null)

  // -----------------------------
  // 初期化（日付・曜日）
  // -----------------------------
  useEffect(() => {
    if (!dayOfWeekList.length) return

    const weekdayLabel = WEEK_DAY || getWeekdayFromDate(initialDate)

    const weekdayObj =
      dayOfWeekList.find((w) => w.label_jp === weekdayLabel) ??
      dayOfWeekList[0]

    setWeekdayValue(weekdayObj)
    setWeekday(weekdayObj.label_jp)

    if (!DATE_STR) {
      setDate(initialDate)
    }
  }, [dayOfWeekList])

  // -----------------------------
  // 日付変更
  // -----------------------------
  const handleDateChange = (e) => {
    const selectedDate = e.target.value
    if (!selectedDate) return

    const weekdayLabel = getWeekdayFromDate(selectedDate)
    const weekdayObj =
      dayOfWeekList.find((w) => w.label_jp === weekdayLabel) ??
      dayOfWeekList[0]

    setDateValue(selectedDate)
    setDate(selectedDate)

    setWeekdayValue(weekdayObj)
    setWeekday(weekdayObj.label_jp)

    showInfoToast(`📅 日付を ${selectedDate}（${weekdayObj.label_jp}）に設定しました`)

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

  // -----------------------------
  // 曜日変更（Select）
  // -----------------------------
  const handleWeekdayChange = (e) => {
    const selectedId = Number(e.target.value)
    const selectedObj = dayOfWeekList.find((w) => w.id === selectedId)
    if (!selectedObj) return

    setWeekdayValue(selectedObj)
    setWeekday(selectedObj.label_jp)

    showInfoToast(`📅 曜日を ${selectedObj.label_jp} に設定しました`)
  }

  // -----------------------------
  // 曜日変更イベント通知（id + label）
  // -----------------------------
  useEffect(() => {
    if (!weekdayValue) return

    window.dispatchEvent(
      new CustomEvent("weekday-changed", {
        detail: {
          weekdayId: weekdayValue.id,
          weekdayLabel: weekdayValue.label_jp,
        },
      })
    )
  }, [weekdayValue])

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
            value={dateValue}
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
            value={weekdayValue?.id ?? ""}
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
