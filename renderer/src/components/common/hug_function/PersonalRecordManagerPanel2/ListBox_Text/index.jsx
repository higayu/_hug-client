import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { useAppState } from "@/AppStateContext";
import { selectServiceRecord } from "@/store/slices/databaseSlice.js";
import { selectPersonalRecordNote } from "./selectPersonalRecordNote";
import { servedDateToDateStr } from "./selectPersonalRecordNote";

const LOG_TAG = "ListBox_Text";

/**
 * 指定された月の個人記録一覧を表示し、選択した日付の内容をテキストエリアに表示する
 * 
 * @param {{ monthStr: string }} props - "YYYY-MM" 形式の月
 */
export default function ListBox_Text({ monthStr = "", dateStr = "", periodType = "month" }) {
  const { SELECT_CHILD } = useAppState();
  const serviceRecords = useSelector(selectServiceRecord);
  
  // 選択された日付（YYYY-MM-DD）
  const [selectedDate, setSelectedDate] = useState("");
  
  // 選択された日付のnote内容
  const [selectedNote, setSelectedNote] = useState("");
  
  // その月の日付リスト
  const [dateList, setDateList] = useState([]);

  console.log(`[${LOG_TAG}] レンダリング`, {
    monthStr,
    dateStr,
    periodType,
    SELECT_CHILD,
    serviceRecordCount: serviceRecords?.length ?? 0,
  });

  /**
   * 指定された月の日付リストを生成
   */
  const getDaysInMonth = useCallback((yearMonth) => {
    if (!yearMonth || !/^\d{4}-\d{2}$/.test(yearMonth)) {
      console.warn(`[${LOG_TAG}] 不正な年月形式:`, yearMonth);
      return [];
    }
    
    const [year, month] = yearMonth.split('-').map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();
    const days = [];
    
    console.log(`[${LOG_TAG}] getDaysInMonth: ${yearMonth} は ${daysInMonth}日`);
    
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push(dateStr);
    }
    
    return days;
  }, []);

  /**
   * 1週間前の日付を取得（YYYY-MM-DD形式）
   */
  const getOneWeekAgo = useCallback(() => {
    const today = new Date();
    const oneWeekAgo = new Date(today);
    oneWeekAgo.setDate(today.getDate() - 7);
    
    const year = oneWeekAgo.getFullYear();
    const month = String(oneWeekAgo.getMonth() + 1).padStart(2, '0');
    const day = String(oneWeekAgo.getDate()).padStart(2, '0');
    
    const result = `${year}-${month}-${day}`;
    console.log(`[${LOG_TAG}] getOneWeekAgo: ${result}`);
    return result;
  }, []);

  /**
   * 月が変わったら日付リストを更新
   */
  useEffect(() => {
    console.log(`[${LOG_TAG}] useEffect - 日付リスト更新`, { monthStr });
    
    if (monthStr) {
      const days = getDaysInMonth(monthStr);
      setDateList(days);
      console.log(`[${LOG_TAG}] 日付リスト生成完了: ${days.length}日`);
      
      if (days.length > 0) {
        // 1週間前の日付を取得
        const oneWeekAgo = getOneWeekAgo();
        
        // 1週間前の日付がリストに含まれているかチェック
        const targetDate = days.includes(oneWeekAgo) 
          ? oneWeekAgo 
          : days[days.length - 1]; // 含まれていなければ月末を選択
        
        console.log(`[${LOG_TAG}] 選択日付設定: ${targetDate}`);
        setSelectedDate(targetDate);
      } else {
        console.warn(`[${LOG_TAG}] 日付リストが空です`);
        setSelectedDate("");
      }
    } else {
      console.warn(`[${LOG_TAG}] monthStrが空です`);
      setDateList([]);
      setSelectedDate("");
    }
  }, [monthStr, getDaysInMonth, getOneWeekAgo]);

  /**
   * 選択された日付のnoteを取得
   */
  useEffect(() => {
    console.log(`[${LOG_TAG}] useEffect - note取得`, {
      SELECT_CHILD,
      selectedDate,
      serviceRecordCount: serviceRecords?.length ?? 0,
    });

    if (!SELECT_CHILD || !selectedDate) {
      console.log(`[${LOG_TAG}] 条件不足: SELECT_CHILD=${SELECT_CHILD}, selectedDate=${selectedDate}`);
      setSelectedNote("");
      return;
    }

    const note = selectPersonalRecordNote(serviceRecords, {
      childrenId: SELECT_CHILD,
      dateStr: selectedDate,
    });
    
    console.log(`[${LOG_TAG}] note取得結果`, {
      selectedDate,
      hasNote: !!note,
      noteLength: note?.length ?? 0,
    });
    
    setSelectedNote(note || "");
  }, [SELECT_CHILD, selectedDate, serviceRecords]);

  /**
   * 日付の表示形式を変換 (YYYY-MM-DD → MM/DD(曜日))
   */
  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
    return `${parseInt(month)}/${parseInt(day)}(${weekdays[date.getDay()]})`;
  };

  /**
   * その日付にnoteが存在するかチェック
   */
  const hasNote = (dateStr) => {
    if (!SELECT_CHILD) return false;
    const note = selectPersonalRecordNote(serviceRecords, {
      childrenId: SELECT_CHILD,
      dateStr: dateStr,
    });
    return note && note.trim().length > 0;
  };

  // 統計情報を計算
  const withNoteCount = dateList.filter(d => hasNote(d)).length;
  const withoutNoteCount = dateList.filter(d => !hasNote(d)).length;

  console.log(`[${LOG_TAG}] 統計情報`, {
    totalDays: dateList.length,
    withNote: withNoteCount,
    withoutNote: withoutNoteCount,
  });

  return (
    <div className="space-y-3 px-1 py-2 bg-slate-100 rounded-lg">
      {/* 日付セレクトボックス */}
      <div className="flex justify-around">
        <select
          className="w-[60%] rounded border border-gray-300 px-3 py-2 bg-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          value={selectedDate}
          onChange={(e) => {
            console.log(`[${LOG_TAG}] 日付選択変更: ${e.target.value}`);
            setSelectedDate(e.target.value);
          }}
          disabled={dateList.length === 0}
        >
          {dateList.length === 0 ? (
            <option value="">日付がありません</option>
          ) : (
            dateList.map((dateStr) => (
              <option key={dateStr} value={dateStr}>
                {formatDateDisplay(dateStr)}
                {hasNote(dateStr) ? " 📝" : ""}
              </option>
            ))
          )}
        </select>
        {/* 選択中の日付情報 */}
        {selectedDate && (
          <div className="flex shrink-0 items-center justify-center text-xs text-gray-500">
            {hasNote(selectedDate) ? " - 記録あり ✅" : " - 記録なし"}
          </div>
        )}
      </div>

      {/* テキストエリア - 選択された日付の内容を表示 */}
      <div>
        <textarea
          className="h-40 w-full rounded bg-gray-700 p-3 text-white resize-none focus:ring-2 focus:ring-amber-500 focus:outline-none"
          value={selectedNote}
          readOnly
          placeholder={
            !SELECT_CHILD 
              ? "児童が選択されていません" 
              : !selectedDate 
                ? "日付を選択してください"
                : "記録がありません"
          }
        />
      </div>

      {/* 統計情報 */}
      <div className="flex gap-4 text-xs text-gray-500">
        <span>
          📊 合計: {dateList.length}日
        </span>
        <span>
          📝 記録あり: {withNoteCount}日
        </span>
        <span>
          ⬜ 記録なし: {withoutNoteCount}日
        </span>
      </div>
    </div>
  );
}