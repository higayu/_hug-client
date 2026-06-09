import { getFormattedDate } from '@/store/slices/dateUtils'
import { HUG_WM_CHILD_AGREEMENT_FILTER_URL } from '../shared/constants'
import { hugWmFetch } from '../shared/fetch'

function buildChildAgreementPostParams({ facilityIds, targetDate }) {
  const params = new URLSearchParams()

  for (const id of facilityIds) {
    const idStr = String(id)
    params.set(`f_ary[${idStr}]`, idStr)
  }

  params.set('furigana', '0')
  params.set('parent_flg', 'false')
  params.set('target_date', targetDate)

  return params
}

function parseOptions(doc) {
  return [...doc.querySelectorAll('option')]
    .map((opt) => ({
      child_id: Number(opt.value),
      name: opt.textContent.trim(),
    }))
    .filter((child) => Number.isFinite(child.child_id) && child.child_id > 0)
}

function parseChildrenFromResponse(text) {
  const trimmed = String(text).trim()

  if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
    try {
      const data = JSON.parse(trimmed)
      const childrenList = Array.isArray(data)
        ? data
        : data.children || data.child_list || data.list || []

      return childrenList
        .map((item) => ({
          child_id: Number(item.child_id ?? item.id ?? item.c_id ?? item.value),
          name: String(item.name ?? item.child_name ?? item.text ?? '').trim(),
        }))
        .filter((child) => Number.isFinite(child.child_id) && child.child_id > 0)
    } catch {
      // HTML として続行
    }
  }

  const htmlDoc = new DOMParser().parseFromString(trimmed, 'text/html')
  const fromHtml = parseOptions(htmlDoc)
  if (fromHtml.length > 0) {
    return fromHtml
  }

  const wrappedDoc = new DOMParser().parseFromString(`<select>${trimmed}</select>`, 'text/html')
  return parseOptions(wrappedDoc)
}

/** ajax_child_agreement_filter.php から児童一覧を取得 */
export async function fetchChildrenFromHugWm({
  facilityIds,
  targetDate = getFormattedDate(new Date()),
} = {}) {
  if (!facilityIds?.length) {
    throw new Error('施設 ID を指定してください')
  }

  const body = buildChildAgreementPostParams({ facilityIds, targetDate })

  console.log('[HUG WM] 児童データ取得 fetch開始:', HUG_WM_CHILD_AGREEMENT_FILTER_URL)
  console.log('[HUG WM] POST payload:', Object.fromEntries(body))

  const text = await hugWmFetch(HUG_WM_CHILD_AGREEMENT_FILTER_URL, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'X-Requested-With': 'XMLHttpRequest',
    },
    body: body.toString(),
  })

  const children = parseChildrenFromResponse(text)
  console.log('[HUG WM] 児童データ:', children)
  return children
}
