/**
 * 現在登録されているタブ一覧を取得
 * @returns {Array<{
 *   id: string,
 *   title: string,
 *   active: boolean,
 *   webview: HTMLElement | null
 * }>}
 */
export function getRegisteredTabs() {
  const tabsContainer = document.getElementById('tabs')
  if (!tabsContainer) {
    console.warn('⚠️ tabs コンテナが見つかりません')
    return []
  }

  const buttons = tabsContainer.querySelectorAll('button[data-target]')
  const result = []

  buttons.forEach(btn => {
    const targetId = btn.getAttribute('data-target')
    if (!targetId) return

    const webview = document.getElementById(targetId)
    const active = btn.classList.contains('active-tab')

    result.push({
      id: targetId,
      title: btn.textContent?.trim() || '',
      active,
      webview: webview || null,
    })
  })

  return result
}
