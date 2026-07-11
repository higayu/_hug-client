// PersonalRecordManagerPanel2/index.jsx
import React, { useCallback, useEffect, useState } from "react";
import { useAppState } from "@/AppStateContext";
import PersonalRecordUpdateBtn2 from "./PersonalRecordUpdateBtn2";
import ListBox_Text from "./ListBox_Text";

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
    <div className="w-full space-y-4">
      {/* ヘッダー部分 */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">
            対象月:
          </label>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="rounded border border-gray-300 px-3 py-1.5 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
        </div>
        
        <PersonalRecordUpdateBtn2 monthStr={month} />
        
        {/* 児童情報表示 */}
        {SELECT_CHILD && (
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            👤 児童ID: {SELECT_CHILD}
          </span>
        )}
      </div>

      {/* リスト＆テキストエリア */}
      <ListBox_Text monthStr={month} />
    </div>
  );
}