import { useEffect } from "react";

import { useAppState } from "@/AppStateContext";
import { getWeekdayIdFromDate } from "@/utils/date/dateUtils";
import { getTodayYmdString } from "@/utils/date/dateYMD";
import { useToast } from "@/components/common/ToastContext";

import WeekdaySelect from "@/components/ui/WeekdaySelect";

function SidebarHeader() {
  const { showInfoToast } = useToast();

  const {
    CURRENT_DAY_OF_WEEK,
    CURRENT_YMD,
    setCurrentDate,
    setCurrentYmd,
  } = useAppState();

  // =============================================================
  // 初期化（日付・曜日ID）
  // =============================================================
  useEffect(() => {
    if (!CURRENT_YMD) {
      const today = getTodayYmdString();
      const weekdayId = getWeekdayIdFromDate(today);

      console.log("[INIT] CURRENT_YMD が未設定のため今日をセット:", today);
      console.log("[INIT] 今日の日付から weekdayId を算出:", weekdayId);

      setCurrentYmd(today);
      setCurrentDate({ weekdayId });
      return;
    }

    if (CURRENT_YMD && CURRENT_DAY_OF_WEEK.weekdayId == null) {
      const weekdayId = getWeekdayIdFromDate(CURRENT_YMD);

      console.log("[INIT] CURRENT_YMD はあるが weekdayId が未設定。再計算:", {
        CURRENT_YMD,
        weekdayId,
      });

      setCurrentDate({ weekdayId });
    }
  }, [
    CURRENT_YMD,
    CURRENT_DAY_OF_WEEK.weekdayId,
    setCurrentDate,
    setCurrentYmd,
  ]);

  // =============================================================
  // 日付変更
  // =============================================================
  const handleDateChange = (e) => {
    const selectedDate = e.target.value;

    if (!selectedDate) return;

    console.log("[DATE CHANGE] ユーザーが日付を変更:", selectedDate);

    setCurrentYmd(selectedDate);
    showInfoToast(`📅 日付を ${selectedDate} に設定しました`);
  };

  return (
    <div
      className="
        sidebar-header
        flex items-start
        max-h-none overflow-visible
        w-full
      "
    >
      <div className="flex w-full">
        {/* 日付入力：60% */}
        <div className="flex flex-row rounded-lg bg-slate-200 p-2 items-center gap-2 basis-3/5 min-w-0">
          <label className="items-center flex flex-col font-bold text-sm text-black shrink-0">
            <span className="text-sm text-black">日付:</span>
            <span className="text-sm text-black">（個人記録）</span>
          </label>

          <input
            type="date"
            value={CURRENT_YMD ?? ""}
            onChange={handleDateChange}
            className="
              flex-1
              min-w-0
              p-2
              border border-gray-300
              rounded
              text-sm
              bg-white text-black
              cursor-pointer
            "
          />
        </div>

        {/* 曜日：40% */}
        <div className="flex flex-row rounded-lg bg-slate-200 p-2 items-center basis-2/5 min-w-0">
          <label className="flex flex-col items-center font-bold text-sm shrink-0">
            <span className="text-sm text-black">曜日別：</span>
            <span className="text-sm text-black">（対応児童）</span>
          </label>

          <div className="flex-1 min-w-0">
            <WeekdaySelect />
          </div>
        </div>
      </div>

    </div>
  );
}

export default SidebarHeader;