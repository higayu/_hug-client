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
const PAGINATION_UL_SELECTOR = 'body > div.contents > div.ibox > div:nth-child(7) > div > ul'
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

const getContactBookPageNumbers = (doc) => {
  const targetUl = doc.querySelector(PAGINATION_UL_SELECTOR)
  if (!targetUl) return [1]
  const pages = new Set()
  targetUl.querySelectorAll('a[href]').forEach((anchor) => {
    const match = anchor.getAttribute('href')?.match(/[?&]page=(\d+)/)
    if (match) pages.add(Number(match[1]))
  })
  const sorted = [...pages].sort((a, b) => a - b)
  return sorted.length ? sorted : [1]
}

const fetchContactBookNote = async (pathAndQuery) => {
  const html = await fetchHugText(new URL(pathAndQuery, HUG_WM_BASE_URL).href)
  const editDoc = new DOMParser().parseFromString(html, 'text/html')
  const textarea = editDoc.querySelector('textarea[name="note"][data-field-key="note"]')
  return textarea?.value.trim() ?? ''
}

const getAttendanceEditRows = (table) =>
  [...table.querySelectorAll('tbody tr')]
    .map((row) => {
      const cells = row.querySelectorAll('td')
      const date = cells[0]?.textContent.trim()
      const childName = cells[1]?.textContent.trim().replace(/\s+/g, ' ')
      const attendance = cells[4]?.textContent.trim()
      const onclick = cells[7]?.querySelector('button.edit')?.getAttribute('onclick')
      if (attendance !== '出席' || !onclick) return null
      return { date, childName, attendance, onclick }
    })
    .filter(Boolean)

const getHugPersonalRecords = async ({ facilityId, date, dateEnd, childId, onProgress }) => {
  const firstUrl = buildContactBookListUrl({ facilityId, date, dateEnd, childId })
  onProgress?.('一覧ページを取得しています...')
  const firstHtml = await fetchHugText(firstUrl)
  const firstDoc = new DOMParser().parseFromString(firstHtml, 'text/html')
  const pages = getContactBookPageNumbers(firstDoc)
  const records = []

  for (let i = 0; i < pages.length; i += 1) {
    const page = pages[i]
    onProgress?.(`ページ ${page}/${pages.length} を処理しています...`)
    const doc =
      i === 0
        ? firstDoc
        : new DOMParser().parseFromString(
            await fetchHugText(buildContactBookListUrl({ facilityId, date, dateEnd, childId, page })),
            'text/html',
          )
    const table = doc.querySelector(CONTACT_BOOK_TABLE_SELECTOR)
    if (!table) {
      throw new Error('HUGの連絡帳一覧テーブルが見つかりません。HUG WMにログイン済みか確認してください。')
    }
    const editRows = getAttendanceEditRows(table)
    for (const row of editRows) {
      const editPath = row.onclick.match(/location\.href='([^']+)'/)?.[1]
      records.push({
        date: row.date,
        childName: row.childName,
        attendance: row.attendance,
        note: editPath ? await fetchContactBookNote(editPath) : '',
      })
    }
  }

  return records
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
  const [attendanceDate, setAttendanceDate] = useState(getFormattedDate(new Date()))
  const [attendanceRows, setAttendanceRows] = useState([])
  const [attendanceLoading, setAttendanceLoading] = useState(false)
  const [attendanceStatus, setAttendanceStatus] = useState('HUG WM にログインしたうえで「一覧を取得」を押してください。')
  const [sidePanelTab, setSidePanelTab] = useState('attendance')
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
      const rows = await fetchAttendanceRows({
        date: attendanceDate,
        facilityMap: attendanceFacilityMap,
      })
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
    setHugStatus('HUG WM から取得しています...')
    try {
      const records = await getHugPersonalRecords({
        facilityId: Number(selectedFacilityId),
        date: hprStartDate,
        dateEnd: hprEndDate,
        childId: Number(selectedChildId),
        onProgress: setHugStatus,
      })
      setHprResults(records)
      setHugStatus(records.length ? `${records.length}件取得しました。` : '出席日の活動内容は見つかりませんでした。')
    } catch (error) {
      setHugStatus(`取得に失敗しました: ${error.message}`)
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
                  <div className="hug-attendance-count">入退室一覧 {attendanceRows.length}件</div>
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
                </div>
                <div>{attendanceStatus}</div>
              </div>

              <div className="hug-attendance-body">
                {attendanceRows.length === 0 ? (
                  <div className="hug-empty-message">HUG WM にログインしたうえで「更新」を押してください。</div>
                ) : (
                  <table className="hug-attendance-table">
                    <thead>
                      <tr>
                        <th>児童</th>
                        <th>入室</th>
                        <th>退室</th>
                        <th>状態</th>
                        <th>操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendanceRows.map((row) => (
                        <tr key={`${row.c_id}-${row.r_id}-${row.rowIndex}`}>
                          <td>
                            <strong>{row.name || `ID ${row.c_id}`}</strong>
                            <span className="hug-row-sub">c_id: {row.c_id || '-'}</span>
                          </td>
                          <td>{row.enterTime || '-'}</td>
                          <td>{row.leaveTime || '-'}</td>
                          <td>{row.isAbsenceStatus ? row.absenceLabel : row.enterOnclick ? '入室可' : row.enterTime ? '入室済み' : '-'}</td>
                          <td>
                            <button
                              type="button"
                              className="hug-row-action"
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
                <button type="button" className="hug-pr-fetch-btn" onClick={handleHugFetch} disabled={hprLoading}>
                  {hprLoading ? '取得中...' : '個人記録を取得'}
                </button>
                <div className="hug-pr-status">{hugStatus}</div>
                <textarea
                  id="hug-form-note"
                  rows="12"
                  spellCheck="false"
                  value={hprResults.map((row) => [row.date, row.childName, row.note].filter(Boolean).join(' / ')).join('\n\n')}
                  readOnly
                  placeholder="取得後に表示されます。"
                />
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
