import { formatFetchError, fetchJson } from './apiClient'
import { getFormattedDate } from '@/utils/recordUtils'

export const HUG_WM_BASE_URL = 'https://www.hug-ayumu.link/hug/wm/'
export const HUG_WM_CONTACT_BOOK_LIST_URL = `${HUG_WM_BASE_URL}contact_book.php`
const CONTACT_BOOK_TABLE_SELECTOR =
  'table.table.lh1_5[data-api-url="contact_book.php"][data-concurrent-edit-target="ContactBook"]'
const HUG_ATTENDANCE_URL = `${HUG_WM_BASE_URL}attendance.php`
const HUG_ATTENDANCE_AJAX_URL = `${HUG_WM_BASE_URL}ajax/ajax_attendance.php`
export const ATTENDANCE_FACILITY_OPTIONS = [
  { id: 3, value: 'PD吉島', defaultChecked: true },
  { id: 6, value: 'PD舟入', defaultChecked: false },
  { id: 7, value: 'PD横川', defaultChecked: false },
  { id: 8, value: 'PD廿日市駅前', defaultChecked: false },
]
const ATTENDANCE_SERVICE_FILTERS = [
  { id: 1, value: '放課後等デイサービス' },
  { id: 2, value: '児童発達支援' },
]

const fetchHugText = async (url, options = { method: 'GET', credentials: 'include' }) => {
  if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
    const response = await chrome.runtime.sendMessage({
      type: 'api-fetch',
      url,
      options,
    })
    if (!response?.ok) throw new Error(formatFetchError({ ...response, url }))
    return typeof response.body === 'string' ? response.body : JSON.stringify(response.body)
  }

  const res = await fetch(url, options)
  if (!res.ok) throw new Error(`HUG HTML取得エラー: ${res.status}`)
  return res.text()
}

const buildContactBookListUrl = ({ facilityId, date, dateEnd, childId, page }) => {
  const url = new URL(HUG_WM_CONTACT_BOOK_LIST_URL)
  url.searchParams.set('f_id', String(facilityId))
  url.searchParams.set('date', date)
  url.searchParams.set('date_end', dateEnd)
  url.searchParams.set('id', String(childId))
  if (page != null) url.searchParams.set('page', String(page))
  return url.href
}

const extractTime = (cell) => {
  const text = cell?.innerText?.trim() || ''
  return text.match(/\b\d{1,2}:\d{2}\b/)?.[0] || ''
}

const normalizePersonName = (raw) => String(raw ?? '').replace(/\s+/g, ' ').trim()

const extractFuriganaName = (realnameRoot) =>
  normalizePersonName(
    realnameRoot?.querySelector('.nameBox span.furigana')?.textContent ||
      realnameRoot?.querySelector('span.furigana')?.textContent ||
      realnameRoot?.querySelector('rt.furigana')?.textContent ||
      realnameRoot?.textContent,
  )

const parseEnterIsMailFromOnclick = (enterOnclick) => {
  const match = String(enterOnclick || '').match(/sendEnterMail\s*\(\s*['"]?([^'",)]+)['"]?\s*,\s*([^,]+)/)
  if (!match) return null
  const value = Number(String(match[2]).trim())
  return Number.isNaN(value) ? null : value
}

const parseEnterIsMailFromCidSetting = (enterTd) => {
  const raw = enterTd?.getAttribute?.('data-cidsetting')
  if (!raw) return null
  try {
    const arr = JSON.parse(raw.replace(/&quot;/g, '"'))
    const value = Number(String(arr?.[0] ?? '').trim())
    return Number.isNaN(value) ? null : value
  } catch {
    return null
  }
}

const parseLeaveIsMailFromOnclick = (leaveOnclick) => {
  const match = String(leaveOnclick || '').match(/sendLeaveMail\s*\(\s*['"]?[^'",)]+['"]?\s*,\s*([^,]+)/)
  if (!match) return null
  const value = Number(String(match[1]).trim())
  return Number.isNaN(value) ? null : value
}

const extractAttendanceRowsFromHtml = (html) => {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const table = doc.querySelector('table.sortTable01:not(.sortTableAdding):not(.js_adding_table)')
  if (!table) return []

  const detailPageDate =
    doc.querySelector('input[name="s_date"]')?.value ||
    doc.querySelector('input[name="date"]')?.value ||
    ''

  return [...table.querySelectorAll('tbody tr')].map((tr, rowIndex) => {
    const link = tr.querySelector(".realname a[href*='profile_children.php']")
    const cId = link?.getAttribute('href')?.match(/id=(\d+)/)?.[1] || ''
    const rId = tr.className.match(/children(\d+)/)?.[1] || ''
    const realnameTd = tr.querySelector('td.realname')
    const enterTd = tr.querySelector('td.enter')
    const leaveTd = tr.querySelector('td.leave')
    const enterButton = enterTd?.querySelector("button[onclick*='sendEnterMail']")
    const leaveButton = leaveTd?.querySelector("button[onclick*='sendLeaveMail']")
    const enterOnclick = enterButton?.getAttribute('onclick') || ''
    const leaveOnclick = leaveButton?.getAttribute('onclick') || ''
    const enterIsMailResolved = parseEnterIsMailFromOnclick(enterOnclick) ?? parseEnterIsMailFromCidSetting(enterTd)
    const enterText = enterTd?.innerText?.replace(/\s+/g, ' ').trim() || ''

    return {
      rowIndex,
      r_id: rId,
      c_id: cId,
      name: extractFuriganaName(realnameTd),
      enterTime: extractTime(enterTd),
      leaveTime: extractTime(leaveTd),
      enterOnclick,
      leaveOnclick,
      isEnterMailEnabled: enterIsMailResolved === 1,
      leaveIsMail: parseLeaveIsMailFromOnclick(leaveOnclick),
      detailPageDate,
      isAbsenceStatus: enterText.includes('欠席') && !enterButton,
      absenceLabel: enterText.includes('欠席') && !enterButton ? enterText : '',
    }
  })
}

const buildAttendanceSearchParams = (date, facilityMap) => {
  const params = new URLSearchParams()
  params.set('mode', 'search_detail')
  ATTENDANCE_FACILITY_OPTIONS.forEach((option) => {
    if (facilityMap[String(option.id)] ?? option.defaultChecked) {
      params.set(`f_ary[${option.id}]`, option.value)
    }
  })
  ATTENDANCE_SERVICE_FILTERS.forEach((option) => params.set(`s_ary[${option.id}]`, option.value))
  params.set('s_date', date.replaceAll('-', '/'))
  return params
}

export const fetchAttendanceRows = async ({ date, facilityMap }) => {
  const body = buildAttendanceSearchParams(date, facilityMap)
  const html = await fetchHugText(HUG_ATTENDANCE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
    body: body.toString(),
    credentials: 'include',
  })
  return extractAttendanceRowsFromHtml(html)
}

const parseEnterOnclick = (source) => {
  const onclick = String(source || '')
  const match =
    onclick.match(
      /sendEnterMail\s*\(\s*['"]?([^'",)]+)['"]?\s*,\s*([^,]+)\s*,\s*([^,]+)\s*,\s*([^,]+)\s*,\s*([^,]+)\s*,\s*([^,]+)\s*,\s*['"]?([^'",)]+)['"]?\s*,\s*([^,]+)\s*,\s*([^,]+)\s*,\s*([^)]+)\s*\)/,
    ) ||
    onclick.match(
      /sendEnterMail\s*\(\s*['"]?([^'",)]+)['"]?\s*,\s*([^,]+)\s*,\s*([^,]+)\s*,\s*([^,]+)\s*,\s*([^,]+)\s*,\s*([^,]+)\s*,\s*['"]?([^'",)]+)['"]?\s*,\s*([^)]+)\s*\)/,
    )

  if (!match) throw new Error('入室ボタンのonclickを解析できませんでした。')
  const [, rId, isMail, cId, fId, attendFlg, linkage, date, strengthAction, specialSupport = '0', mealAdd = '0'] = match
  return {
    r_id: String(rId).trim(),
    is_mail: Number(String(isMail).trim()),
    c_id: Number(String(cId).trim()),
    f_id: Number(String(fId).trim()),
    attend_flg: Number(String(attendFlg).trim()),
    linkage: Number(String(linkage).trim()),
    date: String(date).trim(),
    strength_action: Number(String(strengthAction).trim()),
    special_support: Number(String(specialSupport).trim()),
    meal_add: Number(String(mealAdd).trim()),
  }
}

const postAttendanceDataList = async (dataList) => {
  const body = new URLSearchParams()
  Object.entries(dataList).forEach(([key, value]) => {
    if (value !== undefined && value !== null) body.append(`data_list[${key}]`, String(value))
  })
  return fetchJson(HUG_ATTENDANCE_AJAX_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'X-Requested-With': 'XMLHttpRequest',
    },
    body: body.toString(),
    credentials: 'include',
  })
}

export const postEnterAttendance = async (row, mailFlg = 0) => {
  const parsed = parseEnterOnclick(row.enterOnclick)
  const dataList = {
    attendance_type: 1,
    r_id: parsed.r_id,
    mail_flg: Number(mailFlg),
    c_id: parsed.c_id,
    f_id: parsed.f_id,
    attend_flg: parsed.attend_flg,
    linkage: parsed.linkage,
    date: parsed.date,
    strength_action: parsed.strength_action,
    special_support: parsed.special_support,
    meal_add: parsed.meal_add,
  }
  const json = await postAttendanceDataList(dataList)
  return { dataList, json }
}

export const HUG_TIME_RE = /^\d{1,2}:\d{2}$/
const ALERT_PREFS_STORAGE_KEY = 'hugAttendanceAlertPrefs'
export const HALF_TIME_STORAGE_KEY = 'hugAttendanceHalfTime'
export const SHOW_LEFT_RECORDS_STORAGE_KEY = 'hugAttendanceShowLeftRecords'
export const WEEKDAY_JA = ['日', '月', '火', '水', '木', '金', '土']

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

/**
 * moc form-render.js の .hug-attendance-status / ツールバー件数と同形式
 */
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
    statusText: `最終取得: ${nowText} / 表示: ${displayEntries.length}件（全${attendanceList.length}件）${hiddenClosedNote} / 経過アラート: ${alertCount} / 欠席: ${absenceCount}`,
    toolbarSummary: `${displayEntries.length}件表示${hiddenClosedNote} / 経過アラート ${alertCount}件 / 欠席 ${absenceCount}件 / ${timeText}`,
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

const parseLeaveOnclick = (source) => {
  const match = String(source || '').match(
    /sendLeaveMail\s*\(\s*['"]?([^'",)]+)['"]?\s*,\s*([^,]+)\s*,\s*([^,]+)\s*,\s*([^,]+)\s*,\s*([^,]+)\s*,\s*([^)]+)\s*\)/,
  )
  if (!match) throw new Error('退室ボタンのonclickを解析できませんでした。')
  const [, rId, isMail, cId, fId, attendFlg, linkage] = match
  return {
    r_id: String(rId).trim(),
    is_mail: Number(String(isMail).trim()),
    c_id: Number(String(cId).trim()),
    f_id: Number(String(fId).trim()),
    attend_flg: Number(String(attendFlg).trim()),
    linkage: Number(String(linkage).trim()),
  }
}

const buildLeavePatchFromRow = (row, mailFlg = 0) => {
  const date = String(row.detailPageDate || '').trim()
  const enter = String(row.enterTime || '').trim()
  let leave = String(row.leaveTime || '').trim()
  if (!date) throw new Error('日付が取得できませんでした。')
  if (!HUG_TIME_RE.test(enter)) throw new Error('退室登録には入室時刻が必要です。')
  if (!leave) {
    const now = new Date()
    leave = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`
  }
  if (!HUG_TIME_RE.test(leave)) throw new Error('退室時刻が不正です。')
  let diff = parseHmToMinutes(leave) - parseHmToMinutes(enter)
  if (diff < 0) diff += 24 * 60
  return {
    date,
    enter_time_hi: enter,
    leave_time_hi: leave,
    diff_check_time: diff,
    interval_time: `${Math.floor(diff / 60)}時間${diff % 60}分`,
    hidden_mail_only: '',
    mail_flg: Number(mailFlg),
  }
}

export const postLeaveAttendance = async (row, mailFlg = 0) => {
  const args = parseLeaveOnclick(row.leaveOnclick)
  const dataList = {
    ...buildLeavePatchFromRow(row, mailFlg),
    attendance_type: 2,
    r_id: args.r_id,
    c_id: args.c_id,
    f_id: args.f_id,
    attend_flg: args.attend_flg,
    linkage: args.linkage,
  }
  const json = await postAttendanceDataList(dataList)
  return { dataList, json }
}

const normalizeListDate = (text) => {
  const match = String(text || '').trim().replace(/\s+/g, '').match(/(\d{4})[/-](\d{1,2})[/-](\d{1,2})/)
  if (!match) return ''
  return `${match[1]}-${String(match[2]).padStart(2, '0')}-${String(match[3]).padStart(2, '0')}`
}

const extractEditPathFromOnclick = (onclick) => String(onclick || '').match(/location\.href\s*=\s*['"]([^'"]+)['"]/)?.[1] || ''

const parsePersonalRecordRows = (html) => {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const table = doc.querySelector(CONTACT_BOOK_TABLE_SELECTOR)
  if (!table) throw new Error('個人記録一覧テーブルが見つかりません。HUG WMにログイン済みか確認してください。')
  return [...table.querySelectorAll('tbody tr')]
    .map((row) => {
      const cells = row.querySelectorAll('td')
      const onclick = row.querySelector('button.edit')?.getAttribute('onclick') || ''
      const editPath = extractEditPathFromOnclick(onclick)
      if (!editPath) return null
      return {
        date: cells[0]?.textContent.trim() || '',
        dateNorm: normalizeListDate(cells[0]?.textContent),
        childName: (cells[1]?.textContent || '').trim().replace(/\s+/g, ' '),
        attendance: (cells[4]?.textContent || '').trim().replace(/\s+/g, ' '),
        onclick,
        editPath,
      }
    })
    .filter(Boolean)
}

const fetchPersonalRecordList = async ({ facilityId, date, dateEnd, childId }) => {
  const html = await fetchHugText(buildContactBookListUrl({ facilityId, date, dateEnd: dateEnd || date, childId }))
  return parsePersonalRecordRows(html)
}

const fetchContactBookEditData = async (pathOrUrl) => {
  const editPath = pathOrUrl
  const editHtml = await fetchHugText(new URL(pathOrUrl, HUG_WM_BASE_URL).href)
  const doc = new DOMParser().parseFromString(editHtml, 'text/html')
  const note = doc.querySelector('textarea[name="note"][data-field-key="note"]')?.value.trim()
  if (note == null) throw new Error('note の textarea が見つかりません。')
  const select = doc.querySelector('select[name="record_staff"]')
  const recordStaff = select
    ? {
        value: select.value,
        text: select.selectedOptions[0]?.textContent.trim() || '',
        options: [...select.options].map((option) => ({
          value: option.value,
          text: option.textContent.trim(),
          selected: option.selected,
        })),
      }
    : null
  return { note, recordStaff, editHtml, editPath }
}

export const fetchPersonalRecordWithNote = async ({ facilityId, date, dateEnd, childId }) => {
  const rows = await fetchPersonalRecordList({ facilityId, date, dateEnd, childId })
  const target = normalizeListDate(dateEnd || date)
  const row = rows.find((item) => item.dateNorm === target && item.attendance === '出席') || rows.find((item) => item.dateNorm === target) || rows[0]
  if (!row) throw new Error('対象日の個人記録が見つかりません。')
  return { ...row, ...(await fetchContactBookEditData(row.editPath)) }
}

const buildMonthWindows = (maxMonths = 6) => {
  const windows = []
  const today = getFormattedDate(new Date())
  for (let offset = 0; offset < maxMonths; offset += 1) {
    const now = new Date()
    const start = new Date(now.getFullYear(), now.getMonth() - offset, 1)
    const end = new Date(now.getFullYear(), now.getMonth() - offset + 1, 0)
    const dateStart = getFormattedDate(start)
    const dateEnd = offset === 0 && getFormattedDate(end) >= today ? getFormattedDate(new Date(Date.now() - 86400000)) : getFormattedDate(end)
    if (dateEnd >= dateStart) windows.push({ monthOffset: offset, dateStart, dateEnd })
  }
  return windows
}

export const fetchPersonalRecordUntilFound = async ({ facilityId, childId, onProgress }) => {
  for (const window of buildMonthWindows()) {
    onProgress?.(`${window.dateStart}～${window.dateEnd} を検索中...`)
    const rows = await fetchPersonalRecordList({ facilityId, date: window.dateStart, dateEnd: window.dateEnd, childId })
    const row = rows
      .filter((item) => item.dateNorm >= window.dateStart && item.dateNorm <= window.dateEnd)
      .sort((a, b) => b.dateNorm.localeCompare(a.dateNorm))
      .find((item) => item.attendance === '出席') || rows[0]
    if (row) return { ...row, ...(await fetchContactBookEditData(row.editPath)), monthWindow: window }
  }
  throw new Error('過去6か月分を検索しましたが、個人記録が見つかりませんでした。')
}

const applyContactBookWafTransforms = (text) =>
  String(text ?? '')
    .replace(/"/g, 'カンマ')
    .replace(/\u201d/g, 'ゼカンマ')
    .replace(/\(/g, 'カッコマエ')
    .replace(/\)/g, 'カッコアト')
    .replace(/\bor\b/gi, '__OR__')
    .replace(/\blike\b/gi, '__LIKE__')

export const postContactBookUpdateFromEditHtml = async (editHtml, { note, recordStaff, state = '1' }) => {
  const doc = new DOMParser().parseFromString(editHtml, 'text/html')
  const form = doc.querySelector('#form_id')
  if (!form) throw new Error('#form_id が見つかりません。')
  const stateEl = form.querySelector('input[name="state"]')
  if (stateEl) stateEl.value = String(state)
  const recordStaffSelect = form.querySelector('select[name="record_staff"]')
  if (recordStaffSelect && recordStaff) recordStaffSelect.value = String(recordStaff)
  const noteInput = form.querySelector('textarea[name="note"]')
  const noteHide = form.querySelector('textarea[name="note_hide"]')
  if (noteInput && noteHide) {
    noteInput.value = note
    noteHide.value = applyContactBookWafTransforms(noteInput.value)
    noteInput.disabled = true
  }
  const staffInput = form.querySelector('textarea[name="staff_note"]')
  const staffHide = form.querySelector('textarea[name="staff_note_hide"]')
  if (staffInput && staffHide) {
    staffHide.value = applyContactBookWafTransforms(staffInput.value)
    staffInput.disabled = true
  }
  const formData = new FormData(form)
  formData.append('is_ajax_request', '1')
  const postUrl = new URL(form.getAttribute('action') || 'contact_book.php', HUG_WM_BASE_URL).href
  const res = await fetch(postUrl, { method: 'POST', body: formData, credentials: 'include' })
  const text = await res.text()
  if (!res.ok) throw new Error(`個人記録保存に失敗しました (${res.status}): ${text.slice(0, 200)}`)
  return { ok: res.ok, status: res.status, text, postUrl }
}
