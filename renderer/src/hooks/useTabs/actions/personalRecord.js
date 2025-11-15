// renderer/src/hooks/useTabs/actions/personalRecord.js

import { getDateString } from '@/utils/dateUtils.js'
import { createWebview, createTabButton, activateTab, closeTab } from '../common/index.js'

/**
 * 個人記録タブ追加処理
 * useTabs.js 側から appState を渡して呼び出す
 */
export function addPersonalRecordTabAction(appState) {
  if (!appState.SELECT_CHILD) {
    alert('子どもを選択してください')
    return
  }

  const tabsContainer = document.getElementById('tabs')
  const webviewContainer = document.getElementById('webview-container')
  
  if (!tabsContainer || !webviewContainer) {
    console.error('❌ tabsまたはwebview-container要素が見つかりません')
    return
  }

  const newId = `hugview-${appState.DATE_STR}-${document.querySelectorAll('webview').length}`
  const newWebview = createWebview(
    newId,
    `https://www.hug-ayumu.link/hug/wm/contact_book.php?id=${appState.SELECT_CHILD}`
  )
  
  webviewContainer.appendChild(newWebview)

  const tabButton = createTabButton(
    newId,
    `個人記録 : ${appState.SELECT_CHILD_NAME}`,
    appState.closeButtonsVisible
  )

  if (!tabButton) return

  tabsContainer.appendChild(tabButton)

  // --- クリック処理 ---
  tabButton.addEventListener('click', () => {
    activateTab(newId)
  })

  // --- 閉じる処理 ---
  const closeBtn = tabButton.querySelector('.close-btn')
  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation()
      if (!confirm('このタブを閉じますか？')) return
      closeTab(newId)
    })
  }

  // ---------------------------
  // Webview 内の初期化処理
  // ---------------------------

  let hasSearched = false
  let hasClickedEdit = false

  // did-finish-load（初回のみ）
  newWebview.addEventListener('did-finish-load', async () => {
    if (hasSearched) return
    hasSearched = true

    newWebview.executeJavaScript(`
      try {
        const dp1 = document.querySelector('input[name="date"]');
        const dp2 = document.querySelector('input[name="date_end"]');
        if (dp1 && dp2) {
          dp1.value = "${appState.DATE_STR}";
          dp2.value = "${appState.DATE_STR}";
          dp1.dispatchEvent(new Event("change", { bubbles: true }));
          dp2.dispatchEvent(new Event("change", { bubbles: true }));
        }
        const searchBtn = document.querySelector('button.btn.btn-sm.search');
        if (searchBtn) {
          setTimeout(() => searchBtn.click(), 800);
        }
      } catch (e) {
        console.error("❌ 個人記録の初期化エラー:", e);
      }
    `)
  }, { once: true })


  // did-stop-loading（編集ボタン探索）
  newWebview.addEventListener('did-stop-loading', async () => {
    if (hasClickedEdit) return

    const url = await newWebview.getURL()
    if (!url.includes('contact_book.php')) return

    newWebview.executeJavaScript(`
      try {
        const btns = document.querySelectorAll('button.btn.btn-sm.m0.edit');
        const target = [...btns].find(b => (b.getAttribute('onclick') || '').includes('cal_date=${appState.DATE_STR}'));
        if (target) target.click();
      } catch (e) {
        console.error("❌ 編集ボタン探索エラー:", e);
      }
    `)

    hasClickedEdit = true
  })

  // 編集ページで record_staff を自動入力
  newWebview.addEventListener('did-stop-loading', async () => {
    const url = await newWebview.getURL()

    if (url.includes('contact_book.php?mode=edit') || url.includes('record_proceedings.php?mode=edit')) {

      newWebview.executeJavaScript(`
        const staffSelect = document.querySelector('select[name="record_staff"]');
        if (staffSelect) {
          staffSelect.value = "${appState.STAFF_ID}";
          staffSelect.dispatchEvent(new Event("change", { bubbles: true }));
        }
      `)
    }
  })

  // アクティブ化
  activateTab(newId)
}

