export const HPR_ATTENDANCE_CACHE_KEY = 'hugPersonalRecordAttendanceCache'

export function loadHprAttendanceCache() {
  if (typeof localStorage === 'undefined') return null
  try {
    const raw = localStorage.getItem(HPR_ATTENDANCE_CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : null
  } catch {
    return null
  }
}

export function saveHprAttendanceCache(cache) {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(HPR_ATTENDANCE_CACHE_KEY, JSON.stringify(cache))
  } catch {
    /* ignore */
  }
}

export function hasCompleteHprAttendanceCache(cache) {
  return Boolean(
    cache?.attendanceDate &&
      Array.isArray(cache?.facilities) &&
      cache.facilities.length > 0 &&
      Array.isArray(cache?.attendanceChildren) &&
      cache.attendanceChildren.length > 0,
  )
}
