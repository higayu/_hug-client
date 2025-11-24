// src/utils/dateUtils.js
// 日付関連のユーティリティ関数

import { WEEKDAYS } from './constants.js'

/**
 * 日付文字列から曜日を取得
 * @param {string} dateStr - 日付文字列 (例: "2025-10-11")
 * @returns {string} 曜日 (例: "月")
 */
export function getWeekdayFromDate(dateStr) {
  const date = new Date(dateStr)
  return WEEKDAYS[date.getDay()]
}

/**
 * 指定したオフセット日数後の日付文字列を取得
 * @param {number} offset - オフセット日数（デフォルト: 0 = 今日）
 * @returns {string} 日付文字列 (例: "2025-11-03")
 */
export function getDateString(offset = 0) {
  const today = new Date()
  today.setDate(today.getDate() + offset)
  const y = today.getFullYear()
  const m = String(today.getMonth() + 1).padStart(2, '0')
  const d = String(today.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * 指定したオフセット日数後の曜日を取得
 * @param {number} offset - オフセット日数（デフォルト: 0 = 今日）
 * @returns {string} 曜日 (例: "月")
 */
export function getTodayWeekday(offset = 0) {
  const date = new Date()
  date.setDate(date.getDate() + offset)
  return WEEKDAYS[date.getDay()]
}

/**
 * 曜日名から day_of_week テーブルの ID を取得
 * @param {string} weekDay - 曜日名 ("月", "火", "Mon", "Tue" など)
 * @param {Array} dayOfWeekList - Redux 等から取得した day_of_week の配列
 * @returns {number|null} 対応する曜日 ID / 見つからない場合 null
 */
export function getDayOfWeekId(weekDay, dayOfWeekList) {
  if (!weekDay || !Array.isArray(dayOfWeekList)) return null;

  const match = dayOfWeekList.find((d) => {
    return (
      d.label_jp === weekDay ||
      (d.label_en && d.label_en.toLowerCase() === weekDay.toLowerCase())
    );
  });

  return match?.id ?? null;
}
