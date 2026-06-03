// renderer/src/hooks/useTabs/actions/personalRecord.js

import { getDateString } from '@/utils/date/dateUtils.js'
import { createWebview, createTabButton, activateTab, closeTab } from '../common/index.js'


export function addPersonalRecordTabAction3(appState) {
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

  const newId = `hugview-${appState.CURRENT_YMD}-${document.querySelectorAll('webview').length}`
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

  tabButton.addEventListener('click', () => activateTab(newId))

  const closeBtn = tabButton.querySelector('.close-btn')
  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation()
      if (!confirm('このタブを閉じますか？')) return
      closeTab(newId)
    })
  }

  // ===============================
  // 状態管理（重要）
  // ===============================
  let phase = 'INIT'
  let NewPersonalFlg = false

  // ===============================
  // 初期検索処理
  // ===============================
  newWebview.addEventListener('did-finish-load', async () => {
    if (phase !== 'INIT') return
    phase = 'SEARCHING'

    await newWebview.executeJavaScript(`
      (function () {
        try {
          const dp1 = document.querySelector('input[name="date"]')
          const dp2 = document.querySelector('input[name="date_end"]')
          if (dp1 && dp2) {
            dp1.value = "${appState.CURRENT_YMD}"
            dp2.value = "${appState.CURRENT_YMD}"
            dp1.dispatchEvent(new Event("input", { bubbles: true }))
            dp1.dispatchEvent(new Event("change", { bubbles: true }))
            dp2.dispatchEvent(new Event("input", { bubbles: true }))
            dp2.dispatchEvent(new Event("change", { bubbles: true }))
          }

          const btn = document.querySelector('button.btn.btn-sm.search')
          if (btn) {
            setTimeout(() => btn.click(), 500)
          }
        } catch (e) {
          console.error("❌ 初期検索エラー", e)
        }
      })();
    `)

    phase = 'SEARCHED'
  }, { once: true })

  // ===============================
  // 一覧 → 編集ボタンクリック
  // ===============================
  newWebview.addEventListener('did-stop-loading', async () => {
    if (phase !== 'SEARCHED') return

    const url = await newWebview.getURL()
    if (!url.includes('contact_book.php')) return

    const result = await newWebview.executeJavaScript(`
      (function () {
        try {
          const table = document.querySelector("table.table.lh1_5")
          if (!table) return null

          const rows = table.querySelectorAll("tbody tr")
          if (!rows.length) return null

          let newFlg = false

          for (const row of rows) {
            const cells = row.querySelectorAll("td")
            if (cells.length < 8) continue

            const span = cells[5].querySelector("span.label")
            const status = span ? span.innerText.trim() : ""

            if (status.includes("未作成")) {
              newFlg = true
            }

            const editBtn = cells[7].querySelector("button.btn.btn-sm.m0.edit")
            if (editBtn) {
              editBtn.click()
              return { newFlg }
            }
          }

          return null
        } catch (e) {
          console.error("❌ 編集探索エラー", e)
          return null
        }
      })();
    `)

    if (result) {
      NewPersonalFlg = result.newFlg
      console.log("📌 NewPersonalFlg =", NewPersonalFlg)
      phase = 'EDIT_CLICKED'
    }
  })

  // ===============================
  // 編集画面：record_staff 自動入力
  // ===============================
  newWebview.addEventListener('did-stop-loading', async () => {
    if (phase !== 'EDIT_CLICKED') return

    const url = await newWebview.getURL()
    if (
      !url.includes('contact_book.php?mode=edit') &&
      !url.includes('record_proceedings.php?mode=edit')
    ) return

    phase = 'EDIT_LOADED'

    if (!NewPersonalFlg) {
      console.log("⏩ 既存データのため record_staff 設定スキップ")
      return
    }

    await newWebview.executeJavaScript(`
      (function () {
        const select = document.querySelector('select[name="record_staff"]')
        if (select) {
          select.value = "${appState.STAFF_ID}"
          select.dispatchEvent(new Event("change", { bubbles: true }))
          console.log("✅ record_staff 自動設定:", select.value)
        } else {
          console.warn("⚠️ record_staff が見つかりません")
        }
      })();
    `)
  })

  activateTab(newId)
}
  
export function addPersonalRecordTabAction4(appState) {
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

  const newId = `hugview-${appState.CURRENT_YMD}-${document.querySelectorAll('webview').length}`
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

  tabButton.addEventListener('click', () => activateTab(newId))

  const closeBtn = tabButton.querySelector('.close-btn')
  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation()
      if (!confirm('このタブを閉じますか？')) return
      closeTab(newId)
    })
  }

  // ===============================
  // 状態管理（重要）
  // ===============================
  let phase = 'INIT'
  let NewPersonalFlg = false

  // ===============================
  // 初期検索処理
  // ===============================
  newWebview.addEventListener('did-finish-load', async () => {
    if (phase !== 'INIT') return
    phase = 'SEARCHING'

    await newWebview.executeJavaScript(`
      (function () {
        try {
          const dp1 = document.querySelector('input[name="date"]')
          const dp2 = document.querySelector('input[name="date_end"]')
          if (dp1 && dp2) {
            dp1.value = "${appState.CURRENT_YMD}"
            dp2.value = "${appState.CURRENT_YMD}"
            dp1.dispatchEvent(new Event("input", { bubbles: true }))
            dp1.dispatchEvent(new Event("change", { bubbles: true }))
            dp2.dispatchEvent(new Event("input", { bubbles: true }))
            dp2.dispatchEvent(new Event("change", { bubbles: true }))
          }

          const btn = document.querySelector('button.btn.btn-sm.search')
          if (btn) {
            setTimeout(() => btn.click(), 500)
          }
        } catch (e) {
          console.error("❌ 初期検索エラー", e)
        }
      })();
    `)

    phase = 'SEARCHED'
  }, { once: true })

  // ===============================
  // 一覧 → 編集ボタンクリック
  // ===============================
  newWebview.addEventListener('did-stop-loading', async () => {
    if (phase !== 'SEARCHED') return

    const url = await newWebview.getURL()
    if (!url.includes('contact_book.php')) return

    const result = await newWebview.executeJavaScript(`
      (function () {
        try {
          const table = document.querySelector("table.table.lh1_5")
          if (!table) return null

          const rows = table.querySelectorAll("tbody tr")
          if (!rows.length) return null

          let newFlg = false

          for (const row of rows) {
            const cells = row.querySelectorAll("td")
            if (cells.length < 8) continue

            const span = cells[5].querySelector("span.label")
            const status = span ? span.innerText.trim() : ""

            if (status.includes("未作成")) {
              newFlg = true
            }

            const editBtn = cells[7].querySelector("button.btn.btn-sm.m0.edit")
            if (editBtn) {
              editBtn.click()
              return { newFlg }
            }
          }

          return null
        } catch (e) {
          console.error("❌ 編集探索エラー", e)
          return null
        }
      })();
    `)

    if (result) {
      NewPersonalFlg = result.newFlg
      console.log("📌 NewPersonalFlg =", NewPersonalFlg)
      phase = 'EDIT_CLICKED'
    }
  })

  // ===============================
  // 編集画面：record_staff 自動入力
  // ===============================
  newWebview.addEventListener('did-stop-loading', async () => {
    if (phase !== 'EDIT_CLICKED') return

    const url = await newWebview.getURL()
    if (
      !url.includes('contact_book.php?mode=edit') &&
      !url.includes('record_proceedings.php?mode=edit')
    ) return

    phase = 'EDIT_LOADED'

    // record_staff の自動入力だけ条件付き
    if (!NewPersonalFlg) {
      console.log("⏩ 既存データのため record_staff 設定スキップ")
    } else {
      await newWebview.executeJavaScript(`
        (function () {
          const select = document.querySelector('select[name="record_staff"]')
          if (select) {
            select.value = "${appState.STAFF_ID}"
            select.dispatchEvent(new Event("change", { bubbles: true }))
            console.log("✅ record_staff 自動設定:", select.value)
          } else {
            console.warn("⚠️ record_staff が見つかりません")
          }
        })();
      `)
    }

    // ===============================
    // 🔽 下書き保存ボタン生成（常に実行）
    // ===============================
    await newWebview.executeJavaScript(`
      (function () {
        try {
          if (document.getElementById("myAttendanceBtn")) return;

          const btn = document.createElement("button");
          btn.id = "myAttendanceBtn";
          btn.innerText = "下書き保存";

          btn.style.position = "fixed";
          btn.style.top = "50%";
          btn.style.left = "50%";
          btn.style.transform = "translate(-50%, -50%)";
          btn.style.padding = "12px 18px";
          btn.style.background = "#007bff";
          btn.style.color = "#fff";
          btn.style.border = "none";
          btn.style.borderRadius = "6px";
          btn.style.cursor = "pointer";
          btn.style.fontSize = "14px";
          btn.style.zIndex = "99999";

          btn.addEventListener("mouseenter", () => {
            btn.style.background = "#0056b3";
          });
          btn.addEventListener("mouseleave", () => {
            btn.style.background = "#007bff";
          });

          btn.addEventListener("click", () => {
            const draftBtn = document.querySelector(
              'button[data-save-button][value="1"]'
            );
            if (!draftBtn) {
              console.error("❌ 下書き保存ボタンが見つかりません");
              return;
            }
            draftBtn.click();
          });

          document.body.appendChild(btn);
          console.log("✅ 下書き保存ボタン生成完了");
        } catch (e) {
          console.error("❌ 下書き保存ボタン生成エラー", e);
        }
      })();
    `)


  })

  activateTab(newId)
}