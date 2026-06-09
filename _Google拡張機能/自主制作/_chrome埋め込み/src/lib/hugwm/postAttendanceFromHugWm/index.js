import { fetchJson } from '@/lib/apiClient'
import { HUG_TIME_RE, HUG_WM_ATTENDANCE_AJAX_URL } from '../shared/constants'
import { parseHmToMinutes } from '../attendanceUtils'

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

const postAttendanceDataList = async (dataList) => {
  const body = new URLSearchParams()
  Object.entries(dataList).forEach(([key, value]) => {
    if (value !== undefined && value !== null) body.append(`data_list[${key}]`, String(value))
  })
  return fetchJson(HUG_WM_ATTENDANCE_AJAX_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'X-Requested-With': 'XMLHttpRequest',
    },
    body: body.toString(),
    credentials: 'include',
  })
}

export async function postEnterAttendance(row, mailFlg = 0) {
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

export async function postLeaveAttendance(row, mailFlg = 0) {
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
