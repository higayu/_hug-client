// PersonalRecordManagerPanel2/index.jsx
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useAppState } from "@/AppStateContext";
import { useServiceRecord } from "@/hooks/useServiceRecord";
import { setServiceRecord } from "@/store/slices/databaseSlice.js";

import SwitchPanel, { PERIOD_TYPES, } from "./PersonSwitchPanel";
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
    CURRENT_DAY_OF_WEEK,
    FACILITY_ID,
  } = useAppState();
  const dispatch = useDispatch();
  const { getServiceRecordMonthly } = useServiceRecord();
  const [serviceRecordLoading, setServiceRecordLoading] = useState(false);
  const [serviceRecordError, setServiceRecordError] = useState("");

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

  const dayOfWeekId = Number(
    CURRENT_DAY_OF_WEEK?.weekdayId ??
    CURRENT_DAY_OF_WEEK?.id ??
    CURRENT_DAY_OF_WEEK?.weekday_id ??
    CURRENT_DAY_OF_WEEK,
  );

  const facilityId = Number(FACILITY_ID);

  useEffect(() => {
    if (
      !/^\d{4}-\d{2}$/.test(listTargetMonth) ||
      !Number.isInteger(dayOfWeekId) ||
      dayOfWeekId <= 0 ||
      !Number.isInteger(facilityId) ||
      facilityId <= 0
    ) {
      dispatch(setServiceRecord([]));
      return;
    }

    let cancelled = false;

    const loadServiceRecords = async () => {
      setServiceRecordLoading(true);
      setServiceRecordError("");

      try {
        const rows = await getServiceRecordMonthly({
          target_month: listTargetMonth,
          day_of_week_id: dayOfWeekId,
          facility_id: facilityId,
        });

        if (!cancelled) {
          dispatch(setServiceRecord(rows));
        }
      } catch (error) {
        if (!cancelled) {
          console.error("月次サービス記録の取得に失敗しました。", error);
          dispatch(setServiceRecord([]));
          setServiceRecordError(
            error?.message || "月次サービス記録の取得に失敗しました。",
          );
        }
      } finally {
        if (!cancelled) {
          setServiceRecordLoading(false);
        }
      }
    };

    loadServiceRecords();

    return () => {
      cancelled = true;
    };
  }, [
    dayOfWeekId,
    dispatch,
    facilityId,
    getServiceRecordMonthly,
    listTargetMonth,
  ]);

  return (
    <div className="w-full space-y-4">
      <div className="bg-gray-200 flex flex-row items-center gap-3">
        {/* 児童情報 */}
        <div className="flex shrink-0 items-center justify-center">
          {SELECT_CHILD ? (
            <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-500">
              👤 児童ID: {SELECT_CHILD}
            </span>
          ) : (
            <p className="m-0 whitespace-nowrap text-sm text-gray-500">
              Not Select
            </p>
          )}
        </div>

        <SwitchPanel
          value={periodType}
          onChange={setPeriodType}
          month={month}
          onMonthChange={setMonth}
          date={date}
          onDateChange={setDate}
          disabled={!SELECT_CHILD}
        />
      </div>

      <ListBox_Text
        monthStr={listTargetMonth}
        dateStr={
          periodType === PERIOD_TYPES.DAY
            ? date
            : ""
        }
        periodType={periodType}
      />

      {serviceRecordLoading && (
        <p className="text-xs text-gray-500">サービス記録を取得中です...</p>
      )}

      {serviceRecordError && (
        <p className="text-xs text-red-600">{serviceRecordError}</p>
      )}
    </div>
  );
}
