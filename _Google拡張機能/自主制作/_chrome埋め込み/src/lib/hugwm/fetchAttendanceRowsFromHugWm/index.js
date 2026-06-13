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

const normalizeCellText = (cell) => {
  if (!cell) return ''
  const raw = cell.textContent ?? cell.innerText ?? ''
  return String(raw)
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const isHiddenTableCell = (cell) => {
  const style = String(cell?.getAttribute?.('style') ?? '')
  if (/display\s*:\s*none/i.test(style)) return true
  return cell?.hasAttribute?.('hidden') ?? false
}

/** 予定情報列（【時間】【担当】【PC】）。enter/leave/cost 等にも同名 class がある */
const PLAN_INFO_CELL_SELECTOR = 'td.maxW24rem.js-stableChangeCont01, td.maxW24rem'
const PLAN_INFO_TEXT_RE = /【(時間|担当|PC)】/

const findJsStableChangeCont01Td = (tr) => {
  if (!tr) return null

  const byPlanColumn = tr.querySelector(PLAN_INFO_CELL_SELECTOR)
  if (byPlanColumn) return byPlanColumn

  const cells = [...tr.querySelectorAll('td.js-stableChangeCont01')]
  const byPlanText = cells.find((cell) => PLAN_INFO_TEXT_RE.test(normalizeCellText(cell)))
  if (byPlanText) return byPlanText

  const excluded = cells.filter(
    (cell) =>
      !cell.classList.contains('enter') &&
      !cell.classList.contains('leave') &&
      !cell.classList.contains('cost') &&
      !cell.classList.contains('alunch') &&
      !cell.classList.contains('reserve_note'),
  )
  const withText = excluded.find((cell) => normalizeCellText(cell))
  if (withText) return withText

  return excluded.find((cell) => !isHiddenTableCell(cell)) ?? excluded[0] ?? null
}

const extractJsStableChangeCont01Text = (tr) =>
  normalizeCellText(findJsStableChangeCont01Td(tr))

const extractStatus = (statusTd, enterText, enterButton) => {
  const statusText = normalizeCellText(statusTd)
  if (statusText) return statusText
  if (enterText.includes('欠席') && !enterButton) return '欠席'
  return ''
}

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
    const jsStableChangeCont01Td = findJsStableChangeCont01Td(tr)
    const enterButton = enterTd?.querySelector("button[onclick*='sendEnterMail']")
    const leaveButton = leaveTd?.querySelector("button[onclick*='sendLeaveMail']")
    const enterOnclick = enterButton?.getAttribute('onclick') || ''
    const leaveOnclick = leaveButton?.getAttribute('onclick') || ''
    const enterIsMailResolved = parseEnterIsMailFromOnclick(enterOnclick) ?? parseEnterIsMailFromCidSetting(enterTd)
    const enterText = normalizeCellText(enterTd)
    const jsStableChangeCont01Text = extractJsStableChangeCont01Text(tr)
    const isAbsenceStatus = enterText.includes('欠席') && !enterButton

    return {
      rowIndex,
      r_id: rId,
      c_id: cId,
      name: extractFuriganaName(realnameTd),
      enterTime: extractTime(enterTd),
      leaveTime: extractTime(leaveTd),
      jsStableChangeCont01Text,
      status: extractStatus(jsStableChangeCont01Td, enterText, enterButton),
      enterOnclick,
      leaveOnclick,
      isEnterMailEnabled: enterIsMailResolved === 1,
      leaveIsMail: parseLeaveIsMailFromOnclick(leaveOnclick),
      detailPageDate,
      isAbsenceStatus,
      absenceLabel: isAbsenceStatus ? enterText : '',
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