// @/common/hug_function/PersonalRecordManagerPanel2/SwitchPanel/index.jsx
import MonthControls from "./MonthControls";
import DayControls from "./DayControls";

const PERIOD_TYPES = {
  MONTH: "month",
  DAY: "day",
};

export { PERIOD_TYPES };

/**
 * 月単位・日付単位の取得操作を切り替える専用パネル
 */
export default function SwitchPanel({
  value,
  onChange,
  month,
  onMonthChange,
  date,
  onDateChange,
  disabled = false,
}) {
  const isMonth = value === PERIOD_TYPES.MONTH;

  const nextValue = isMonth
    ? PERIOD_TYPES.DAY
    : PERIOD_TYPES.MONTH;

  const currentLabel = isMonth
    ? "月単位"
    : "日付単位";

  const nextLabel = isMonth
    ? "日付単位"
    : "月単位";

  const handleToggle = () => {
    onChange(nextValue);
  };

  return (
    <div className="w-full space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        {/* 切替ボタン */}
        <button
          type="button"
          onClick={handleToggle}
          aria-label={`${nextLabel}に切り替える`}
          aria-pressed={!isMonth}
          className="
            flex items-center justify-center
            whitespace-nowrap
            rounded-lg border border-amber-500
            bg-amber-500 px-4 py-2
            text-sm font-bold text-white
            cursor-pointer transition-all
            hover:scale-105 hover:bg-amber-600
            active:scale-[0.97] active:bg-amber-700
          "
        >
          {currentLabel}

          <span
            className="mx-2"
            aria-hidden="true"
          >
            ⇄
          </span>

          {nextLabel}
        </button>

        <span className="text-xs text-gray-500">
          現在：{currentLabel}
        </span>
      </div>

      {/* 月単位・日付単位の操作欄 */}
      <div className="w-full">
        {isMonth ? (
          <MonthControls
            month={month}
            onMonthChange={onMonthChange}
            disabled={disabled}
          />
        ) : (
          <DayControls
            date={date}
            onDateChange={onDateChange}
            disabled={disabled}
          />
        )}
      </div>
    </div>
  );
}