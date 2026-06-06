import { useEffect, useMemo, useState } from 'react'
import {
  Menu,
  X,
  FileEdit,
  MessageSquare,
  LayoutDashboard,
  UserSquare,
  User,
  Search,
  ArrowLeft,
  Send,
  Wand2,
  Save,
  History,
  Settings,
  PlayCircle,
  Download,
  Check,
  RefreshCw,
  ChevronDown,
} from 'lucide-react'
import './App.css'

const NAV_LINKS = [
  { key: 'correction', label: '入退室管理', icon: FileEdit },
  { key: 'chat', label: 'AI問い合わせ', icon: MessageSquare },
  { key: 'dashboard', label: 'ダッシュボード', icon: LayoutDashboard },
  { key: 'personal-record', label: '個人記録', icon: UserSquare },
  { key: 'hug-personal-record', label: 'hugから個人記録取得', icon: UserSquare },
]

const PAGE_TITLES = {
  chat: 'AI問い合わせ機能（チャットボット）',
  correction: '入退室管理',
  dashboard: '管理ダッシュボード',
  'personal-record': '個人記録一覧',
  'hug-personal-record': 'hugから個人記録取得',
}

const SAMPLE_PR_RECORDS = [
  {
    id: 'A-1001',
    date: '2026-05-28',
    child: '山田 太郎',
    content: '午前中は集団活動に参加し、他児との会話を楽しみました。',
  },
  {
    id: 'A-1002',
    date: '2026-05-29',
    child: '山田 太郎',
    content: '午後の個別課題では集中力が続き、最後まで取り組めました。',
  },
]

const API_BASE =
  window.AI_CONFIG?.API_BASE ||
  import.meta.env.VITE_API_BASE ||
  'http://192.168.1.229:3001/api/sql/hug_ai_support'

const CORRECTION_SYSTEM_PROMPT =
  'あなたは児童支援記録の校正アシスタントです。入力された記録をF-SOAIP形式（事実・主観・客観・評価・計画）で整理・校正し、日本語で出力してください。'

const CHAT_SYSTEM_PROMPT =
  'あなたは児童支援記録の分析アシスタントです。提供された支援記録の事実に基づき、推測で断定せず丁寧に回答してください。'

const MOCK_FACILITIES = [
  { facility_id: 1, name: '吉島事業所' },
  { facility_id: 2, name: 'ひまわり教室' },
]

const MOCK_CHILDREN = {
  1: [
    { child_id: 1, name: '山田 太郎' },
    { child_id: 2, name: '佐藤 花子' },
  ],
  2: [{ child_id: 3, name: '鈴木 一郎' }],
}

const MOCK_RECORDS = SAMPLE_PR_RECORDS.map((record, index) => ({
  record_id: record.id,
  child_id: 1,
  target_date: `${record.date}T00:00:00.000Z`,
  content: record.content,
  index,
}))

const getFormattedDate = (date) => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const getDefaultDateRange = () => {
  const end = new Date()
  const start = new Date()
  start.setMonth(start.getMonth() - 1)
  return { start: getFormattedDate(start), end: getFormattedDate(end) }
}

const formatRecordDate = (targetDate) => String(targetDate || '').split('T')[0] || '-'

const sortRecordsByDateDesc = (records) =>
  [...records].sort((a, b) => formatRecordDate(b.target_date).localeCompare(formatRecordDate(a.target_date)))

const filterRecordsByDateRange = (records, startDate, endDate) =>
  records.filter((record) => {
    const date = formatRecordDate(record.target_date)
    return date >= startDate && date <= endDate
  })

const getAiSettings = () => {
  const cfg = window.AI_CONFIG || {}
  const provider = String(cfg.AI_PROVIDER || import.meta.env.VITE_AI_PROVIDER || 'ollama').toLowerCase()
  const defaultModel = cfg.AI_MODEL || import.meta.env.VITE_AI_MODEL || 'jp-assistant:latest'
  return {
    provider,
    model:
      provider === 'gemini'
        ? cfg.GEMINI_MODEL || import.meta.env.VITE_GEMINI_MODEL || defaultModel || 'gemini-2.0-flash'
        : cfg.OLLAMA_MODEL || import.meta.env.VITE_OLLAMA_MODEL || defaultModel,
    ollamaBaseUrl: (cfg.OLLAMA_BASE_URL || import.meta.env.VITE_OLLAMA_BASE_URL || 'http://localhost:11434').replace(/\/$/, ''),
    geminiApiKey: cfg.GEMINI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY || '',
  }
}

const formatFetchError = (response) => {
  const msg =
    response?.error ||
    (typeof response?.body === 'object' && response.body !== null
      ? response.body.message || response.body.error || response.body.sqlMessage
      : typeof response?.body === 'string'
        ? response.body.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
        : '') ||
    `HTTP ${response?.status}`

  if (/not allowed by cors/i.test(msg)) {
    return 'APIサーバーがChrome拡張機能からのリクエストを拒否しました。API側で chrome-extension:// のOriginを許可してください。'
  }
  return msg
}

const fetchJson = async (url, options = {}) => {
  if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
    const response = await chrome.runtime.sendMessage({ type: 'api-fetch', url, options })
    if (!response?.ok) throw new Error(formatFetchError({ ...response, url }))
    return response.body
  }

  const res = await fetch(url, options)
  const contentType = res.headers.get('content-type') || ''
  const body = contentType.includes('application/json') ? await res.json() : await res.text()
  if (!res.ok) throw new Error(formatFetchError({ status: res.status, body, url }))
  return body
}

const callGemini = async (messages, model, apiKey) => {
  if (!apiKey) throw new Error('GEMINI_API_KEY が設定されていません。')
  const contents = messages
    .filter((message) => message.role !== 'system')
    .map((message) => ({
      role: message.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: message.content }],
    }))
  const systemMessage = messages.find((message) => message.role === 'system')
  if (systemMessage && contents[0]) {
    contents[0].parts[0].text = `${systemMessage.content}\n\n${contents[0].parts[0].text}`
  }
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`
  const data = await fetchJson(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents }),
  })
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) throw new Error('Geminiからの応答が空でした。')
  return text
}

const callOllama = async (messages, model, baseUrl) => {
  const data = await fetchJson(`${baseUrl}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, messages, stream: false }),
  })
  const text = data?.message?.content
  if (!text) throw new Error('Ollamaからの応答が空でした。')
  return text
}

const callAi = async (messages) => {
  const { provider, model, ollamaBaseUrl, geminiApiKey } = getAiSettings()
  return provider === 'gemini'
    ? callGemini(messages, model, geminiApiKey)
    : callOllama(messages, model, ollamaBaseUrl)
}

const HUG_WM_BASE_URL = 'https://www.hug-ayumu.link/hug/wm/'
const HUG_WM_CONTACT_BOOK_LIST_URL = `${HUG_WM_BASE_URL}contact_book.php`
const CONTACT_BOOK_TABLE_SELECTOR =
  'table.table.lh1_5[data-api-url="contact_book.php"][data-concurrent-edit-target="ContactBook"]'
const HUG_ATTENDANCE_URL = `${HUG_WM_BASE_URL}attendance.php`
const HUG_ATTENDANCE_AJAX_URL = `${HUG_WM_BASE_URL}ajax/ajax_attendance.php`
const ATTENDANCE_FACILITY_OPTIONS = [
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

const fetchAttendanceRows = async ({ date, facilityMap }) => {
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

const postEnterAttendance = async (row, mailFlg = 0) => {
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

const HUG_TIME_RE = /^\d{1,2}:\d{2}$/
const ALERT_PREFS_STORAGE_KEY = 'hugAttendanceAlertPrefs'
const HALF_TIME_STORAGE_KEY = 'hugAttendanceHalfTime'
const SHOW_LEFT_RECORDS_STORAGE_KEY = 'hugAttendanceShowLeftRecords'
const WEEKDAY_JA = ['日', '月', '火', '水', '木', '金', '土']

const parseHmToMinutes = (hm) => {
  const match = String(hm ?? '').trim().match(/^(\d{1,2}):(\d{2})$/)
  if (!match) return null
  return Number(match[1]) * 60 + Number(match[2])
}

const normalizeHalfTime = (value) => {
  const minutes = parseHmToMinutes(value)
  if (minutes == null) return '12:00'
  const h = Math.min(23, Math.max(0, Math.floor(minutes / 60)))
  const m = Math.min(59, Math.max(0, minutes % 60))
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

const getStoredHalfTime = () => {
  try {
    return normalizeHalfTime(localStorage.getItem(HALF_TIME_STORAGE_KEY) || '12:00')
  } catch {
    return '12:00'
  }
}

const getStoredShowLeftRecords = () => {
  try {
    return localStorage.getItem(SHOW_LEFT_RECORDS_STORAGE_KEY) === '0' ? 0 : 1
  } catch {
    return 1
  }
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

const setAlertPref = (weekdayIndex, childId, patch) => {
  const prefs = readAlertPrefs()
  const key = alertPrefKey(weekdayIndex, childId)
  prefs[key] = { ...getAlertPref(weekdayIndex, childId), ...patch }
  localStorage.setItem(ALERT_PREFS_STORAGE_KEY, JSON.stringify(prefs))
}

const addAttendanceFlags = (rows) =>
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

const postLeaveAttendance = async (row, mailFlg = 0) => {
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

const fetchPersonalRecordWithNote = async ({ facilityId, date, dateEnd, childId }) => {
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

const fetchPersonalRecordUntilFound = async ({ facilityId, childId, onProgress }) => {
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

const postContactBookUpdateFromEditHtml = async (editHtml, { note, recordStaff, state = '1' }) => {
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

const hashToPage = (hash) => {
  const page = hash.replace(/^#\/?/, '')
  return NAV_LINKS.some((link) => link.key === page) ? page : 'chat'
}

function App() {
  const defaultDateRange = useMemo(() => getDefaultDateRange(), [])
  const [activePage, setActivePage] = useState('chat')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [chatStarted, setChatStarted] = useState(false)
  const [chatInput, setChatInput] = useState('')
  const [chatModel, setChatModel] = useState('Gemini 3.1 Flash')
  const [facilities, setFacilities] = useState([])
  const [childrenByFacility, setChildrenByFacility] = useState({})
  const [selectedFacilityId, setSelectedFacilityId] = useState('')
  const [selectedChildId, setSelectedChildId] = useState('')
  const [chatStartDate, setChatStartDate] = useState(defaultDateRange.start)
  const [chatEndDate, setChatEndDate] = useState(defaultDateRange.end)
  const [correctionDate, setCorrectionDate] = useState(getFormattedDate(new Date()))
  const [correctionOriginal, setCorrectionOriginal] = useState('今日の活動では、公園で遊びました。少し疲れた様子でした。')
  const [correctionAdditional, setCorrectionAdditional] = useState('')
  const [correctionText, setCorrectionText] = useState('')
  const [correctionModalOpen, setCorrectionModalOpen] = useState(false)
  const [correctionLoading, setCorrectionLoading] = useState(false)
  const [prStartDate, setPrStartDate] = useState(defaultDateRange.start)
  const [prEndDate, setPrEndDate] = useState(defaultDateRange.end)
  const [hprStartDate, setHprStartDate] = useState(defaultDateRange.start)
  const [hprEndDate, setHprEndDate] = useState(defaultDateRange.end)
  const [hprResults, setHprResults] = useState([])
  const [hprLoading, setHprLoading] = useState(false)
  const [hprNote, setHprNote] = useState('')
  const [hprCachedRecord, setHprCachedRecord] = useState(null)
  const [hprRecordStaff, setHprRecordStaff] = useState('')
  const [attendanceDate, setAttendanceDate] = useState(getFormattedDate(new Date()))
  const [attendanceRows, setAttendanceRows] = useState([])
  const [attendanceLoading, setAttendanceLoading] = useState(false)
  const [attendanceStatus, setAttendanceStatus] = useState('HUG WM にログインしたうえで「一覧を取得」を押してください。')
  const [sidePanelTab, setSidePanelTab] = useState('attendance')
  const [halfTime, setHalfTime] = useState(getStoredHalfTime)
  const [showLeftRecords, setShowLeftRecords] = useState(getStoredShowLeftRecords)
  const [attendanceFacilityMap, setAttendanceFacilityMap] = useState(() =>
    Object.fromEntries(ATTENDANCE_FACILITY_OPTIONS.map((option) => [String(option.id), option.defaultChecked])),
  )
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', content: '過去の支援記録をもとに質問してください。' },
  ])
  const [correctionMode, setCorrectionMode] = useState('simple')
  const [prResults, setPrResults] = useState([])
  const [prStatus, setPrStatus] = useState('条件を指定して「一覧を取得」を押してください。')
  const [selectedPr, setSelectedPr] = useState(null)
  const [hugStatus, setHugStatus] = useState('HUG WM にログインしたうえで実行してください。')

  useEffect(() => {
    document.body.classList.add('hug-attendance-primary-page')
    return () => document.body.classList.remove('hug-attendance-primary-page')
  }, [])

  useEffect(() => {
    const initial = hashToPage(window.location.hash)
    setActivePage(initial)

    const onHashChange = () => {
      const nextPage = hashToPage(window.location.hash)
      setActivePage(nextPage)
      if (nextPage !== 'chat') {
        setChatStarted(false)
      }
    }

    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  useEffect(() => {
    let mounted = true

    const loadChildren = async (facilityId) => {
      try {
        const data = await fetchJson(`${API_BASE}/children/_search?pk=facility_id&values=${facilityId}`)
        if (!mounted) return
        setChildrenByFacility((prev) => ({ ...prev, [facilityId]: data }))
        if (data[0]?.child_id) setSelectedChildId((current) => current || data[0].child_id)
      } catch (error) {
        console.warn('[loadChildren] fallback to mock data', error)
        const fallback = MOCK_CHILDREN[facilityId] || []
        if (!mounted) return
        setChildrenByFacility((prev) => ({ ...prev, [facilityId]: fallback }))
        if (fallback[0]?.child_id) setSelectedChildId((current) => current || fallback[0].child_id)
      }
    }

    const loadFacilities = async () => {
      try {
        const data = await fetchJson(`${API_BASE}/facilities`)
        if (!mounted) return
        setFacilities(data)
        const firstId = data[0]?.facility_id
        if (firstId) {
          setSelectedFacilityId(firstId)
          await loadChildren(firstId)
        }
      } catch (error) {
        console.warn('[loadFacilities] fallback to mock data', error)
        if (!mounted) return
        setFacilities(MOCK_FACILITIES)
        setSelectedFacilityId(MOCK_FACILITIES[0].facility_id)
        await loadChildren(MOCK_FACILITIES[0].facility_id)
      }
    }

    loadFacilities()
    return () => {
      mounted = false
    }
  }, [])

  const selectedChildren = useMemo(
    () => childrenByFacility[selectedFacilityId] || [],
    [childrenByFacility, selectedFacilityId],
  )

  const selectedFacilityName = useMemo(
    () => facilities.find((facility) => facility.facility_id === Number(selectedFacilityId))?.name || '',
    [facilities, selectedFacilityId],
  )

  const selectedChildName = useMemo(
    () => selectedChildren.find((child) => child.child_id === Number(selectedChildId))?.name || '',
    [selectedChildren, selectedChildId],
  )

  const displayAttendanceRows = useMemo(
    () =>
      attendanceRows
        .filter((row) => showLeftRecords === 1 || (!HUG_TIME_RE.test(String(row.leaveTime || '').trim()) && !row.isAbsenceStatus))
        .sort((a, b) => {
          const alertDiff = Number(b.hugAlertPref?.alertType || 0) - Number(a.hugAlertPref?.alertType || 0)
          if (alertDiff !== 0) return alertDiff
          return (parseHmToMinutes(a.enterTime) ?? 24 * 60) - (parseHmToMinutes(b.enterTime) ?? 24 * 60)
        }),
    [attendanceRows, showLeftRecords],
  )

  const handleFacilityChange = async (value) => {
    const facilityId = Number(value)
    setSelectedFacilityId(facilityId)
    const children = childrenByFacility[facilityId]
    if (children?.[0]?.child_id) {
      setSelectedChildId(children[0].child_id)
      return
    }

    try {
      const data = await fetchJson(`${API_BASE}/children/_search?pk=facility_id&values=${facilityId}`)
      setChildrenByFacility((prev) => ({ ...prev, [facilityId]: data }))
      setSelectedChildId(data[0]?.child_id || '')
    } catch (error) {
      console.warn('[handleFacilityChange] fallback to mock data', error)
      const fallback = MOCK_CHILDREN[facilityId] || []
      setChildrenByFacility((prev) => ({ ...prev, [facilityId]: fallback }))
      setSelectedChildId(fallback[0]?.child_id || '')
    }
  }

  const pageHeader = useMemo(() => PAGE_TITLES[activePage], [activePage])

  const selectPage = (page) => {
    setSidebarOpen(false)
    window.location.hash = `/${page}`
  }

  const loadSupportRecords = async (childId, startDate, endDate) => {
    try {
      const records = await fetchJson(`${API_BASE}/support_records/_search?pk=child_id&values=${childId}`)
      return filterRecordsByDateRange(records, startDate, endDate)
    } catch (error) {
      console.warn('[loadSupportRecords] fallback to mock records', error)
      return filterRecordsByDateRange(MOCK_RECORDS, startDate, endDate)
    }
  }

  const handleChatStart = async () => {
    if (!selectedChildId) {
      alert('児童を選択してください。')
      return
    }
    if (chatStartDate > chatEndDate) {
      alert('開始日は終了日以前にしてください。')
      return
    }
    const records = await loadSupportRecords(selectedChildId, chatStartDate, chatEndDate)
    const preview = records
      .slice(0, 5)
      .map((record) => `・${formatRecordDate(record.target_date)}: ${record.content}`)
      .join('\n')
    setChatMessages([
      {
        role: 'assistant',
        content:
          `${selectedFacilityName}・${selectedChildName}さんの支援記録を取得しました（${records.length}件）。\n\n` +
          (preview || '指定期間の記録は見つかりませんでした。') +
          '\n\n記録の検索や要約について質問できます。',
        records,
      },
    ])
    setChatStarted(true)
  }

  const handleChatBack = () => {
    setChatStarted(false)
  }

  const handleChatSend = async () => {
    const trimmed = chatInput.trim()
    if (!trimmed) return

    const records = chatMessages.find((message) => message.records)?.records || []
    const recordsText = records.length
      ? records.map((record) => `- ${formatRecordDate(record.target_date)}: ${record.content}`).join('\n')
      : '記録なし'
    const history = chatMessages
      .filter((message) => !message.records)
      .map((message) => ({
        role: message.role === 'assistant' ? 'assistant' : 'user',
        content: message.content,
      }))
    const loadingMessage = { role: 'assistant', content: 'AIが回答を生成しています...' }

    setChatMessages((prevMessages) => [
      ...prevMessages,
      { role: 'user', content: trimmed },
      loadingMessage,
    ])
    setChatInput('')

    try {
      const reply = await callAi([
        {
          role: 'system',
          content: `${CHAT_SYSTEM_PROMPT}\n\n児童: ${selectedChildName}\n期間: ${chatStartDate} ～ ${chatEndDate}\n\n支援記録:\n${recordsText}`,
        },
        ...history,
        { role: 'user', content: trimmed },
      ])
      setChatMessages((prevMessages) =>
        prevMessages.map((message) => (message === loadingMessage ? { role: 'assistant', content: reply } : message)),
      )
    } catch (error) {
      setChatMessages((prevMessages) =>
        prevMessages.map((message) =>
          message === loadingMessage
            ? { role: 'assistant', content: `AI応答の取得に失敗しました: ${error.message}` }
            : message,
        ),
      )
    }
  }

  const handleCorrectionMode = (mode) => {
    setCorrectionMode(mode)
  }

  const handleAttendanceFetch = async () => {
    setAttendanceLoading(true)
    setAttendanceStatus('HUG WM から入退室一覧を取得しています...')
    try {
      const rows = addAttendanceFlags(await fetchAttendanceRows({
        date: attendanceDate,
        facilityMap: attendanceFacilityMap,
      }))
      setAttendanceRows(rows)
      setAttendanceStatus(rows.length ? `${rows.length}件の入退室データを取得しました。` : '入退室データが見つかりませんでした。')
    } catch (error) {
      setAttendanceStatus(`取得に失敗しました: ${error.message}`)
    } finally {
      setAttendanceLoading(false)
    }
  }

  const handleAttendanceFacilityToggle = (facilityId, checked) => {
    setAttendanceFacilityMap((prev) => ({ ...prev, [String(facilityId)]: checked }))
  }

  const handleHalfTimeChange = (value) => {
    const normalized = normalizeHalfTime(value)
    setHalfTime(normalized)
    localStorage.setItem(HALF_TIME_STORAGE_KEY, normalized)
  }

  const handleShowLeftRecordsChange = (value) => {
    const next = Number(value) >= 1 ? 1 : 0
    setShowLeftRecords(next)
    localStorage.setItem(SHOW_LEFT_RECORDS_STORAGE_KEY, String(next))
  }

  const handleAlertPrefChange = (row, field, value) => {
    const numberValue = Number(value)
    if (Number.isNaN(numberValue)) return
    setAlertPref(row.hugWeekdayIndex, row.c_id, {
      [field]: field === 'amPmFlag' ? (numberValue >= 1 ? 1 : 0) : Math.max(0, Math.floor(numberValue)),
    })
    setAttendanceRows((rows) => addAttendanceFlags(rows))
  }

  const handlePostEnter = async (row) => {
    if (!row.enterOnclick) {
      alert('この行には入室ボタンがありません。')
      return
    }
    const mailFlg = row.isEnterMailEnabled && window.confirm(`${row.name} さんの入室メールを送信しますか？`) ? 1 : 0
    setAttendanceStatus(`${row.name} さんの入室を登録しています...`)
    try {
      await postEnterAttendance(row, mailFlg)
      setAttendanceStatus(`${row.name} さんの入室を登録しました。一覧を更新しています...`)
      await handleAttendanceFetch()
    } catch (error) {
      setAttendanceStatus(`入室登録に失敗しました: ${error.message}`)
    }
  }

  const handlePostLeave = async (row) => {
    if (!row.leaveOnclick) {
      alert('この行には退室ボタンがありません。')
      return
    }
    const mailFlg = Number(row.leaveIsMail) === 1 && window.confirm(`${row.name} さんの退室メールを送信しますか？`) ? 1 : 0
    setAttendanceStatus(`${row.name} さんの退室を登録しています...`)
    try {
      await postLeaveAttendance(row, mailFlg)
      setAttendanceStatus(`${row.name} さんの退室を登録しました。一覧を更新しています...`)
      await handleAttendanceFetch()
    } catch (error) {
      setAttendanceStatus(`退室登録に失敗しました: ${error.message}`)
    }
  }

  const handlePrSearch = async () => {
    if (!selectedChildId) {
      alert('児童を選択してください。')
      return
    }
    if (prStartDate > prEndDate) {
      alert('開始日は終了日以前にしてください。')
      return
    }
    setPrStatus('記録を取得しています...')
    const records = sortRecordsByDateDesc(await loadSupportRecords(selectedChildId, prStartDate, prEndDate)).map(
      (record) => ({
        id: record.record_id ?? record.id,
        date: formatRecordDate(record.target_date),
        child: selectedChildName,
        content: record.content || '',
      }),
    )
    setPrResults(records)
    setPrStatus(records.length ? `${records.length}件の記録を取得しました。` : '指定条件の記録は見つかりませんでした。')
    setSelectedPr(null)
  }

  const handlePrSelect = (record) => {
    setSelectedPr(record)
  }

  const handlePrClose = () => {
    setSelectedPr(null)
  }

  const handleCorrect = async () => {
    if (!correctionOriginal.trim()) {
      alert('校正する文章を入力してください。')
      return
    }
    setCorrectionLoading(true)
    try {
      const reply = await callAi([
        { role: 'system', content: CORRECTION_SYSTEM_PROMPT },
        {
          role: 'user',
          content: [
            `元文章:\n${correctionOriginal}`,
            correctionAdditional.trim() ? `追加指示:\n${correctionAdditional}` : '',
          ]
            .filter(Boolean)
            .join('\n\n'),
        },
      ])
      setCorrectionText(reply)
      setCorrectionModalOpen(true)
    } catch (error) {
      alert(`AI校正に失敗しました: ${error.message}`)
    } finally {
      setCorrectionLoading(false)
    }
  }

  const handleRegister = async () => {
    const content = (correctionText || correctionOriginal).trim()
    if (!content) {
      alert('登録する記録内容がありません。')
      return
    }
    if (!selectedChildId) {
      alert('児童を選択してください。')
      return
    }
    if (!window.confirm(`支援日 ${correctionDate} の記録として登録します。よろしいですか？`)) return

    try {
      await fetchJson(`${API_BASE}/support_records`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          child_id: Number(selectedChildId),
          user_id: 1,
          content,
          target_date: correctionDate,
        }),
      })
      alert('DBへの登録が完了しました。')
      setCorrectionOriginal('')
      setCorrectionText('')
      setCorrectionModalOpen(false)
    } catch (error) {
      alert(`登録に失敗しました: ${error.message}`)
    }
  }

  const handleHugFetch = async () => {
    if (!selectedChildId) {
      alert('児童を選択してください。')
      return
    }
    if (hprStartDate > hprEndDate) {
      alert('開始日は終了日以前にしてください。')
      return
    }
    setHprLoading(true)
    setHprResults([])
    setHprCachedRecord(null)
    setHprNote('')
    setHugStatus('HUG WM から取得しています...')
    try {
      const record = await fetchPersonalRecordWithNote({
        facilityId: Number(selectedFacilityId),
        date: hprStartDate,
        dateEnd: hprEndDate,
        childId: Number(selectedChildId),
      })
      setHprResults([record])
      setHprCachedRecord(record)
      setHprNote(record.note || '')
      setHprRecordStaff(record.recordStaff?.value || '')
      setHugStatus(`取得しました: ${record.date} / ${record.childName}`)
    } catch (error) {
      setHugStatus(`取得に失敗しました: ${error.message}`)
    } finally {
      setHprLoading(false)
    }
  }

  const handleHugMonthFetch = async () => {
    if (!selectedChildId) {
      alert('児童を選択してください。')
      return
    }
    setHprLoading(true)
    setHprResults([])
    setHprCachedRecord(null)
    setHprNote('')
    setHugStatus('過去月を検索しています...')
    try {
      const record = await fetchPersonalRecordUntilFound({
        facilityId: Number(selectedFacilityId),
        childId: Number(selectedChildId),
        onProgress: setHugStatus,
      })
      setHprStartDate(record.dateNorm || hprStartDate)
      setHprEndDate(record.dateNorm || hprEndDate)
      setHprResults([record])
      setHprCachedRecord(record)
      setHprNote(record.note || '')
      setHprRecordStaff(record.recordStaff?.value || '')
      setHugStatus(`取得しました: ${record.date} / ${record.childName}`)
    } catch (error) {
      setHugStatus(`取得に失敗しました: ${error.message}`)
    } finally {
      setHprLoading(false)
    }
  }

  const handleHugSave = async (state) => {
    if (!hprCachedRecord?.editHtml) {
      alert('先に個人記録を取得してください。')
      return
    }
    if (state === '2' && !window.confirm('公開で更新します。よろしいですか？')) return
    setHprLoading(true)
    setHugStatus(state === '2' ? '公開保存しています...' : '下書き保存しています...')
    try {
      await postContactBookUpdateFromEditHtml(hprCachedRecord.editHtml, {
        note: hprNote,
        recordStaff: hprRecordStaff,
        state,
      })
      setHugStatus(state === '2' ? '公開保存しました。' : '下書き保存しました。')
    } catch (error) {
      setHugStatus(`保存に失敗しました: ${error.message}`)
    } finally {
      setHprLoading(false)
    }
  }

  const pageDescription = useMemo(() => {
    switch (activePage) {
      case 'chat':
        return '過去のデータをもとにAIと対話を行います。'
      case 'correction':
        return 'HUG WM の入退室一覧を取得し、入室登録を行います。'
      case 'dashboard':
        return 'プロンプト管理とバッチ処理のステータスを確認します。'
      case 'personal-record':
        return '児童ごとの支援記録（support_records）を期間指定で表示します。'
      case 'hug-personal-record':
        return 'HUG WM の連絡帳一覧から「出席」の日のみ編集画面を開き、活動内容（note）を取得します。'
      default:
        return ''
    }
  }, [activePage])

  return (
    <div className="app-container">
      <div id="mobile-header" className="mobile-header">
        <h2>入退室管理システム</h2>
        <button
          id="mobile-menu-btn"
          className="mobile-menu-btn"
          type="button"
          aria-label="メニュー"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu size={20} />
        </button>
      </div>

      <div
        id="mobile-overlay"
        className={`mobile-overlay ${sidebarOpen ? 'visible' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      <div id="sidebar-wrap">
        <aside className={`sidebar-container ${sidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-header">
            <h2>入退室管理システム</h2>
            <button
              id="sidebar-close"
              className="sidebar-close-btn"
              type="button"
              aria-label="閉じる"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={18} />
            </button>
          </div>
          <nav className="sidebar-nav">
            {NAV_LINKS.map((link) => {
              const Icon = link.icon
              return (
                <button
                  key={link.key}
                  type="button"
                  className={`nav-link ${activePage === link.key ? 'active' : ''}`}
                  onClick={() => selectPage(link.key)}
                >
                  <Icon size={18} />
                  <span>{link.label}</span>
                </button>
              )
            })}
          </nav>
          <div className="sidebar-footer">
            <div className="user-info">
              <div className="user-avatar">
                <User size={18} />
              </div>
              <div>
                <div className="user-name">平野 義幸</div>
                <div className="user-facility">吉島事業所</div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <main id="main-content" className="main-content">
        <header className="mb-4">
          <h1>{pageHeader}</h1>
          <p style={{ color: 'var(--text-light)' }}>{pageDescription}</p>
        </header>

        <section id="page-chat" className={`page ${activePage === 'chat' ? 'active' : ''}`}>
          <div className={`card chat-selection-card ${chatStarted ? 'hidden' : ''}`}>
            <h2 className="mb-4">対象データ選択</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
              <div>
                <label className="label">事業所</label>
                <select id="chat-facility" className="input-field" value={selectedFacilityId} onChange={(event) => handleFacilityChange(event.target.value)}>
                  {facilities.map((facility) => (
                    <option key={facility.facility_id} value={facility.facility_id}>{facility.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">児童</label>
                <select id="chat-child" className="input-field" value={selectedChildId} onChange={(event) => setSelectedChildId(Number(event.target.value))}>
                  {selectedChildren.map((child) => (
                    <option key={child.child_id} value={child.child_id}>{child.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">取得期間</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input type="date" id="chat-start-date" className="input-field" value={chatStartDate} onChange={(event) => setChatStartDate(event.target.value)} />
                  <span>～</span>
                  <input type="date" id="chat-end-date" className="input-field" value={chatEndDate} onChange={(event) => setChatEndDate(event.target.value)} />
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <button id="btn-chat-start" type="button" className="btn btn-primary" onClick={handleChatStart}>
                <Search size={16} /> チャット開始
              </button>
            </div>
          </div>

          <div id="chat-room" className={`card chat-container ${chatStarted ? '' : 'hidden'}`}>
            <div className="chat-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
                <button id="btn-chat-back" type="button" className="btn btn-secondary" style={{ padding: '0.4rem', flexShrink: 0 }} onClick={handleChatBack}>
                  <ArrowLeft size={16} />
                </button>
                <h3 id="chat-room-title" className="chat-header-title">会話ルーム</h3>
              </div>
              <select
                className="input-field"
                style={{ padding: '0.3rem', width: 'auto', fontSize: '0.875rem' }}
                value={chatModel}
                onChange={(event) => setChatModel(event.target.value)}
              >
                <option>Gemini 3.1 Flash</option>
                <option>Gemini 3.1 Pro (複雑用)</option>
              </select>
            </div>
            <div id="chat-messages" className="chat-messages" style={{ minHeight: '12rem', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
              {chatMessages.map((message, index) => (
                <div key={index} style={{ marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <strong style={{ fontSize: '0.9rem' }}>{message.role === 'assistant' ? 'AI' : 'ユーザー'}</strong>
                  </div>
                  <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{message.content}</div>
                </div>
              ))}
            </div>
            <div className="chat-input-area">
              <div className="chat-input-row" style={{ display: 'flex', gap: '0.75rem' }}>
                <textarea
                  id="chat-input"
                  className="input-field"
                  rows="2"
                  style={{ flex: 1, minHeight: 'auto', resize: 'none', padding: '0.75rem' }}
                  placeholder="質問や指示を入力..."
                  value={chatInput}
                  onChange={(event) => setChatInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                      event.preventDefault()
                      handleChatSend()
                    }
                  }}
                />
                <button id="btn-chat-send" type="button" className="btn btn-primary" style={{ padding: '0 1rem', height: 42, flexShrink: 0 }} onClick={handleChatSend}>
                  <Send size={16} />
                </button>
              </div>
              <p className="chat-hint" style={{ marginTop: '0.5rem', color: 'var(--text-light)' }}>
                Shift + Enter で改行、Enter で送信
              </p>
            </div>
          </div>
        </section>

        <section id="page-correction" className={`page ${activePage === 'correction' ? 'active' : ''}`}>
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="flex justify-between items-center mb-4" style={{ marginBottom: '1rem', gap: '1rem', flexWrap: 'wrap' }}>
              <h2 style={{ margin: 0, fontSize: '1.125rem' }}>HUG WM 入退室一覧</h2>
              <button type="button" className="btn btn-primary" onClick={handleAttendanceFetch} disabled={attendanceLoading}>
                <RefreshCw size={16} /> {attendanceLoading ? '取得中...' : '一覧を取得'}
              </button>
            </div>

            <div className="responsive-flex" style={{ marginBottom: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label className="label">出席表日付</label>
                <input
                  type="date"
                  className="input-field"
                  value={attendanceDate}
                  onChange={(event) => setAttendanceDate(event.target.value)}
                />
              </div>
              <div style={{ flex: 2 }}>
                <label className="label">施設フィルタ</label>
                <div className="attendance-filter-list">
                  {ATTENDANCE_FACILITY_OPTIONS.map((option) => (
                    <label key={option.id} className="attendance-filter-item">
                      <input
                        type="checkbox"
                        checked={Boolean(attendanceFacilityMap[String(option.id)])}
                        onChange={(event) => handleAttendanceFacilityToggle(option.id, event.target.checked)}
                      />
                      <span>{option.value}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <p style={{ color: 'var(--text-light)', fontSize: '0.875rem', marginBottom: '1rem' }}>{attendanceStatus}</p>

            <div className={`table-wrap ${attendanceRows.length === 0 ? 'hidden' : ''}`}>
              <table className="data-table attendance-table">
                <thead>
                  <tr>
                    <th>児童</th>
                    <th style={{ width: '5.5rem' }}>入室</th>
                    <th style={{ width: '5.5rem' }}>退室</th>
                    <th>状態</th>
                    <th style={{ width: '6rem' }}>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceRows.map((row) => (
                    <tr key={`${row.c_id}-${row.r_id}-${row.rowIndex}`}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{row.name || `ID ${row.c_id}`}</div>
                        <div style={{ color: 'var(--text-light)', fontSize: '0.75rem' }}>c_id: {row.c_id || '-'}</div>
                      </td>
                      <td>{row.enterTime || '-'}</td>
                      <td>{row.leaveTime || '-'}</td>
                      <td>
                        {row.isAbsenceStatus ? row.absenceLabel : row.enterOnclick ? '入室登録可' : row.enterTime ? '入室済み' : '-'}
                        {row.isEnterMailEnabled ? ' / メール確認あり' : ''}
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-primary"
                          style={{ padding: '0.35rem 0.65rem' }}
                          onClick={() => handlePostEnter(row)}
                          disabled={!row.enterOnclick || attendanceLoading}
                        >
                          入室
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <h2 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>支援記録AI校正</h2>
          <div className="tab-bar">
            <button type="button" className={`btn tab-btn ${correctionMode === 'simple' ? 'active-simple' : ''}`} onClick={() => handleCorrectionMode('simple')}>
              案1: シンプル重視
            </button>
            <button type="button" className={`btn tab-btn ${correctionMode === 'advanced' ? 'active-advanced' : ''}`} onClick={() => handleCorrectionMode('advanced')}>
              案2: 多機能・利便性重視
            </button>
          </div>
          <div className="card">
            <div className="responsive-flex" style={{ marginBottom: '1.5rem' }}>
              <div style={{ flex: 1 }}>
                <label className="label">事業所</label>
                <select id="correction-facility" className="input-field" value={selectedFacilityId} onChange={(event) => handleFacilityChange(event.target.value)}>
                  {facilities.map((facility) => (
                    <option key={facility.facility_id} value={facility.facility_id}>{facility.name}</option>
                  ))}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label className="label">児童</label>
                <select id="correction-child" className="input-field" value={selectedChildId} onChange={(event) => setSelectedChildId(Number(event.target.value))}>
                  {selectedChildren.map((child) => (
                    <option key={child.child_id} value={child.child_id}>{child.name}</option>
                  ))}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label className="label">支援日</label>
                <input type="date" id="correction-date" className="input-field" value={correctionDate} onChange={(event) => setCorrectionDate(event.target.value)} />
              </div>
            </div>

            <div id="correction-simple-panel" className={correctionMode === 'simple' ? '' : 'hidden'}>
              <div className="prompt-box" style={{ marginBottom: '1.5rem' }}>
                <label className="label">校正の仕方の指示プロンプト（編集不可）</label>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-light)', margin: 0 }}>
                  放課後等デイサービスの支援記録について、以下の文章をF-SOAIPに沿った形式に校正してください。
                </p>
              </div>
            </div>

            <div id="correction-advanced-panel" className={correctionMode === 'advanced' ? '' : 'hidden'}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div className="prompt-box">
                  <label className="label">校正の仕方の指示プロンプト（編集不可）</label>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-light)', margin: 0 }}>
                    放課後等デイサービスの支援記録について、以下の文章をF-SOAIPに沿った形式に校正してください。
                  </p>
                </div>
                <div>
                  <label className="label">追加プロンプト（任意）</label>
                  <textarea id="correction-additional" className="input-field" rows="2" placeholder="例：保護者への感謝の気持ちを追加してください。" value={correctionAdditional} onChange={(event) => setCorrectionAdditional(event.target.value)} />
                </div>
              </div>
            </div>

            <div>
              <label className="label">支援記録コメント欄に記載する文章</label>
              <textarea id="correction-original" className="input-field" rows="6" placeholder="記録を入力してください..." value={correctionOriginal} onChange={(event) => setCorrectionOriginal(event.target.value)} />
            </div>
            <div className="flex justify-end gap-4 mt-4" style={{ marginTop: '1rem', gap: '1rem' }}>
              <button id="btn-register" type="button" className="btn btn-secondary" onClick={handleRegister}>
                <Save size={16} /> 登録する
              </button>
              <button id="btn-correct" type="button" className="btn btn-primary" onClick={handleCorrect} disabled={correctionLoading}>
                <Wand2 size={16} /> {correctionLoading ? '校正中...' : 'AIで校正する'}
              </button>
            </div>
          </div>
        </section>

        <section id="page-dashboard" className={`page ${activePage === 'dashboard' ? 'active' : ''}`}>
          <div className="responsive-grid">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {[
                {
                  title: '📊 AIプロンプト（解析用）',
                  text: 'この児童のメンタル不調の傾向やデイを解約しそうな兆候がないか解析し、要約してください。',
                },
                {
                  title: '📊 AIプロンプト（校正用）',
                  text: '放課後等デイサービスの支援記録について、以下の文章をF-SOAIPに沿った形式に校正してください。',
                },
                {
                  title: '📊 AIプロンプト（問い合わせ用）',
                  text: '提供された過去の支援記録の事実のみに基づいて回答すること。推測で嘘をつかないこと。',
                },
              ].map((item) => (
                <div key={item.title} className="card">
                  <h3 className="flex items-center gap-2" style={{ margin: '0 0 1rem' }}>
                    <Settings size={18} /> {item.title}
                  </h3>
                  <textarea className="input-field mb-4" defaultValue={item.text} />
                  <div className="flex justify-end gap-2">
                    <button type="button" className="btn btn-secondary">
                      <History size={16} /> 変更履歴
                    </button>
                    <button type="button" className="btn btn-primary">
                      <Save size={16} /> 保存
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="card">
                <h3 className="mb-4">⚙️ バッチ処理コントロール</h3>
                <div style={{ padding: '1rem', background: 'var(--bg-color)', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
                  <div className="flex justify-between mb-4">
                    <span className="label" style={{ margin: 0 }}>現在のステータス</span>
                    <span className="badge badge-success">🟢 待機中</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="label" style={{ margin: 0 }}>前回の実行日時</span>
                    <span style={{ fontSize: '0.875rem' }}>2026/03/01 02:00 (成功)</span>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button type="button" className="btn btn-primary" style={{ width: '100%' }}>
                    <PlayCircle size={16} /> バッチ起動
                  </button>
                </div>
              </div>
              <div className="card">
                <h3 className="mb-4">📊 AI API 使用状況（今月）</h3>
                {[
                  { name: 'Gemini 3.1 Pro', value: '$12.50', width: '40%', color: 'primary' },
                  { name: 'Gemini 3.1 Flash Lite', value: '$3.20', width: '15%', color: 'secondary' },
                ].map((item) => (
                  <div key={item.name} style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                    <div className="flex justify-between items-center mb-4">
                      <span style={{ fontWeight: 600 }}>{item.name}</span>
                      <span style={{ fontSize: '1.25rem', fontWeight: 700, color: item.color === 'primary' ? 'var(--primary-color)' : 'var(--secondary-color)' }}>
                        {item.value}
                      </span>
                    </div>
                    <div className="progress-bar" style={{ height: 8, background: 'var(--border-color)', borderRadius: '999px' }}>
                      <div className={`progress-fill ${item.color}`} style={{ width: item.width, height: '100%', borderRadius: '999px' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="page-personal-record" className={`page ${activePage === 'personal-record' ? 'active' : ''}`}>
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ marginBottom: '1rem', fontSize: '1.125rem' }}>検索条件</h2>
            <div className="responsive-flex" style={{ marginBottom: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label className="label">事業所</label>
                <select id="pr-facility" className="input-field" value={selectedFacilityId} onChange={(event) => handleFacilityChange(event.target.value)}>
                  {facilities.map((facility) => (
                    <option key={facility.facility_id} value={facility.facility_id}>{facility.name}</option>
                  ))}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label className="label">児童</label>
                <select id="pr-child" className="input-field" value={selectedChildId} onChange={(event) => setSelectedChildId(Number(event.target.value))}>
                  {selectedChildren.map((child) => (
                    <option key={child.child_id} value={child.child_id}>{child.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label className="label">取得期間</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <input type="date" id="pr-start-date" className="input-field" style={{ flex: 1, minWidth: '10rem' }} value={prStartDate} onChange={(event) => setPrStartDate(event.target.value)} />
                <span>～</span>
                <input type="date" id="pr-end-date" className="input-field" style={{ flex: 1, minWidth: '10rem' }} value={prEndDate} onChange={(event) => setPrEndDate(event.target.value)} />
              </div>
            </div>
            <div className="flex justify-end">
              <button id="btn-pr-search" type="button" className="btn btn-primary" onClick={handlePrSearch}>
                <Search size={16} /> 一覧を取得
              </button>
            </div>
          </div>
          <div className="card">
            <div className="flex justify-between items-center mb-4" style={{ marginBottom: '1rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.125rem' }}>記録一覧</h2>
              <span className="badge badge-primary">{prResults.length}件</span>
            </div>
            <p style={{ color: 'var(--text-light)', fontSize: '0.875rem', marginBottom: '1rem' }}>{prStatus}</p>
            <div id="pr-table-wrap" className={`table-wrap ${prResults.length === 0 ? 'hidden' : ''}`}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: '7rem' }}>支援日</th>
                    <th>記録内容</th>
                    <th style={{ width: '5rem' }}>ID</th>
                  </tr>
                </thead>
                <tbody id="pr-tbody">
                  {prResults.map((record) => (
                    <tr key={record.id} className={selectedPr?.id === record.id ? 'selected' : ''} onClick={() => handlePrSelect(record)}>
                      <td>{record.date}</td>
                      <td>{record.content}</td>
                      <td>{record.id}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div id="pr-detail-card" className={`card ${selectedPr ? '' : 'hidden'}`} style={{ marginTop: '1.5rem' }}>
            <div className="flex justify-between items-center mb-4">
              <h3 style={{ margin: 0 }}>記録の詳細</h3>
              <button id="btn-pr-detail-close" type="button" className="btn btn-secondary" style={{ padding: '0.35rem 0.75rem' }} onClick={handlePrClose}>
                閉じる
              </button>
            </div>
            {selectedPr && (
              <dl className="record-detail-dl">
                <dt>記録ID</dt>
                <dd>{selectedPr.id}</dd>
                <dt>支援日</dt>
                <dd>{selectedPr.date}</dd>
                <dt>児童</dt>
                <dd>{selectedPr.child}</dd>
                <dt>記録内容</dt>
                <dd className="record-detail-content">{selectedPr.content}</dd>
              </dl>
            )}
          </div>
        </section>

        <section id="page-hug-personal-record" className={`page ${activePage === 'hug-personal-record' ? 'active' : ''}`}>
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ marginBottom: '1rem', fontSize: '1.125rem' }}>検索条件</h2>
            <div className="responsive-flex" style={{ marginBottom: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label className="label">事業所（f_id）</label>
                <select id="hpr-facility" className="input-field" value={selectedFacilityId} onChange={(event) => handleFacilityChange(event.target.value)}>
                  {facilities.map((facility) => (
                    <option key={facility.facility_id} value={facility.facility_id}>{facility.name}</option>
                  ))}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label className="label">児童（id）</label>
                <select id="hpr-child" className="input-field" value={selectedChildId} onChange={(event) => setSelectedChildId(Number(event.target.value))}>
                  {selectedChildren.map((child) => (
                    <option key={child.child_id} value={child.child_id}>{child.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label className="label">取得期間</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <input type="date" id="hpr-start-date" className="input-field" style={{ flex: 1, minWidth: '10rem' }} value={hprStartDate} onChange={(event) => setHprStartDate(event.target.value)} />
                <span>～</span>
                <input type="date" id="hpr-end-date" className="input-field" style={{ flex: 1, minWidth: '10rem' }} value={hprEndDate} onChange={(event) => setHprEndDate(event.target.value)} />
              </div>
            </div>
            <div className="flex justify-end">
              <button id="btn-hpr-fetch" type="button" className="btn btn-primary" onClick={handleHugFetch} disabled={hprLoading}>
                <Download size={16} /> {hprLoading ? '取得中...' : '取得'}
              </button>
            </div>
          </div>
          <div className="card">
            <div className="flex justify-between items-center mb-4" style={{ marginBottom: '1rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.125rem' }}>取得結果</h2>
              <span className="badge badge-primary">{hprResults.length}件</span>
            </div>
            <p style={{ color: 'var(--text-light)', marginBottom: '1rem', fontSize: '0.9rem' }}>{hugStatus}</p>
            <div className={`table-wrap ${hprResults.length === 0 ? 'hidden' : ''}`}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: '7rem' }}>日付</th>
                    <th style={{ width: '8rem' }}>児童名</th>
                    <th>活動内容（note）</th>
                  </tr>
                </thead>
                <tbody>
                  {hprResults.map((record, index) => (
                    <tr key={`${record.date}-${index}`}>
                      <td>{record.date}</td>
                      <td>{record.childName}</td>
                      <td style={{ whiteSpace: 'pre-wrap' }}>{record.note || '取得できませんでした。'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>

      <div id="hug-sidepanel-host" className="hug-sidepanel-host" aria-label="HUG業務パネル">
        <nav className="hug-sidepanel-tabs" role="tablist" aria-label="機能切り替え">
          <button
            type="button"
            className={`hug-sidepanel-tab-btn ${sidePanelTab === 'attendance' ? 'active' : ''}`}
            role="tab"
            data-tab="attendance"
            aria-selected={sidePanelTab === 'attendance' ? 'true' : 'false'}
            aria-controls="hug-tab-attendance"
            onClick={() => setSidePanelTab('attendance')}
          >
            入退室管理
          </button>
          <button
            type="button"
            className={`hug-sidepanel-tab-btn ${sidePanelTab === 'personal-record' ? 'active' : ''}`}
            role="tab"
            data-tab="personal-record"
            aria-selected={sidePanelTab === 'personal-record' ? 'true' : 'false'}
            aria-controls="hug-tab-personal-record"
            onClick={() => setSidePanelTab('personal-record')}
          >
            個人記録
          </button>
        </nav>

        <div className="hug-sidepanel-panels">
          <section
            id="hug-tab-attendance"
            className={`hug-sidepanel-tab-panel ${sidePanelTab === 'attendance' ? 'active' : ''}`}
            role="tabpanel"
            data-tab-panel="attendance"
            hidden={sidePanelTab !== 'attendance'}
          >
            <div id="hug-attendance-panel" className="hug-sidepanel-tab-mount hug-sidepanel-form-root">
              <div className="hug-sidepanel-toolbar">
                <div className="hug-sidepanel-toolbar-meta">
                  <div className="hug-attendance-count">
                    {displayAttendanceRows.length}件表示 / 全{attendanceRows.length}件 / 経過アラート {displayAttendanceRows.filter((row) => row.isOverTwoHours).length}件
                  </div>
                  <div className="hug-enter-mail-badge">
                    {attendanceRows.some((row) => row.isEnterMailEnabled) ? 'メール確認ありの入室があります' : 'メール確認なし'}
                  </div>
                </div>
                <button type="button" className="hug-refresh-button" onClick={handleAttendanceFetch} disabled={attendanceLoading}>
                  {attendanceLoading ? '取得中...' : '更新'}
                </button>
              </div>

              <div className="hug-attendance-status">
                <div className="hug-sidepanel-controls">
                  <label>
                    出席表日付
                    <input
                      type="date"
                      value={attendanceDate}
                      onChange={(event) => setAttendanceDate(event.target.value)}
                    />
                  </label>
                  <div className="hug-facility-checks">
                    {ATTENDANCE_FACILITY_OPTIONS.map((option) => (
                      <label key={option.id}>
                        <input
                          type="checkbox"
                          checked={Boolean(attendanceFacilityMap[String(option.id)])}
                          onChange={(event) => handleAttendanceFacilityToggle(option.id, event.target.checked)}
                        />
                        {option.value}
                      </label>
                    ))}
                  </div>
                  <div className="hug-panel-settings-bar">
                    <label>
                      ハーフタイム
                      <input type="time" value={halfTime} step="60" onChange={(event) => handleHalfTimeChange(event.target.value)} />
                    </label>
                    <label>
                      退室済み
                      <select value={showLeftRecords} onChange={(event) => handleShowLeftRecordsChange(event.target.value)}>
                        <option value="1">表示</option>
                        <option value="0">非表示</option>
                      </select>
                    </label>
                  </div>
                </div>
                <div>{attendanceStatus}</div>
              </div>

              <div className="hug-attendance-body">
                {displayAttendanceRows.length === 0 ? (
                  <div className="hug-empty-message">HUG WM にログインしたうえで「更新」を押してください。</div>
                ) : (
                  <table className="hug-attendance-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>氏名</th>
                        <th title="0=オフ、1=パネル強調、2=別ウィンドウ相当">種別</th>
                        <th title="入室からこの分数経過でアラート">経過(分)</th>
                        <th>曜日</th>
                        <th>午前/午後</th>
                        <th>入室</th>
                        <th>退室</th>
                        <th>状態</th>
                        <th>入退室POST</th>
                        <th>加算記録</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayAttendanceRows.map((row) => (
                        <tr key={`${row.c_id}-${row.r_id}-${row.rowIndex}`} className={`${row.isOverTwoHours ? 'hug-over-two-hours' : ''}`}>
                          <td>{row.c_id || '-'}</td>
                          <td>
                            <button
                              type="button"
                              className="hug-name-button"
                              onClick={() => window.open(`${HUG_WM_CONTACT_BOOK_LIST_URL}?id=${encodeURIComponent(row.c_id)}&hug_auto_personal=1`, '_blank', 'noopener,noreferrer')}
                            >
                              {row.name || `ID ${row.c_id}`}
                            </button>
                          </td>
                          <td>
                            <input
                              type="number"
                              min="0"
                              max="99"
                              value={row.hugAlertPref?.alertType ?? 1}
                              onChange={(event) => handleAlertPrefChange(row, 'alertType', event.target.value)}
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              min="0"
                              value={row.hugAlertPref?.alertAfterMinutes ?? 120}
                              onChange={(event) => handleAlertPrefChange(row, 'alertAfterMinutes', event.target.value)}
                            />
                          </td>
                          <td>{WEEKDAY_JA[row.hugWeekdayIndex] || '-'}</td>
                          <td>
                            <select
                              value={row.hugAlertPref?.amPmFlag ?? 0}
                              onChange={(event) => handleAlertPrefChange(row, 'amPmFlag', event.target.value)}
                            >
                              <option value="0">午前</option>
                              <option value="1">午後</option>
                            </select>
                          </td>
                          <td>{row.enterTime || '-'}</td>
                          <td>{row.leaveTime || '-'}</td>
                          <td>
                            {row.isAbsenceStatus ? '欠席' : row.isOverTwoHours ? `${row.hugAlertPref?.alertAfterMinutes ?? 120}分超過` : '通常'}
                          </td>
                          <td>
                            <div className="hug-post-actions">
                              <button
                                type="button"
                                className={`hug-row-action ${row.isEnterMailEnabled ? 'hug-btn-has-mail' : ''}`}
                                onClick={() => handlePostEnter(row)}
                                disabled={!row.enterOnclick || attendanceLoading}
                              >
                                入室
                              </button>
                              <button
                                type="button"
                                className={`hug-row-action ${row.isOverTwoHours ? 'hug-leave-alert' : ''}`}
                                onClick={() => handlePostLeave(row)}
                                disabled={!row.leaveOnclick || !HUG_TIME_RE.test(String(row.enterTime || '').trim()) || attendanceLoading}
                              >
                                退室
                              </button>
                            </div>
                          </td>
                          <td>
                            <button
                              type="button"
                              className="hug-row-action hug-secondary-action"
                              onClick={() => window.open(`${HUG_WM_BASE_URL}record_proceedings.php?mode=edit&select_child=${encodeURIComponent(row.c_id)}`, '_blank', 'noopener,noreferrer')}
                              disabled={!row.c_id}
                            >
                              移動
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </section>

          <section
            id="hug-tab-personal-record"
            className={`hug-sidepanel-tab-panel ${sidePanelTab === 'personal-record' ? 'active' : ''}`}
            role="tabpanel"
            data-tab-panel="personal-record"
            hidden={sidePanelTab !== 'personal-record'}
          >
            <div id="hug-personal-record-form" className="hug-sidepanel-tab-mount hug-sidepanel-form-root">
              <section className="hug-form-section hug-form-section-attendance">
                <div className="hug-form-section-title">出席表・児童一覧</div>
                <div className="hug-pr-grid">
                  <label>
                    出席表日付
                    <input type="date" value={attendanceDate} onChange={(event) => setAttendanceDate(event.target.value)} />
                  </label>
                  <button type="button" onClick={handleAttendanceFetch} disabled={attendanceLoading}>
                    児童を再取得
                  </button>
                </div>
              </section>

              <section className="hug-form-section hug-form-section-personal">
                <div className="hug-form-section-title">個人記録</div>
                <div className="hug-pr-grid">
                  <label>
                    事業所
                    <select value={selectedFacilityId} onChange={(event) => handleFacilityChange(event.target.value)}>
                      {facilities.map((facility) => (
                        <option key={facility.facility_id} value={facility.facility_id}>{facility.name}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    児童
                    <select value={selectedChildId} onChange={(event) => setSelectedChildId(Number(event.target.value))}>
                      {selectedChildren.map((child) => (
                        <option key={child.child_id} value={child.child_id}>{child.name}</option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className="hug-pr-grid">
                  <label>
                    開始日
                    <input type="date" value={hprStartDate} onChange={(event) => setHprStartDate(event.target.value)} />
                  </label>
                  <label>
                    終了日
                    <input type="date" value={hprEndDate} onChange={(event) => setHprEndDate(event.target.value)} />
                  </label>
                </div>
                <div className="hug-pr-actions">
                  <button type="button" onClick={handleHugMonthFetch} disabled={hprLoading}>
                    過去の自動検索
                  </button>
                  <button type="button" className="hug-pr-fetch-btn" onClick={handleHugFetch} disabled={hprLoading}>
                    {hprLoading ? '取得中...' : '個人記録を取得'}
                  </button>
                </div>
                <div className="hug-pr-status">{hugStatus}</div>
                <label className="hug-record-staff-label">
                  記録者
                  <select value={hprRecordStaff} onChange={(event) => setHprRecordStaff(event.target.value)} disabled={!hprCachedRecord?.recordStaff?.options?.length}>
                    {hprCachedRecord?.recordStaff?.options?.length ? (
                      hprCachedRecord.recordStaff.options.map((option) => (
                        <option key={option.value} value={option.value}>{option.text}</option>
                      ))
                    ) : (
                      <option value="">取得後に表示されます</option>
                    )}
                  </select>
                </label>
                <textarea
                  id="hug-form-note"
                  rows="12"
                  spellCheck="false"
                  value={hprNote}
                  onChange={(event) => setHprNote(event.target.value)}
                  placeholder="取得後に表示されます。"
                />
                <div className="hug-pr-save-actions">
                  <button type="button" onClick={() => handleHugSave('1')} disabled={!hprCachedRecord?.editHtml || hprLoading}>
                    下書きで更新
                  </button>
                  <button type="button" onClick={() => handleHugSave('2')} disabled={!hprCachedRecord?.editHtml || hprLoading}>
                    公開で更新
                  </button>
                </div>
                {hprResults.length > 0 && (
                  <div className="hug-pr-result-meta">
                    {hprResults.map((row) => (
                      <div key={`${row.date}-${row.editPath}`}>{row.date} / {row.childName} / {row.attendance}</div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </section>
        </div>
      </div>

      <div id="correction-modal" className={`modal-backdrop ${correctionModalOpen ? 'open' : ''}`}>
        <div className="card modal-content">
          <div className="flex justify-between items-center mb-4">
            <h2 style={{ margin: 0 }}>校正結果の確認</h2>
            <button id="modal-close" type="button" className="btn btn-secondary" style={{ padding: '0.25rem' }} onClick={() => setCorrectionModalOpen(false)}>
              <X size={16} />
            </button>
          </div>
          <div className="modal-body">
            <div className="prompt-box">
              <button type="button" className="collapse-btn">
                <label className="label">校正前の文章</label>
                <ChevronDown size={16} />
              </button>
              <p style={{ margin: 0, fontSize: '0.875rem', whiteSpace: 'pre-wrap' }}>{correctionOriginal}</p>
            </div>
            <div>
              <button type="button" className="collapse-btn">
                <label className="label">校正後の文章（編集可）</label>
                <ChevronDown size={16} />
              </button>
              <textarea
                id="correction-corrected"
                className="input-field corrected-textarea"
                rows="8"
                value={correctionText}
                onChange={(event) => setCorrectionText(event.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => setCorrectionModalOpen(false)}>
              キャンセル
            </button>
            <button type="button" className="btn btn-secondary" onClick={handleCorrect} disabled={correctionLoading}>
              <RefreshCw size={16} /> 再校正
            </button>
            <button
              id="modal-apply"
              type="button"
              className="btn btn-primary"
              onClick={() => {
                setCorrectionOriginal(correctionText)
                setCorrectionModalOpen(false)
              }}
            >
              <Check size={16} /> 反映して閉じる
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
