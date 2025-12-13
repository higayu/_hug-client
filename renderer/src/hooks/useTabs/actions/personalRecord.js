// renderer/src/hooks/useTabs/actions/personalRecord.js

import { getDateString } from '@/utils/dateUtils.js'
import { createWebview, createTabButton, activateTab, closeTab } from '../common/index.js'

export function addPersonalRecordTabAction2(appState) {
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
  
  
    let NewPersonalFlg = false;

    // -----------------------------------------------
    // 編集ボタン探索処理（すでに正しいため変更なし）
    // -----------------------------------------------
    newWebview.addEventListener('did-stop-loading', async () => {
      if (hasClickedEdit) return;
    
      const url = await newWebview.getURL();
      if (!url.includes('contact_book.php')) return;
    
      newWebview.executeJavaScript(`
        (function() {
          try {
            console.log("🔍 編集ボタン探索開始");
      
            const table = document.querySelector("table.table.lh1_5");
            if (!table) {
              return { clicked: false, newFlg: false };
            }
      
            const rows = table.querySelectorAll("tbody tr");
            if (!rows.length) {
              return { clicked: false, newFlg: false };
            }
      
            let result = { clicked: false, newFlg: false };
      
            rows.forEach(row => {
              if (result.clicked) return;
      
              const cells = row.querySelectorAll("td");
              if (cells.length < 8) return;
      
              const statusCell = cells[5];
              const span = statusCell.querySelector("span.label");
              const statusText = span ? span.innerText.trim() : "";
      
              if (statusText.includes("未作成")) {
                result.newFlg = true;
              }
      
              const editBtn = cells[7].querySelector("button.btn.btn-sm.m0.edit");
              if (editBtn) {
                editBtn.click();
                result.clicked = true;
              }
            });
      
            return result;
      
          } catch (e) {
            console.error("❌ 編集ボタン探索エラー:", e);
            return { clicked: false, newFlg: false };
          }
        })();
      `).then(result => {
        if (result) {
          NewPersonalFlg = result.newFlg;
          console.log("📌 NewPersonalFlg =", NewPersonalFlg);
        }
      });
      
    
      hasClickedEdit = true;
    });
    
    
    // --------------------------------------------------------
    // 編集ページでの record_staff 自動入力（★フラグで制御）
    // --------------------------------------------------------
    newWebview.addEventListener('did-stop-loading', async () => {
      const url = await newWebview.getURL();
    
      // 編集ページでないなら実行しない
      if (!(
        url.includes('contact_book.php?mode=edit') ||
        url.includes('record_proceedings.php?mode=edit')
      )) return;
    
      // ★ フラグ false の場合はスキップ
      if (!NewPersonalFlg) {
        console.log("⏩ NewPersonalFlg=false のため record_staff 設定はスキップ");
        return;
      }
    
      console.log("📝 NewPersonalFlg=true → record_staff 自動入力を実行");
    
      newWebview.executeJavaScript(`
        const staffSelect = document.querySelector('select[name="record_staff"]');
        if (staffSelect) {
          staffSelect.value = "${appState.STAFF_ID}";
          staffSelect.dispatchEvent(new Event("change", { bubbles: true }));
          console.log("✅ record_staff 自動設定:", staffSelect.value);
        } else {
          console.warn("⚠️ record_staff が見つかりません");
        }
      `);
    });
    
  
    // アクティブ化
    activateTab(newId)
  }


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
            dp1.value = "${appState.DATE_STR}"
            dp2.value = "${appState.DATE_STR}"
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
  