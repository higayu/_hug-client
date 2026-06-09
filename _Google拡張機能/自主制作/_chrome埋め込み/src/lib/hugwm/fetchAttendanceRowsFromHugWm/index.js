import {
  ATTENDANCE_FACILITY_OPTIONS,
  ATTENDANCE_SERVICE_FILTERS,
  HUG_WM_ATTENDANCE_URL,
} from '../shared/constants'
import { hugWmFetch } from '../shared/fetch'

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

const buildAttendanceSearchParams = (date, facilityMap, facilities = []) => {
  const params = new URLSearchParams()
  params.set('mode', 'search_detail')

  const resolvedFacilities = facilities?.length
    ? facilities
    : ATTENDANCE_FACILITY_OPTIONS.map((option) => ({
        facility_id: option.id,
        name: option.value,
        selected: option.defaultChecked,
      }))

  resolvedFacilities.forEach((facility) => {
    if (facilityMap[String(facility.facility_id)]) {
      params.set(`f_ary[${facility.facility_id}]`, facility.name)
    }
  })

  ATTENDANCE_SERVICE_FILTERS.forEach((option) => params.set(`s_ary[${option.id}]`, option.value))
  params.set('s_date', date.replaceAll('-', '/'))
  return params
}

const buildAttendanceSearchParamsForFacility = (date, facilityId, facilityName) => {
  const params = new URLSearchParams()
  params.set('mode', 'search_detail')
  params.set(`f_ary[${facilityId}]`, facilityName)
  ATTENDANCE_SERVICE_FILTERS.forEach((option) => params.set(`s_ary[${option.id}]`, option.value))
  params.set('s_date', date.replaceAll('-', '/'))
  return params
}

const postAttendanceSearch = async (body) => {
  const html = await hugWmFetch(HUG_WM_ATTENDANCE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
    body: body.toString(),
    credentials: 'include',
  })
  return extractAttendanceRowsFromHtml(html)
}

export async function fetchAttendanceRows({ date, facilityMap, facilities }) {
  return postAttendanceSearch(buildAttendanceSearchParams(date, facilityMap, facilities))
}

export async function fetchAttendanceRowsForFacility({ date, facilityId, facilityName }) {
  return postAttendanceSearch(buildAttendanceSearchParamsForFacility(date, facilityId, facilityName))
}
