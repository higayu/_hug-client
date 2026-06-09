import { ALERT_PREFS_STORAGE_KEY, HUG_TIME_RE } from '../shared/constants'

export const parseHmToMinutes = (hm) => {
  const match = String(hm ?? '').trim().match(/^(\d{1,2}):(\d{2})$/)
  if (!match) return null
  return Number(match[1]) * 60 + Number(match[2])
}

export const normalizeHalfTime = (value) => {
  const minutes = parseHmToMinutes(value)
  if (minutes == null) return '12:00'
  const h = Math.min(23, Math.max(0, Math.floor(minutes / 60)))
  const m = Math.min(59, Math.max(0, minutes % 60))
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

const getWeekdayIndexFromDetailDate = (dateText) => {
  const date = new Date(String(dateText || '').replace(/\//g, '-'))
  return Number.isNaN(date.getTime()) ? new Date().getDay() : date.getDay()
}

const alertPrefKey = (weekdayIndex, childId) => `${Number(weekdayIndex)}-${String(childId || '').trim()}`

const readAlertPrefs = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(ALERT_PREFS_STORAGE_KEY) || '{}')
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

const getAlertPref = (weekdayIndex, childId) => {
  const row = readAlertPrefs()[alertPrefKey(weekdayIndex, childId)]
  return {
    alertType: Number.isFinite(row?.alertType) ? row.alertType : 1,
    alertAfterMinutes: Number.isFinite(row?.alertAfterMinutes) ? row.alertAfterMinutes : 120,
    amPmFlag: Number(row?.amPmFlag) >= 1 ? 1 : 0,
  }
}

export const setAlertPref = (weekdayIndex, childId, patch) => {
  const prefs = readAlertPrefs()
  const key = alertPrefKey(weekdayIndex, childId)
  prefs[key] = { ...getAlertPref(weekdayIndex, childId), ...patch }
  localStorage.setItem(ALERT_PREFS_STORAGE_KEY, JSON.stringify(prefs))
}

const isHiddenClosedAttendanceRow = (row) =>
  HUG_TIME_RE.test(String(row?.leaveTime || '').trim()) || Boolean(row?.isAbsenceStatus)

/** moc form-render.js の .hug-attendance-status / ツールバー件数と同形式 */
export const formatAttendanceFetchStatus = (attendanceList, showLeftRecords, fetchedAt) => {
  const at = fetchedAt instanceof Date ? fetchedAt : new Date(fetchedAt)
  const showLeftFlag = Number(showLeftRecords) >= 1 ? 1 : 0
  const hiddenClosedCount = attendanceList.filter(isHiddenClosedAttendanceRow).length
  const displayEntries = attendanceList.filter(
    (item) => showLeftFlag === 1 || !isHiddenClosedAttendanceRow(item),
  )
  const alertCount = displayEntries.filter((item) => item.isOverTwoHours).length
  const absenceCount = displayEntries.filter((item) => item.isAbsenceStatus).length
  const hiddenClosedNote =
    showLeftFlag === 0 && hiddenClosedCount > 0
      ? ` / 退室済み・欠席 非表示 ${hiddenClosedCount}件`
      : ''
  const nowText = at.toLocaleString()
  const timeText = at.toLocaleTimeString()

  return {
    statusText: `表示: ${displayEntries.length}件（全${attendanceList.length}件）${hiddenClosedNote} / 経過アラート: ${alertCount} / 欠席: ${absenceCount}`,
    statusLastFetchedText: nowText,
    toolbarSummary: `${displayEntries.length}件表示${hiddenClosedNote} / 経過アラート ${alertCount}件 / 欠席 ${absenceCount}件`,
    toolbarLastFetchedText: timeText,
  }
}

export const addAttendanceFlags = (rows) =>
  rows.map((row) => {
    const weekdayIndex = getWeekdayIndexFromDetailDate(row.detailPageDate)
    const pref = getAlertPref(weekdayIndex, row.c_id)
    const enterMinutes = parseHmToMinutes(row.enterTime)
    const now = new Date()
    const nowMinutes = now.getHours() * 60 + now.getMinutes()
    const elapsed = enterMinutes == null ? 0 : nowMinutes - enterMinutes
    return {
      ...row,
      hugWeekdayIndex: weekdayIndex,
      hugAlertPref: pref,
      isOverTwoHours:
        !row.isAbsenceStatus &&
        HUG_TIME_RE.test(String(row.enterTime || '').trim()) &&
        !HUG_TIME_RE.test(String(row.leaveTime || '').trim()) &&
        pref.alertType > 0 &&
        elapsed >= pref.alertAfterMinutes,
    }
  })
