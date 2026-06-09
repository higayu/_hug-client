import { formatFetchError } from '@/lib/apiClient'

/** HUG WM へのリクエスト（Chrome 拡張の background 経由 or 直接 fetch） */
export async function hugWmFetch(url, options = {}) {
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

export async function hugWmFetchText(url) {
  return hugWmFetch(url, { method: 'GET', credentials: 'include' })
}
