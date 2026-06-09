export const HUG_WM_BASE_URL = 'https://www.hug-ayumu.link/hug/wm/'
export const HUG_WM_CONTACT_BOOK_LIST_URL = `${HUG_WM_BASE_URL}contact_book.php`
export const HUG_WM_ATTENDANCE_URL = `${HUG_WM_BASE_URL}attendance.php`
export const HUG_WM_ATTENDANCE_AJAX_URL = `${HUG_WM_BASE_URL}ajax/ajax_attendance.php`

export const CONTACT_BOOK_TABLE_SELECTOR =
  'table.table.lh1_5[data-api-url="contact_book.php"][data-concurrent-edit-target="ContactBook"]'

/** attendance.php 内の施設選択 select */
export const FACILITY_SELECT_SELECTOR =
  'body > div.contents > form > div > div:nth-child(2) > div:nth-child(2) > select'

export const ATTENDANCE_FACILITY_OPTIONS = [
  { id: 3, value: 'PD吉島', defaultChecked: true },
  { id: 6, value: 'PD光', defaultChecked: false },
  { id: 7, value: 'PD横川', defaultChecked: false },
  { id: 8, value: 'PD五日市駅前', defaultChecked: false },
]

export const ATTENDANCE_SERVICE_FILTERS = [
  { id: 1, value: '放課後等デイサービス' },
  { id: 2, value: '児童発達支援' },
]

export const HUG_TIME_RE = /^\d{1,2}:\d{2}$/
export const ALERT_PREFS_STORAGE_KEY = 'hugAttendanceAlertPrefs'
export const HALF_TIME_STORAGE_KEY = 'hugAttendanceHalfTime'
export const SHOW_LEFT_RECORDS_STORAGE_KEY = 'hugAttendanceShowLeftRecords'
export const WEEKDAY_JA = ['日', '月', '火', '水', '木', '金', '土']
