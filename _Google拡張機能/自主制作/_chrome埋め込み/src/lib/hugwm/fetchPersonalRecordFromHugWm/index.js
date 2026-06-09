import { getFormattedDate } from '@/utils/recordUtils'
import {
  CONTACT_BOOK_TABLE_SELECTOR,
  HUG_WM_BASE_URL,
  HUG_WM_CONTACT_BOOK_LIST_URL,
} from '../shared/constants'
import { hugWmFetch, hugWmFetchText } from '../shared/fetch'

const buildContactBookListUrl = ({ facilityId, date, dateEnd, childId, page }) => {
  const url = new URL(HUG_WM_CONTACT_BOOK_LIST_URL)
  url.searchParams.set('f_id', String(facilityId))
  url.searchParams.set('date', date)
  url.searchParams.set('date_end', dateEnd)
  url.searchParams.set('id', String(childId))
  if (page != null) url.searchParams.set('page', String(page))
  return url.href
}

const normalizeListDate = (text) => {
  const match = String(text || '').trim().replace(/\s+/g, '').match(/(\d{4})[/-](\d{1,2})[/-](\d{1,2})/)
  if (!match) return ''
  return `${match[1]}-${String(match[2]).padStart(2, '0')}-${String(match[3]).padStart(2, '0')}`
}

const extractEditPathFromOnclick = (onclick) =>
  String(onclick || '').match(/location\.href\s*=\s*['"]([^'"]+)['"]/)?.[1] || ''

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
  const html = await hugWmFetchText(buildContactBookListUrl({ facilityId, date, dateEnd: dateEnd || date, childId }))
  return parsePersonalRecordRows(html)
}

const fetchContactBookEditData = async (pathOrUrl) => {
  const editPath = pathOrUrl
  const editHtml = await hugWmFetchText(new URL(pathOrUrl, HUG_WM_BASE_URL).href)
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

export async function fetchPersonalRecordWithNote({ facilityId, date, dateEnd, childId }) {
  const rows = await fetchPersonalRecordList({ facilityId, date, dateEnd, childId })
  const target = normalizeListDate(dateEnd || date)
  const row =
    rows.find((item) => item.dateNorm === target && item.attendance === '出席') ||
    rows.find((item) => item.dateNorm === target) ||
    rows[0]
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
    const dateEnd =
      offset === 0 && getFormattedDate(end) >= today
        ? getFormattedDate(new Date(Date.now() - 86400000))
        : getFormattedDate(end)
    if (dateEnd >= dateStart) windows.push({ monthOffset: offset, dateStart, dateEnd })
  }
  return windows
}

export async function fetchPersonalRecordUntilFound({ facilityId, childId, onProgress }) {
  for (const window of buildMonthWindows()) {
    onProgress?.(`${window.dateStart}～${window.dateEnd} を検索中...`)
    const rows = await fetchPersonalRecordList({
      facilityId,
      date: window.dateStart,
      dateEnd: window.dateEnd,
      childId,
    })
    const row =
      rows
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

export async function postContactBookUpdateFromEditHtml(editHtml, { note, recordStaff, state = '1' }) {
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
  const text = await hugWmFetch(postUrl, { method: 'POST', body: formData, credentials: 'include' })
  return { ok: true, status: 200, text, postUrl }
}
