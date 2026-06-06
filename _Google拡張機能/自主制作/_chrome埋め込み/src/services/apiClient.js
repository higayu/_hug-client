export const formatFetchError = (response) => {
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

export const fetchJson = async (url, options = {}) => {
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
