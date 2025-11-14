import { useDispatch } from "react-redux"
import { useEffect, useRef, useState } from 'react'
import { useAppState } from '../../contexts/AppStateContext.jsx'
import { getWeekdayFromDate, getDateString } from '../../utils/dateUtils.js'
import { useToast } from '../../contexts/ToastContext.jsx'
import { ELEMENT_IDS } from '../../utils/constants.js'
import TabsContainer from './common/TabsContainer.jsx'  // ← これを追加
import TableDataGetButton from './common/TableDataGetButon.jsx'

function Sidebar() {
  const { showInfoToast } = useToast()
  const { appState, setDate, setWeekday, DATE_STR, WEEK_DAY, SELECT_CHILD, SELECT_CHILD_NAME } = useAppState()
  const dispatch = useDispatch()
  // 初期値を設定（appStateに値がない場合は今日の日付を使用）
  const initialDate = DATE_STR || getDateString()
  const initialWeekday = WEEK_DAY || getWeekdayFromDate(initialDate)
  
  const [dateValue, setDateValue] = useState(initialDate)
  const [weekdayValue, setWeekdayValue] = useState(initialWeekday)
  const [isPinned, setIsPinned] = useState(false)
  const sidebarRef = useRef(null)

  // 日付変更時の処理（曜日には干渉しない）
  const handleDateChange = (e) => {
    const selectedDate = e.target.value
    console.log("📅 日付が変更されました:", selectedDate)
    
    if (selectedDate) {
      const weekday = getWeekdayFromDate(selectedDate)
      
      // ローカル状態とコンテキスト更新（曜日は更新しない）
      setDateValue(selectedDate)
      setDate(selectedDate)

      showInfoToast(`📅 日付を ${selectedDate} (${weekday}) に設定しました`)
      console.log("✅ 日付のみを更新:", { date: selectedDate, weekday })

      // 他コンポーネントへの通知
      window.dispatchEvent(new CustomEvent('date-changed', { 
        detail: { date: selectedDate, weekday }
      }))
      
      // 🚫 ここでは曜日変更イベントを発行しない
      // window.dispatchEvent(new Event('weekday-changed'))
    }
  }

  // 曜日変更時
  const handleWeekdayChange = (e) => {
    const selectedWeekday = e.target.value
    setWeekday(selectedWeekday)
    setWeekdayValue(selectedWeekday)
    showInfoToast(`📅 曜日を ${selectedWeekday} に設定しました`)
  }


  // 固定状態の切り替え
  const handlePinToggle = () => {
    const newPinnedState = !isPinned
    setIsPinned(newPinnedState)
    
    // 固定状態変更イベントを発行
    window.dispatchEvent(new CustomEvent('sidebar-pin-changed', { 
      detail: { pinned: newPinnedState } 
    }))
    
    console.log(newPinnedState ? "📌 サイドバーを固定しました" : "📌 サイドバーの固定を解除しました")
  }

  // 初期化時にappStateから値を取得し、初期値がない場合は設定（初回マウント時のみ）
  useEffect(() => {
    if (!DATE_STR) {
      const today = getDateString()
      setDate(today)
      setWeekday(getWeekdayFromDate(today))
      setDateValue(today)
      setWeekdayValue(getWeekdayFromDate(today))
    } else {
      setDateValue(DATE_STR)
      if (WEEK_DAY) {
        setWeekdayValue(WEEK_DAY)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // 初回マウント時のみ実行


  // weekdayValue の変更を検知してイベント発火
  useEffect(() => {
    if (weekdayValue) {
      window.dispatchEvent(new Event('weekday-changed'))
    }
  }, [weekdayValue])

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
            value={dateValue || ''}
            onChange={handleDateChange}
            className="w-full p-2 my-1.5 border border-gray-300 rounded text-sm text-black bg-white max-w-[200px] cursor-pointer"
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

        {/* 🌟 安全ピンボタン */}
        <button
          onClick={handlePinToggle}
          className={`flex-shrink-0 p-1.5 rounded transition-colors duration-200 ${
            isPinned 
              ? 'bg-blue-500 text-white hover:bg-blue-600' 
              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
          }`}
          title={isPinned ? "サイドバーの固定を解除" : "サイドバーを固定（外側クリックで閉じない）"}
        >
          <span className="text-lg" style={{ fontSize: '18px' }}>
            {isPinned ? '📌' : '📍'}
          </span>
        </button>
        <TableDataGetButton />
      </div>

      {/* スクロール可能なコンテンツ部分 - 横並びレイアウト */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* スクロール可能なコンテンツ部分 */}
          <TabsContainer />   {/* ← SidebarContent と ChildMemoPanel をここにまとめて挿入 */}
      </div>
    </div>
  )
}

export default Sidebar

