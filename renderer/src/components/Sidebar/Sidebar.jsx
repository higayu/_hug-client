import { useDispatch, useSelector } from "react-redux"
import { useEffect, useRef, useState } from 'react'
import { useAppState } from '@/contexts/AppStateContext.jsx'
import { getWeekdayFromDate, getDateString } from '@/utils/dateUtils.js'
import { useToast } from '@/components/common/ToastContext.jsx'
import TabsContainer from './common/TabsContainer.jsx'
import TableDataGetButton from './common/TableDataGetButon.jsx'

function Sidebar() {
  const { showInfoToast } = useToast()
  const { setDate, setWeekday, DATE_STR, WEEK_DAY } = useAppState()
  const dispatch = useDispatch()

  // 🔥 DB(day_of_week)から曜日データを取得（label_jpを使用）
  const weekdayList = useSelector(state => state.sqlite?.day_of_week ?? [])

  const initialDate = DATE_STR || getDateString()
  const initialWeekday = WEEK_DAY || getWeekdayFromDate(initialDate)

  const [dateValue, setDateValue] = useState(initialDate)
  const [weekdayValue, setWeekdayValue] = useState(initialWeekday)
  const [isPinned, setIsPinned] = useState(false)
  const sidebarRef = useRef(null)

  // 📅 日付変更イベント
  const handleDateChange = (e) => {
    const selectedDate = e.target.value
    if (selectedDate) {
      const weekday = getWeekdayFromDate(selectedDate)
      setDateValue(selectedDate)
      setDate(selectedDate)

      showInfoToast(`📅 日付を ${selectedDate} (${weekday}) に設定しました`)

      window.dispatchEvent(
        new CustomEvent('date-changed', {
          detail: { date: selectedDate, weekday }
        })
      )
    }
  }

  // 📅 曜日変更イベント
  const handleWeekdayChange = (e) => {
    const selectedWeekday = e.target.value
    setWeekday(selectedWeekday)
    setWeekdayValue(selectedWeekday)

    showInfoToast(`📅 曜日を ${selectedWeekday} に設定しました`)
  }

  // 初期化
  useEffect(() => {
    if (!DATE_STR) {
      const today = getDateString()
      const weekday = getWeekdayFromDate(today)
      setDate(today)
      setWeekday(weekday)
      setDateValue(today)
      setWeekdayValue(weekday)
    }
  }, [])

  // 曜日変更をイベントとして通知
  useEffect(() => {
    if (weekdayValue) {
      window.dispatchEvent(new Event('weekday-changed'))
    }
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

        {/* 🔥 曜日 Select（day_of_week テーブルから動的生成） */}
        <div className="date-weekday-section flex-1 flex flex-col">
          <label className="font-bold text-sm text-black mt-2.5 mb-1.5">
            曜日別（対応児童）:
          </label>

          <select
            id="weekdaySelect"
            name="weekdaySelect"
            value={weekdayValue}
            onChange={handleWeekdayChange}
            className="w-full p-2 border border-gray-300 rounded text-sm bg-white text-black"
          >
            {weekdayList.length > 0 ? (
              weekdayList
                .sort((a, b) => a.sort_order - b.sort_order) // ← ソート順を DB の sort_order に合わせる
                .map((w) => (
                  <option key={w.id} value={w.label_jp}>
                    {w.label_jp}
                  </option>
                ))
            ) : (
              // DBロード前フォールバック
              <>
                <option value="日">日</option>
                <option value="月">月</option>
                <option value="火">火</option>
                <option value="水">水</option>
                <option value="木">木</option>
                <option value="金">金</option>
                <option value="土">土</option>
              </>
            )}
          </select>
        </div>

        {/* 📌 固定ボタン */}
        <button
          onClick={() => setIsPinned(!isPinned)}
          className={`p-1.5 rounded ${
            isPinned ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
          }`}
        >
          {isPinned ? '📌' : '📍'}
        </button>

        <TableDataGetButton />
      </div>

      {/* メインコンテンツ */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <TabsContainer />
      </div>
    </div>
  )
}

export default Sidebar
