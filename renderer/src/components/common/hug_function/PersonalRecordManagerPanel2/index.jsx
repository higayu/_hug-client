import React, { useCallback, useEffect, useState } from "react";
import { useAppState } from "@/AppStateContext";
import PersonalRecordUpdateBtn from "./PersonalRecordUpdateBtn";

const toMonthStr = (value) => {
  if (!value) return "";

  // すでに YYYY-MM の場合
  if (/^\d{4}-\d{2}$/.test(value)) {
    return value;
  }

  // YYYY-MM-DD の場合
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value.slice(0, 7);
  }

  return "";
};

export default function PersonalRecordManagerPanel2() {

  const { SELECT_CHILD, CURRENT_YMD } = useAppState();
  const [month, setMonth] = useState(() => toMonthStr(CURRENT_YMD));
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (CURRENT_YMD) {
      setMonth(toMonthStr(CURRENT_YMD));
    }
  }, [CURRENT_YMD]);


  return (
    <div className="w-full space-y-3">
      <div className="flex items-center gap-2">
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="rounded border border-gray-300 px-2 py-1"
        />

        <PersonalRecordUpdateBtn monthStr={month} />
      </div>

    </div>
  );
}