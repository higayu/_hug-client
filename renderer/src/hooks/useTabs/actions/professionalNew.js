// renderer/src/hooks/useTabs/actions/professionalNew.js

import { createWebview, createTabButton, activateTab, closeTab } from '../common/index.js'

export function addProfessionalSupportNewAction(appState) {
  if (!appState.SELECT_CHILD) {
    alert('子どもを選択してください')
    return
  }

  const tabsContainer = document.getElementById('tabs')
  const webviewContainer = document.getElementById('webview-container')

  if (!tabsContainer || !webviewContainer) {
    console.error('❌ tabs または webview-container が見つかりません')
    return
  }

  const newId = `hugview-${appState.DATE_STR}-${document.querySelectorAll('webview').length}`

  const newWebview = createWebview(
    newId,
    `https://www.hug-ayumu.link/hug/wm/record_proceedings.php?mode=edit`
  )

  webviewContainer.appendChild(newWebview)

  const tabButton = createTabButton(
    newId,
    `専門的加算 : ${appState.SELECT_CHILD_NAME || appState.SELECT_CHILD}`,
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

  // --- 初回ロード処理 ---
  let initialized = false

  newWebview.addEventListener('did-finish-load', () => {
    if (initialized) return
    initialized = true

    // 日付を日本語へ変換
    const parts = appState.DATE_STR.split('-')
    const jpDate = `${parts[0]}年${parseInt(parts[1])}月${parseInt(parts[2])}日`

    // 開始終了時刻のパース
    const parseTime = (s) => {
      if (!s) return null
      const m = s.match(/^(\d{2}):(\d{2})$/)
      return m ? { h: String(parseInt(m[1])), m: String(parseInt(m[2])) } : null
    }

    const st = parseTime(appState.SELECTED_CHILD_COLUMN5)
    const et = parseTime(appState.SELECTED_CHILD_COLUMN6)

    newWebview.executeJavaScript(`
      try {
        // 専門的支援加算 (55)
        const support = document.querySelector('select[name="adding_children_id"]');
        if (support) {
          support.value = "55";
          support.dispatchEvent(new Event("change", { bubbles: true }));
        }

        // 子ども選択
        const child = document.querySelector('select[name="c_id_list[0][id]"]');
        if (child) {
          child.value = "${appState.SELECT_CHILD}";
          child.dispatchEvent(new Event("change", { bubbles: true }));
        }

        // 記録者
        const recorder = document.querySelector('select[name="recorder"]');
        if (recorder) {
          recorder.value = "${appState.STAFF_ID}";
          recorder.dispatchEvent(new Event("change", { bubbles: true }));
        }

        // 面接担当
        const interview = document.querySelector('select[name="interview_staff[]"]');
        if (interview) {
          interview.value = "${appState.STAFF_ID}";
          interview.dispatchEvent(new Event("change", { bubbles: true }));
        }

        // タイトル
        const title = document.querySelector('input[name="customize[title][]"]');
        if (title) title.value = "記録";

        // 日付
        const dateInput = document.querySelector('input[name="interview_date"]') || document.getElementById('dp1');
        if (dateInput) {
          dateInput.value = "${jpDate}";
          dateInput.dispatchEvent(new Event("change", { bubbles: true }));
        }

        // 時刻（開始）
        ${st ? `
        const sh = document.querySelector('#start_hour');
        if (sh && sh.querySelector('option[value="${st.h}"]')) sh.value = "${st.h}";
        const sm = document.querySelector('#start_time');
        if (sm && sm.querySelector('option[value="${st.m}"]')) sm.value = "${st.m}";
        ` : ''}

        // 時刻（終了）
        ${et ? `
        const eh = document.querySelector('#end_hour');
        if (eh && eh.querySelector('option[value="${et.h}"]')) eh.value = "${et.h}";
        const em = document.querySelector('#end_time');
        if (em && em.querySelector('option[value="${et.m}"]')) em.value = "${et.m}";
        ` : ''}

      } catch (e) {
        console.error("❌ 専門的支援-新規 初期化エラー:", e);
      }
    `)
  }, { once: true })

  activateTab(newId)
}
