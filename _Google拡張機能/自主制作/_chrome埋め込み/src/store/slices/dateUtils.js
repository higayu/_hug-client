export const getFormattedDate = (date) => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export const getDefaultDateRange = () => {
  const end = new Date()
  const start = new Date()
  start.setMonth(start.getMonth() - 1)
  return { start: getFormattedDate(start), end: getFormattedDate(end) }
}
