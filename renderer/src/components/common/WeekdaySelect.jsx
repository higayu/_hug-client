// src/components/common/WeekdaySelect.jsx
import React from "react"
import { useAppState } from "@/contexts/appState"
import { useToast } from "@/components/common/ToastContext.jsx"
import { DAY_OF_WEEK_MASTER } from "@/utils/dateUtils.js"

function WeekdaySelect({
  id = "weekdaySelect",
  name = "weekdaySelect",
  className = "",
  onChanged, // 任意：外部通知
}) {
  const { showInfoToast } = useToast()

  // ✅ AppState（唯一の状態）
  const { CURRENT_DATE, setCurrentDate } = useAppState()

  const handleChange = (e) => {
    const weekdayId = Number(e.target.value)
    const weekdayObj = DAY_OF_WEEK_MASTER.find(
      (w) => w.id === weekdayId
    )
    if (!weekdayObj) return

    // AppState 更新
    setCurrentDate({ weekdayId })

    showInfoToast(`📅 曜日を ${weekdayObj.label_jp} に設定しました`)

    // 外部に知らせたい場合
    onChanged?.({
      weekdayId: weekdayObj.id,
      weekdayLabel: weekdayObj.label_jp,
    })
  }

  return (
    <select
      id={id}
      name={name}
      value={CURRENT_DATE.weekdayId ?? ""}
      onChange={handleChange}
      className={`w-full p-2 border border-gray-300 rounded text-sm bg-white text-black ${className}`}
    >
      {DAY_OF_WEEK_MASTER
        .slice()
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((w) => (
          <option key={w.id} value={w.id}>
            {w.label_jp}
          </option>
        ))}
    </select>
  )
}

export default WeekdaySelect
