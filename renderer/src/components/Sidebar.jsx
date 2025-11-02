import { useEffect, useRef, useState } from 'react'
import { AppState, getWeekdayFromDate } from '../../modules/config/config.js'
import { showInfoToast } from '../../modules/ui/toast/toast.js'
import { ELEMENT_IDS } from '../../modules/config/const.js'

function Sidebar() {
  const [dateValue, setDateValue] = useState(AppState.DATE_STR || '')
  const [weekdayValue, setWeekdayValue] = useState(AppState.WEEK_DAY || '月')
  const [childrenCollapsed, setChildrenCollapsed] = useState(false)
  const [waitingCollapsed, setWaitingCollapsed] = useState(true)
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

  // 初期化時にAppStateから値を取得
  useEffect(() => {
    if (AppState.DATE_STR) {
      setDateValue(AppState.DATE_STR)
    }
    if (AppState.WEEK_DAY) {
      setWeekdayValue(AppState.WEEK_DAY)
    }
  }, [])

  // 対応児童リストの折りたたみ
  const toggleChildrenList = () => {
    setChildrenCollapsed(!childrenCollapsed)
  }

  // キャンセル待ちリストの折りたたみ
  const toggleWaitingList = () => {
    setWaitingCollapsed(!waitingCollapsed)
  }

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
      <div className="sidebar-content flex-1 overflow-y-auto overflow-x-hidden min-h-0">
        <div className="collapsible-section my-2.5">
          <label
            htmlFor="childrenList"
            onClick={toggleChildrenList}
            className="collapsible-header flex justify-between items-center cursor-pointer py-2 m-0 select-none transition-colors hover:bg-gray-100 rounded px-1"
            id="childrenHeader"
          >
            <span className="text-black">対応児童:</span>
            <span className={`toggle-icon text-xs transition-transform ${childrenCollapsed ? '-rotate-90' : ''}`}>
              ▼
            </span>
          </label>
          <ul
            id="childrenList"
            className={`collapsible-content list-none p-0 m-0 transition-all duration-300 ease-out ${
              childrenCollapsed
                ? 'max-h-0 opacity-0 overflow-hidden'
                : 'max-h-[5000px] opacity-100 overflow-y-visible'
            }`}
          ></ul>
        </div>

        <hr className="my-4 border-none border-t border-gray-200" />
        <div className="collapsible-section my-2.5">
          <label
            htmlFor="waitingChildrenList"
            onClick={toggleWaitingList}
            className="collapsible-header flex justify-between items-center cursor-pointer py-2 m-0 select-none transition-colors hover:bg-gray-100 rounded px-1"
            id="waitingHeader"
          >
            <span className="text-black">キャンセル待ち子ども:</span>
            <span className={`toggle-icon text-xs transition-transform ${waitingCollapsed ? '-rotate-90' : ''}`}>
              ▼
            </span>
          </label>
          <ul
            id="waitingChildrenList"
            className={`collapsible-content list-none p-0 m-0 transition-all duration-300 ease-out ${
              waitingCollapsed
                ? 'max-h-0 opacity-0 overflow-hidden'
                : 'max-h-[5000px] opacity-100 overflow-y-visible'
            }`}
          ></ul>
        </div>

        <hr className="my-4 border-none border-t border-gray-200" />
        <label htmlFor="ExperienceChildrenList" className="block my-2.5 mt-2.5 mb-1.5 font-bold text-black text-sm">
          体験子ども:
        </label>
        <ul id="ExperienceChildrenList" className="list-none p-0 m-0"></ul>

        <hr className="my-4 border-none border-t border-gray-200" />
        {/* 出勤データ取得ボタン */}
        <div className="attendance-section my-4 p-2.5 bg-gray-100 rounded border border-gray-200">
          <button
            id="fetchAttendanceBtn"
            className="attendance-button w-full p-2.5 bg-blue-600 text-white border-none rounded text-sm font-bold cursor-pointer transition-colors mb-2.5 hover:bg-blue-700 active:scale-[0.98] disabled:bg-gray-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            📊 出勤データ取得
          </button>
          <div
            id="attendanceResult"
            className="attendance-result p-2.5 bg-white border border-gray-200 rounded text-xs max-h-[200px] overflow-y-auto break-words hidden"
          ></div>
        </div>
      </div>
    </div>
  )
}

export default Sidebar

