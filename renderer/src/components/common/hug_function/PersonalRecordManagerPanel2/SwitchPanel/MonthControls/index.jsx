// PersonalRecordManagerPanel2/PersonalRecordMonthControls.jsx
import PersonalRecordGetMonthBtn from "./PersonalRecordGetMonthBtn";

export default function MonthControls({
  month,
  onMonthChange,
  disabled = false,
}) {
  const handleMonthChange = (event) => {
    onMonthChange(event.target.value);
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2">
        <label
          htmlFor="personal-record-target-month"
          className="text-sm font-medium text-gray-700"
        >
          対象月:
        </label>

        <input
          type="month"
          id="personal-record-target-month"
          value={month}
          onChange={handleMonthChange}
          className="
            rounded border border-gray-300
            px-3 py-1.5
            focus:border-transparent
            focus:ring-2 focus:ring-amber-500
          "
        />
      </div>

      <PersonalRecordGetMonthBtn
        monthStr={month}
        disabled={disabled}
      />
    </div>
  );
}
