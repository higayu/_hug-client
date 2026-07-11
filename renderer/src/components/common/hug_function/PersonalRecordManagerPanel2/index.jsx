// PersonalRecordManagerPanel2/index.jsx
import { useEffect, useState } from "react";
import { useAppState } from "@/AppStateContext";

import SwitchPanel, { PERIOD_TYPES, } from "./SwitchPanel";
import ListBox_Text from "./ListBox_Text";

const toMonthStr = (value) => {
  if (!value) return "";

  if (/^\d{4}-\d{2}$/.test(value)) {
    return value;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value.slice(0, 7);
  }

  return "";
};

const toDateStr = (value) => {
  if (!value) return "";

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  return "";
};

export default function PersonalRecordManagerPanel2() {
  const {
    SELECT_CHILD,
    CURRENT_YMD,
  } = useAppState();

  const [periodType, setPeriodType] = useState(
    PERIOD_TYPES.MONTH
  );

  const [month, setMonth] = useState(() =>
    toMonthStr(CURRENT_YMD)
  );

  const [date, setDate] = useState(() =>
    toDateStr(CURRENT_YMD)
  );

  useEffect(() => {
    if (!CURRENT_YMD) return;

    const nextMonth = toMonthStr(CURRENT_YMD);
    const nextDate = toDateStr(CURRENT_YMD);

    if (nextMonth) {
      setMonth(nextMonth);
    }

    if (nextDate) {
      setDate(nextDate);
    }
  }, [CURRENT_YMD]);

  const listTargetMonth =
    periodType === PERIOD_TYPES.DAY
      ? toMonthStr(date)
      : month;

  return (
    <div className="w-full space-y-4">
      <SwitchPanel
        value={periodType}
        onChange={setPeriodType}
        month={month}
        onMonthChange={setMonth}
        date={date}
        onDateChange={setDate}
        disabled={!SELECT_CHILD}
      />

      {SELECT_CHILD && (
        <span className="inline-block rounded bg-gray-100 px-2 py-1 text-xs text-gray-500">
          👤 児童ID: {SELECT_CHILD}
        </span>
      )}

      {!SELECT_CHILD && (
        <p className="text-sm text-gray-500">
          個人記録を取得する児童を選択してください。
        </p>
      )}

      <ListBox_Text
        monthStr={listTargetMonth}
        dateStr={
          periodType === PERIOD_TYPES.DAY
            ? date
            : ""
        }
        periodType={periodType}
      />
    </div>
  );
}