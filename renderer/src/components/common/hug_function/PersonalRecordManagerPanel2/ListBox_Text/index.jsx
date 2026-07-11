import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { useAppState } from "@/AppStateContext";
import { selectServiceRecord } from "@/store/slices/databaseSlice.js";
import { selectPersonalRecordNote } from "./selectPersonalRecordNote";
import { servedDateToDateStr } from "./selectPersonalRecordNote";

/**
 * 指定された月の個人記録一覧を表示し、選択した日付の内容をテキストエリアに表示する
 * 
 * @param {{ monthStr: string }} props - "YYYY-MM" 形式の月
 */
export default function ListBox_Text({ monthStr = "" }) {
  const { SELECT_CHILD } = useAppState();
  const serviceRecords = useSelector(selectServiceRecord);
  
  // 選択された日付（YYYY-MM-DD）
  const [selectedDate, setSelectedDate] = useState("");
  
  // 選択された日付のnote内容
  const [selectedNote, setSelectedNote] = useState("");
  
  // その月の日付リスト
  const [dateList, setDateList] = useState([]);

  /**
   * 指定された月の日付リストを生成
   */
  const getDaysInMonth = useCallback((yearMonth) => {
    if (!yearMonth || !/^\d{4}-\d{2}$/.test(yearMonth)) return [];
    
    const [year, month] = yearMonth.split('-').map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();
    const days = [];
    
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
    
    return `${year}-${month}-${day}`;
  }, []);

  /**
   * 月が変わったら日付リストを更新
   */
  useEffect(() => {
    if (monthStr) {
      const days = getDaysInMonth(monthStr);
      setDateList(days);
      
      if (days.length > 0) {
        // 1週間前の日付を取得
        const oneWeekAgo = getOneWeekAgo();
        
        // 1週間前の日付がリストに含まれているかチェック
        const targetDate = days.includes(oneWeekAgo) 
          ? oneWeekAgo 
          : days[days.length - 1]; // 含まれていなければ月末を選択
        
        setSelectedDate(targetDate);
      } else {
        setSelectedDate("");
      }
    } else {
      setDateList([]);
      setSelectedDate("");
    }
  }, [monthStr, getDaysInMonth, getOneWeekAgo]);

  /**
   * 選択された日付のnoteを取得
   */
  useEffect(() => {
    if (!SELECT_CHILD || !selectedDate) {
      setSelectedNote("");
      return;
    }

    const note = selectPersonalRecordNote(serviceRecords, {
      childrenId: SELECT_CHILD,
      dateStr: selectedDate,
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

  return (
    <div className="space-y-3">
      {/* 日付セレクトボックス */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          日付を選択
        </label>
        <select
          className="w-full rounded border border-gray-300 px-3 py-2 bg-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
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
          <div className="mt-1 text-xs text-gray-500">
            {formatDateDisplay(selectedDate)}
            {hasNote(selectedDate) ? " - 記録あり ✅" : " - 記録なし"}
          </div>
        )}
      </div>

      {/* テキストエリア - 選択された日付の内容を表示 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          個人記録
        </label>
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
          📝 記録あり: {dateList.filter(d => hasNote(d)).length}日
        </span>
        <span>
          ⬜ 記録なし: {dateList.filter(d => !hasNote(d)).length}日
        </span>
      </div>
    </div>
  );
}