// src/utils/dateUtils.js
// 日付関連のユーティリティ関数

// =====================================================
// day_of_week マスタ（唯一の正）
// =====================================================
export const DAY_OF_WEEK_MASTER = [
  { id: 1, label_jp: "月", label_en: "Mon", sort_order: 1 },
  { id: 2, label_jp: "火", label_en: "Tue", sort_order: 2 },
  { id: 3, label_jp: "水", label_en: "Wed", sort_order: 3 },
  { id: 4, label_jp: "木", label_en: "Thu", sort_order: 4 },
  { id: 5, label_jp: "金", label_en: "Fri", sort_order: 5 },
  { id: 6, label_jp: "土", label_en: "Sat", sort_order: 6 },
  { id: 7, label_jp: "日", label_en: "Sun", sort_order: 7 },
]

// =====================================================
// 内部ヘルパー：JS Date.getDay() → day_of_week.id
// JS: 0=日,1=月,...6=土
// DB: 1=月,...7=日
// =====================================================
function jsDayToWeekdayId(jsDay) {
  return jsDay === 0 ? 7 : jsDay
}

// =====================================================
// 日付文字列から曜日オブジェクトを取得
// =====================================================
export function getWeekdayObjectFromDate(dateStr) {
  const date = new Date(dateStr)
  const jsDay = date.getDay()
  const weekdayId = jsDayToWeekdayId(jsDay)

  return DAY_OF_WEEK_MASTER.find((w) => w.id === weekdayId) ?? null
}

// =====================================================
// 日付文字列から曜日IDを取得（正）
// =====================================================
export function getWeekdayIdFromDate(dateStr) {
  const date = new Date(dateStr)
  return jsDayToWeekdayId(date.getDay())
}

// =====================================================
// 今日（offset日後）の曜日IDを取得
// =====================================================
export function getTodayWeekdayId(offset = 0) {
  const date = new Date()
  date.setDate(date.getDate() + offset)
  return jsDayToWeekdayId(date.getDay())
}

// =====================================================
// 指定したオフセット日数後の日付文字列を取得
// =====================================================
export function getDateString(offset = 0) {
  const today = new Date()
  today.setDate(today.getDate() + offset)
  const y = today.getFullYear()
  const m = String(today.getMonth() + 1).padStart(2, "0")
  const d = String(today.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

// =====================================================
// 表示用（後方互換）
// ※ 新規コードでは使用非推奨
// =====================================================
export function getWeekdayLabelFromDate(dateStr) {
  return getWeekdayObjectFromDate(dateStr)?.label_jp ?? ""
}

// =====================================================
// 曜日名 → weekdayId（label_jp / label_en 対応）
// =====================================================
export function getWeekdayIdFromLabel(weekDay) {
  if (!weekDay) return null

  const lower = weekDay.toLowerCase()

  const match = DAY_OF_WEEK_MASTER.find(
    (d) =>
      d.label_jp === weekDay ||
      (d.label_en && d.label_en.toLowerCase() === lower)
  )

  return match?.id ?? null
}
