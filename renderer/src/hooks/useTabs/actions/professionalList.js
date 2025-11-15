// renderer/src/hooks/useTabs/actions/professionalList.js

import { createWebview, createTabButton, activateTab, closeTab } from '../common/index.js'
import { getDateString } from '@/utils/dateUtils.js'

export function addProfessionalSupportListAction(appState) {
  const tabsContainer = document.getElementById('tabs')
  const webviewContainer = document.getElementById('webview-container')

  if (!tabsContainer || !webviewContainer) {
    console.error('❌ tabs または webview-container が見つかりません')
    return
  }

  const newId = `hugview-${appState.DATE_STR}-${document.querySelectorAll('webview').length}`

  const newWebview = createWebview(newId, `https://www.hug-ayumu.link/hug/wm/record_proceedings.php`)
  webviewContainer.appendChild(newWebview)

  const tabButton = createTabButton(
    newId,
    `専門的加算 一覧 : ${appState.SELECT_CHILD_NAME}`,
    appState.closeButtonsVisible
  )

  if (!tabButton) return

  tabsContainer.appendChild(tabButton)

  tabButton.addEventListener('click', () => activateTab(newId))

  const closeBtn = tabButton.querySelector('.close-btn')
  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation()
      if (!confirm('このタブを閉じますか？')) return
      closeTab(newId)
    })
  }

  let hasSearched = false

  newWebview.addEventListener('did-finish-load', () => {
    if (hasSearched) return
    hasSearched = true

    newWebview.executeJavaScript(`
      try {
        const facilityId = "${appState.FACILITY_ID}";

        // 施設チェック
        const boxes = document.querySelectorAll('#facility_check input[type="checkbox"]');
        boxes.forEach(box => box.checked = box.value === facilityId);

        // 専門的支援加算 55 を選択
        const selectSupport = document.querySelector('select[name="adding_children_id"]');
        if (selectSupport) {
          selectSupport.value = "55";
          selectSupport.dispatchEvent(new Event("change", { bubbles: true }));
        }

        // 検索ボタン
        const searchBtn = document.querySelector('button.btn.btn-sm.search[type="submit"]');
        if (searchBtn) searchBtn.click();

      } catch (e) {
        console.error("❌ 専門的支援一覧 初期化エラー:", e);
      }
    `)
  }, { once: true })

  // DevTools（開発中のみ）
  newWebview.addEventListener('dom-ready', () => {
    newWebview.openDevTools({ mode: 'detach' })
  })

  activateTab(newId)
}
