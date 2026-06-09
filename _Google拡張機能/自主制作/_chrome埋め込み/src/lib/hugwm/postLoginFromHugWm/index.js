import { HUG_WM_BASE_URL } from '../shared/constants'
import { hugWmFetch, hugWmFetchText } from '../shared/fetch'
import { checkHugWmLoginStatus, parseHugWmLoginStatusFromHtml } from '../checkHugWmLoginStatus'

function readInputValue(doc, selector) {
  return doc.querySelector(selector)?.value?.trim() || ''
}

/** ログインページ HTML からフォーム hidden 値を取得 */
export function parseLoginFormFieldsFromHtml(html) {
  const doc = new DOMParser().parseFromString(html, 'text/html')

  return {
    mode: readInputValue(doc, 'input[name="mode"]') || 'login_pass',
    modeToken:
      readInputValue(doc, '#mode_token') || readInputValue(doc, 'input[name="mode_token"]') || 'nomode',
    csrfToken:
      readInputValue(doc, '#csrf_token_from_client') ||
      readInputValue(doc, 'input[name="csrf_token_from_client"]'),
    hugPageUrl: readInputValue(doc, '#hug_page_url') || readInputValue(doc, 'input[name="hug_page_url"]') || 'index.php',
  }
}

async function validateCsrfToken({ csrfToken, modeToken, hugPageUrl }) {
  const params = new URLSearchParams({
    token: csrfToken,
    mode: modeToken,
    hug_page_url: hugPageUrl,
  })
  const url = `${HUG_WM_BASE_URL}ajax/ajax_token.php?${params.toString()}`
  const result = String(await hugWmFetchText(url)).trim()

  if (result !== '1') {
    throw new Error('CSRFトークンの検証に失敗しました')
  }
}

function buildLoginPostBody({ fields, loginId, password, keepSession }) {
  const body = new URLSearchParams()
  body.set('mode', fields.mode)
  body.set('mode_token', fields.modeToken)
  body.set('csrf_token_from_client', fields.csrfToken)
  body.set('hug_page_url', fields.hugPageUrl)
  body.set('username', loginId)
  body.set('password', password)
  if (keepSession) {
    body.set('setexpire', '1')
  }
  return body
}

/**
 * HUG WM へログイン POST（script.js の js_token_form 相当）
 * 1. ログインページ取得 → CSRF 等を解析
 * 2. ajax_token.php でトークン検証
 * 3. /hug/wm/ へ POST
 */
export async function postLoginFromHugWm({ loginId, password, keepSession = false } = {}) {
  if (!loginId?.trim()) {
    throw new Error('ログインIDを指定してください')
  }
  if (!password) {
    throw new Error('パスワードを指定してください')
  }

  const loginPageHtml = await hugWmFetchText(HUG_WM_BASE_URL)

  if (parseHugWmLoginStatusFromHtml(loginPageHtml) === 'authenticated') {
    return { alreadyLoggedIn: true, status: 'authenticated' }
  }

  const fields = parseLoginFormFieldsFromHtml(loginPageHtml)
  if (!fields.csrfToken) {
    throw new Error('ログインページから CSRF トークンを取得できませんでした')
  }

  await validateCsrfToken(fields)

  const body = buildLoginPostBody({
    fields,
    loginId: loginId.trim(),
    password,
    keepSession,
  })

  console.log('[HUG WM] ログイン POST 開始:', HUG_WM_BASE_URL)

  const postHtml = await hugWmFetch(HUG_WM_BASE_URL, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    },
    body: body.toString(),
  })

  let status = parseHugWmLoginStatusFromHtml(postHtml)
  if (status !== 'authenticated') {
    status = await checkHugWmLoginStatus()
  }

  if (status !== 'authenticated') {
    throw new Error('ログインに失敗しました。IDまたはパスワードを確認してください。')
  }

  console.log('[HUG WM] ログイン成功')
  return { alreadyLoggedIn: false, status }
}
