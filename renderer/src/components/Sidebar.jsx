import { useEffect, useRef, useState } from 'react'
import { AppState, getWeekdayFromDate, getDateString } from '../../modules/config/config.js'
import { showInfoToast } from '../../modules/ui/toast/toast.js'
import { ELEMENT_IDS } from '../../modules/config/const.js'
import SidebarContent from './SidebarContent.jsx'

function Sidebar() {
  // 初期値を設定（AppStateに値がない場合は今日の日付を使用）
  const initialDate = AppState.DATE_STR || getDateString()
  const initialWeekday = AppState.WEEK_DAY || getWeekdayFromDate(initialDate)
  
  const [dateValue, setDateValue] = useState(initialDate)
  const [weekdayValue, setWeekdayValue] = useState(initialWeekday)
  const sidebarRef = useRef(null)

  // 日付変更時の処理
  const handleDateChange = (e) => {
    const selectedDate = e.target.value
    console.log("📅 日付が変更されました:", selectedDate)
    
    if (selectedDate) {
      AppState.DATE_STR = selectedDate
      const weekday = getWeekdayFromDate(selectedDate)
      AppState.WEEK_DAY = weekday
      setDateValue(selectedDate)
      setWeekdayValue(weekday)
      showInfoToast(`📅 日付を ${selectedDate} (${weekday}) に設定しました`)
      console.log("✅ 日付と曜日を更新:", { date: selectedDate, weekday })
      
      // 日付変更イベントを発行（他のコンポーネントに通知）
      window.dispatchEvent(new CustomEvent('date-changed', { 
        detail: { date: selectedDate, weekday } 
      }))
      
      // 曜日も変更されたので、曜日変更イベントも発行
      window.dispatchEvent(new Event('weekday-changed'))
    }
  }

  // 曜日変更時の処理
  const handleWeekdayChange = (e) => {
    const selectedWeekday = e.target.value
    console.log("📅 曜日が変更されました:", selectedWeekday)
    
    AppState.WEEK_DAY = selectedWeekday
    setWeekdayValue(selectedWeekday)
    showInfoToast(`📅 曜日を ${selectedWeekday} に設定しました`)
    console.log("✅ 曜日を更新:", selectedWeekday)
    
    // childrenList.jsのロジックをトリガー（loadChildren()を呼び出す）
    window.dispatchEvent(new Event('weekday-changed'))
  }

  // 初期化時にAppStateから値を取得し、初期値がない場合は設定
  useEffect(() => {
    if (!AppState.DATE_STR) {
      const today = getDateString()
      AppState.DATE_STR = today
      AppState.WEEK_DAY = getWeekdayFromDate(today)
      setDateValue(today)
      setWeekdayValue(AppState.WEEK_DAY)
    } else {
      setDateValue(AppState.DATE_STR)
      if (AppState.WEEK_DAY) {
        setWeekdayValue(AppState.WEEK_DAY)
      }
    }
  }, [])

  return (
    <div ref={sidebarRef} className="text-black bg-gray-50 flex flex-col h-full">
      {/* 固定ヘッダー部分（スクロールしない） */}
      <div className="sidebar-header flex-shrink-0 pb-2.5 border-b border-gray-200 mb-2.5 flex gap-5 items-start">
        {/* 🌟 日付選択 */}
        <div className="date-weekday-section flex-1 flex flex-col">
          <label htmlFor="dateSelect" className="block my-2.5 mt-2.5 mb-1.5 font-bold text-black text-sm">
            日付:（個人記録）
          </label>
          <input
            type="date"
            id="dateSelect"
            value={dateValue}
            onChange={handleDateChange}
            className="w-full p-2 my-1.5 border border-gray-300 rounded text-sm text-black bg-white max-w-[200px]"
          />
        </div>

        {/* 🌟 曜日選択セレクトボックス */}
        <div className="date-weekday-section flex-1 flex flex-col">
          <label htmlFor="weekdaySelect" className="block my-2.5 mt-2.5 mb-1.5 font-bold text-black text-sm">
            曜日別（対応児童）:
          </label>
          <select
            id="weekdaySelect"
            name="weekdaySelect"
            value={weekdayValue}
            onChange={handleWeekdayChange}
            className="js_weekday w-full p-2 my-1.5 border border-gray-300 rounded text-sm bg-white text-black"
          >
            <option value="日">日</option>
            <option value="月">月</option>
            <option value="火">火</option>
            <option value="水">水</option>
            <option value="木">木</option>
            <option value="金">金</option>
            <option value="土">土</option>
          </select>
        </div>
      </div>

      {/* スクロール可能なコンテンツ部分 */}
      <SidebarContent />
    </div>
  )
}

export default Sidebar

