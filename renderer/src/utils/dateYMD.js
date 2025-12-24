// src/utils/dateYMD.js
// 年月日（YYYY-MM-DD）専用ユーティリティ

/**
 * 今日の日付を YYYY-MM-DD で返す
 */
export const getTodayYmdString = () => {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/**
 * YYYY-MM-DD → { year, month, day }
 */
export const parseYmdString = (ymd) => {
  if (!ymd) return null

  const [year, month, day] = ymd.split('-').map(Number)

  return {
    year,
    month,
    day,
  }
}

/**
 * { year, month, day } → YYYY-MM-DD
 */
export const buildYmdString = ({ year, month, day }) => {
  if (!year || !month || !day) return ""

  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

/**
 * YYYY-MM-DD → Date オブジェクト
 */
export const ymdToDate = (ymd) => {
  if (!ymd) return null
  return new Date(`${ymd}T00:00:00`)
}

/**
 * 日付を加算・減算（±日）
 */
export const addDaysToYmd = (ymd, diffDays) => {
  const d = ymdToDate(ymd)
  if (!d) return ""

  d.setDate(d.getDate() + diffDays)

  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')

  return `${y}-${m}-${day}`
}
