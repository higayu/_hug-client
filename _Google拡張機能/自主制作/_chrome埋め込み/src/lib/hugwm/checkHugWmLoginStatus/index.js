import { HUG_WM_BASE_URL } from '../shared/constants'
import { hugWmFetchText } from '../shared/fetch'

/** login.html 等の未ログイン画面を HTML から判定 */
export function parseHugWmLoginStatusFromHtml(html) {
  const doc = new DOMParser().parseFromString(html, 'text/html')

  const headerText = doc.querySelector('.headerMenu span')?.textContent?.trim() || ''
  const isExplicitlyLoggedOut = headerText.includes('ログインしていません')

  const hasLoginForm = Boolean(
    doc.querySelector('#loginForm') ||
      doc.querySelector('input[name="username"]') ||
      doc.querySelector('input[name="mode"][value="login_pass"]') ||
      doc.querySelector('.btn-login.js_token_form'),
  )

  if (isExplicitlyLoggedOut || hasLoginForm) {
    return 'unauthenticated'
  }

  return 'authenticated'
}

/** HUG WM へリクエストし、表示 HTML からログイン状態を判定（正とする判定） */
export async function checkHugWmLoginStatus() {
  const html = await hugWmFetchText(HUG_WM_BASE_URL)
  return parseHugWmLoginStatusFromHtml(html)
}
