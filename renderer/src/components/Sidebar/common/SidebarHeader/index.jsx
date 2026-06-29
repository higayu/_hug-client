import { useEffect } from "react";

import { useAppState } from "@/AppStateContext";
import { getWeekdayIdFromDate } from "@/utils/date/dateUtils";
import { getTodayYmdString } from "@/utils/date/dateYMD";
import { useToast } from "@/components/common/ToastContext";
import { useAttendanceFetch } from "@/hooks/useAttendanceFetch";

import TableDataGetButton from "@/components/common/TableDataGetButon";
import WeekdaySelect from "@/components/common/WeekdaySelect";
import SelectChildFilter from "./SelectChildFilter";

function SidebarHeader() {
  const { showInfoToast } = useToast();

  const {
    CURRENT_DAY_OF_WEEK,
    CURRENT_YMD,
    attendanceData,
    setCurrentDate,
    setCurrentYmd,
    DEBUG_FLG,
  } = useAppState()

  const { runFetch, autoFetchEnabled, toggleAutoFetch } =
    useAttendanceFetch("SidebarHeader")

  // =============================================================
  // 初期化（日付・曜日ID）
  // =============================================================
  useEffect(() => {
    if (!CURRENT_YMD) {
      const today = getTodayYmdString()
      const weekdayId = getWeekdayIdFromDate(today)

      console.log("[INIT] CURRENT_YMD が未設定のため今日をセット:", today)
      console.log("[INIT] 今日の日付から weekdayId を算出:", weekdayId)

      setCurrentYmd(today)
      setCurrentDate({ weekdayId })
      return
    }

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
    const selectedDate = e.target.value

    if (!selectedDate) return

    console.log("[DATE CHANGE] ユーザーが日付を変更:", selectedDate)

    setCurrentYmd(selectedDate)
    showInfoToast(`📅 日付を ${selectedDate} に設定しました`)
  }

  return (
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
      <div className="flex gap-6 bg-gray-200 w-full justify-center">
        {/* 日付入力 */}
        <div className="flex flex-col items-center justify-center">
          <label className="font-bold text-sm text-black mb-1.5">
            日付:（個人記録）
          </label>

          <input
            type="date"
            value={CURRENT_YMD ?? ""}
            onChange={handleDateChange}
            className="
              w-full max-w-[200px]
              p-2
              border border-gray-300
              rounded
              text-sm
              bg-white text-black
              cursor-pointer
            "
          />
        </div>

        {/* 曜日 */}
        <div className="flex flex-col items-center justify-center">
          <label className="font-bold text-sm text-black mb-1.5">
            曜日別：（対応児童）
          </label>

          <WeekdaySelect />
        </div>

        {/* Web Manager（外部ブラウザ） */}
        <div className="flex flex-col gap-2 items-center justify-center">
              <SelectChildFilter />
              <TableDataGetButton
                onFetch={runFetch}
                autoFetchEnabled={autoFetchEnabled}
                onToggleAutoFetch={toggleAutoFetch}
                lastFetchedAt={attendanceData?.extractedAt}
              />

        </div>


      </div>
    </div>
  )
}

export default SidebarHeader