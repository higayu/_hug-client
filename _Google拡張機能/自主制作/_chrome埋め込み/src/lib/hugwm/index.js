export {
  ATTENDANCE_FACILITY_OPTIONS,
  HALF_TIME_STORAGE_KEY,
  HUG_TIME_RE,
  HUG_WM_BASE_URL,
  HUG_WM_CONTACT_BOOK_LIST_URL,
  SHOW_LEFT_RECORDS_STORAGE_KEY,
  WEEKDAY_JA,
} from './shared/constants'

export { hugWmFetch, hugWmFetchText } from './shared/fetch'

export { checkHugWmLoginStatus, parseHugWmLoginStatusFromHtml } from './checkHugWmLoginStatus'
export { parseLoginFormFieldsFromHtml, postLoginFromHugWm } from './postLoginFromHugWm'
export { fetchFacilitiesFromHugWm } from './fetchFacilitiesFromHugWm'
export { fetchChildrenFromHugWm } from './fetchChildrenFromHugWm'
export { fetchAttendanceRows, fetchAttendanceRowsForFacility } from './fetchAttendanceRowsFromHugWm'
export { postEnterAttendance, postLeaveAttendance } from './postAttendanceFromHugWm'
export {
  fetchPersonalRecordUntilFound,
  fetchPersonalRecordWithNote,
  postContactBookUpdateFromEditHtml,
} from './fetchPersonalRecordFromHugWm'
export {
  addAttendanceFlags,
  formatAttendanceFetchStatus,
  normalizeHalfTime,
  parseHmToMinutes,
  setAlertPref,
} from './attendanceUtils'
