export const HUG_AUTH_CREDENTIALS_KEY = 'hugAuthCredentials'

const readStorage = () =>
  new Promise((resolve) => {
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      chrome.storage.local.get(HUG_AUTH_CREDENTIALS_KEY, (result) => {
        resolve(result?.[HUG_AUTH_CREDENTIALS_KEY] ?? null)
      })
      return
    }

    if (typeof localStorage === 'undefined') {
      resolve(null)
      return
    }

    try {
      const raw = localStorage.getItem(HUG_AUTH_CREDENTIALS_KEY)
      resolve(raw ? JSON.parse(raw) : null)
    } catch {
      resolve(null)
    }
  })

const writeStorage = (value) =>
  new Promise((resolve) => {
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      chrome.storage.local.set({ [HUG_AUTH_CREDENTIALS_KEY]: value }, () => resolve())
      return
    }

    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(HUG_AUTH_CREDENTIALS_KEY, JSON.stringify(value))
      } catch {
        /* ignore */
      }
    }
    resolve()
  })

/** 自動ログイン用 ID / パスワード（Redux とは分離して chrome.storage.local に保存） */
export async function loadHugAuthCredentials() {
  const stored = await readStorage()
  if (!stored || typeof stored !== 'object') {
    return { loginId: '', password: '', autoLoginEnabled: false, keepSession: false }
  }

  return {
    loginId: String(stored.loginId ?? ''),
    password: String(stored.password ?? ''),
    autoLoginEnabled: Boolean(stored.autoLoginEnabled),
    keepSession: Boolean(stored.keepSession),
  }
}

export async function saveHugAuthCredentials(credentials) {
  await writeStorage({
    loginId: String(credentials.loginId ?? ''),
    password: String(credentials.password ?? ''),
    autoLoginEnabled: Boolean(credentials.autoLoginEnabled),
    keepSession: Boolean(credentials.keepSession),
  })
}

export async function clearHugAuthCredentials() {
  if (typeof chrome !== 'undefined' && chrome.storage?.local) {
    await new Promise((resolve) => {
      chrome.storage.local.remove(HUG_AUTH_CREDENTIALS_KEY, () => resolve())
    })
    return
  }

  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(HUG_AUTH_CREDENTIALS_KEY)
  }
}
