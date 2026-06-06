export const getFormattedDate = (date) => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export const formatRecordDate = (targetDate) => String(targetDate || '').split('T')[0] || '-'

export const sortRecordsByDateDesc = (records) =>
  [...records].sort((a, b) => formatRecordDate(b.target_date).localeCompare(formatRecordDate(a.target_date)))

export const filterRecordsByDateRange = (records, startDate, endDate) =>
  records.filter((record) => {
    const date = formatRecordDate(record.target_date)
    return date >= startDate && date <= endDate
  })
