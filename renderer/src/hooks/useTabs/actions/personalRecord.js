// renderer/src/hooks/useTabs/actions/personalRecord.js

import { getDateString } from '@/utils/date/dateUtils.js'
import { confirmDialog } from '@/utils/dialog/confirmDialog.js'
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
    closeBtn.addEventListener('click', async (e) => {
      e.stopPropagation()
      if (!(await confirmDialog('このタブを閉じますか？'))) return
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
  

// ============================================
// addPersonalRecordTabAction4（修正版 - 改行対応 + 初期値設定 + サイズ調整）
// ============================================
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
    closeBtn.addEventListener('click', async (e) => {
      e.stopPropagation()
      if (!(await confirmDialog('このタブを閉じますか？'))) return
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
  // 編集画面：record_staff 自動入力（修正版）
  // ===============================
  newWebview.addEventListener('did-stop-loading', async () => {
    if (phase !== 'EDIT_CLICKED') return

    const url = await newWebview.getURL()
    if (
      !url.includes('contact_book.php?mode=edit') &&
      !url.includes('record_proceedings.php?mode=edit')
    ) return

    phase = 'EDIT_LOADED'

    // 新規作成時のみ record_staff を自動設定
    if (NewPersonalFlg) {
      console.log("📝 新規作成のため record_staff を自動設定します")
      
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
    } else {
      console.log("⏩ 既存データのため record_staff 設定スキップ")
    }

    // ===============================
    // 🔽 content.jsスタイルのボタンを生成（クリップボードエラー修正版 + サイズ調整 + 初期値設定 + 改行対応）
    // ===============================
    await newWebview.executeJavaScript(`
      (function () {
        try {
          // 既存ボタンがあれば削除（重複防止）
          const existingPasteBtn = document.getElementById("myPasteBtn")
          if (existingPasteBtn) {
            existingPasteBtn.remove()
            console.log("🗑️ 既存の貼り付けボタンを削除しました")
          }
          const existingDraftBtn = document.getElementById("myCustomDraftBtn")
          if (existingDraftBtn) {
            existingDraftBtn.remove()
            console.log("🗑️ 既存の下書き保存ボタンを削除しました")
          }

          // ============================================
          // 共通関数: 要素にスクロール移動
          // ============================================
          function scrollToElement(element) {
            if (!element) {
              console.warn("[スクロール] 要素がありません");
              return false;
            }
            
            try {
              const rect = element.getBoundingClientRect();
              const scrollTop = window.pageYOffset || document.documentElement.scrollTop || 0;
              const targetPosition = rect.top + scrollTop - 150;
              
              window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
              });
              
              setTimeout(() => {
                window.scrollTo(0, targetPosition);
              }, 100);
              
              setTimeout(() => {
                element.scrollIntoView({
                  behavior: 'smooth',
                  block: 'center',
                  inline: 'nearest'
                });
              }, 200);
              
              return true;
            } catch (error) {
              console.error("[スクロール] エラー:", error);
              return false;
            }
          }

          // ============================================
          // 共通関数: 要素をハイライト表示
          // ============================================
          function highlightElement(element) {
            if (!element) return;
            
            const originalBackground = element.style.backgroundColor;
            const originalOutline = element.style.outline;
            const originalTransition = element.style.transition;
            
            element.style.transition = 'all 0.3s ease';
            element.style.backgroundColor = '#ffff99';
            element.style.outline = '3px solid #ff6b6b';
            
            setTimeout(() => {
              element.style.backgroundColor = originalBackground || '';
              element.style.outline = originalOutline || '';
              setTimeout(() => {
                element.style.transition = originalTransition || '';
              }, 300);
            }, 3000);
          }

          // ============================================
          // 改良版: クリップボードからテキストを読み取る関数（webview対応 + 初期値設定 + 改行対応）
          // ============================================
          async function getClipboardText(targetTextarea) {
            // 方法1: 標準のクリップボードAPI
            try {
              if (navigator.clipboard && navigator.clipboard.readText) {
                const text = await navigator.clipboard.readText();
                if (text && text.length > 0) {
                  console.log("✅ クリップボードAPIで読み取り成功");
                  return text;
                }
              }
            } catch (apiError) {
              console.warn("⚠️ クリップボードAPI失敗:", apiError.message);
            }

            // 方法2: execCommand（webviewで動作することが多い）
            try {
              const textarea = document.createElement('textarea');
              textarea.style.position = 'fixed';
              textarea.style.opacity = '0';
              textarea.style.left = '-9999px';
              textarea.style.top = '-9999px';
              document.body.appendChild(textarea);
              
              const activeElement = document.activeElement;
              textarea.focus();
              
              const success = document.execCommand('paste');
              
              if (success) {
                const text = textarea.value;
                document.body.removeChild(textarea);
                if (activeElement) activeElement.focus();
                if (text && text.length > 0) {
                  console.log("✅ execCommandで読み取り成功");
                  return text;
                }
              }
              
              document.body.removeChild(textarea);
              if (activeElement) activeElement.focus();
              console.warn("⚠️ execCommandでの貼り付けに失敗");
            } catch (execError) {
              console.warn("⚠️ execCommandエラー:", execError.message);
            }

            // 方法3: 手動入力ダイアログ（最終手段）- 初期値付き + 改行対応
            console.warn("⚠️ 自動読み取りができないため、手動入力を促します");
            return new Promise((resolve) => {
              // 既存の値を取得（初期値用）
              let existingValue = '';
              if (targetTextarea) {
                existingValue = targetTextarea.value || '';
                console.log("📝 既存の値を初期値として設定:", existingValue.substring(0, 50) + (existingValue.length > 50 ? "..." : ""));
              }

              const overlay = document.createElement('div');
              overlay.style.position = 'fixed';
              overlay.style.top = '0';
              overlay.style.left = '0';
              overlay.style.width = '100%';
              overlay.style.height = '100%';
              overlay.style.backgroundColor = 'rgba(0,0,0,0.5)';
              overlay.style.zIndex = '9999999';
              overlay.style.display = 'flex';
              overlay.style.justifyContent = 'center';
              overlay.style.alignItems = 'center';

              const dialog = document.createElement('div');
              dialog.style.backgroundColor = 'white';
              dialog.style.padding = '30px';
              dialog.style.borderRadius = '10px';
              dialog.style.maxWidth = '600px';
              dialog.style.width = '90%';
              dialog.style.boxShadow = '0 10px 40px rgba(0,0,0,0.3)';

              const existingValueMessage = existingValue 
                ? \`<p style="color: #4CAF50; font-size: 13px; margin: 5px 0 10px 0;">
                    ✅ 現在の値が初期設定されています（編集可能です）
                   </p>\`
                : \`<p style="color: #999; font-size: 13px; margin: 5px 0 10px 0;">
                    💡 現在の値は空です
                   </p>\`;

              dialog.innerHTML = \`
                <h3 style="margin-top: 0; color: #333;">📋 クリップボードの内容を貼り付けてください</h3>
                <p style="color: #666; font-size: 14px;">自動読み取りに失敗しました。手動で貼り付けてください。</p>
                \${existingValueMessage}
                <textarea id="manualPasteTextarea" style="
                  width: 100%;
                  height: 200px;
                  padding: 10px;
                  border: 2px solid \${existingValue ? '#4CAF50' : '#ccc'};
                  border-radius: 5px;
                  font-size: 14px;
                  font-family: inherit;
                  box-sizing: border-box;
                  resize: vertical;
                " placeholder="ここにテキストを貼り付けてください (Ctrl+V / ⌘V)">\${existingValue}</textarea>
                <div style="margin-top: 15px; display: flex; gap: 10px; justify-content: flex-end;">
                  <button id="manualPasteCancel" style="
                    padding: 10px 20px;
                    border: 1px solid #ccc;
                    border-radius: 5px;
                    background: white;
                    cursor: pointer;
                    font-size: 14px;
                  ">キャンセル</button>
                  <button id="manualPasteClear" style="
                    padding: 10px 20px;
                    border: 1px solid #f44336;
                    border-radius: 5px;
                    background: white;
                    color: #f44336;
                    cursor: pointer;
                    font-size: 14px;
                  ">🗑️ クリア</button>
                  <button id="manualPasteConfirm" style="
                    padding: 10px 20px;
                    border: none;
                    border-radius: 5px;
                    background: #4CAF50;
                    color: white;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: bold;
                  ">✅ 挿入</button>
                </div>
              \`;

              overlay.appendChild(dialog);
              document.body.appendChild(overlay);

              const textarea = dialog.querySelector('#manualPasteTextarea');
              const confirmBtn = dialog.querySelector('#manualPasteConfirm');
              const cancelBtn = dialog.querySelector('#manualPasteCancel');
              const clearBtn = dialog.querySelector('#manualPasteClear');

              // テキストエリアにフォーカス
              setTimeout(() => {
                textarea.focus();
                // 既存値がある場合は全選択
                if (existingValue) {
                  textarea.select();
                }
              }, 100);

              // クリアボタン
              clearBtn.addEventListener('click', () => {
                textarea.value = '';
                textarea.focus();
                console.log("🗑️ テキストをクリアしました");
              });

              // 確認ボタン
              confirmBtn.addEventListener('click', () => {
                const text = textarea.value;
                document.body.removeChild(overlay);
                resolve(text && text.trim().length > 0 ? text : null);
              });

              // キャンセルボタン
              cancelBtn.addEventListener('click', () => {
                document.body.removeChild(overlay);
                resolve(null);
              });

              // ★ 修正ポイント: Enterキーの処理（改行を許可）
              textarea.addEventListener('keydown', (e) => {
                // Ctrl+Enter または Cmd+Enter の場合のみ確定（改行を防止）
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                  e.preventDefault();
                  confirmBtn.click();
                  return;
                }
                
                // Escape でキャンセル
                if (e.key === 'Escape') {
                  e.preventDefault();
                  cancelBtn.click();
                  return;
                }
                
                // 通常の Enter は何もしない → デフォルトの改行動作が実行される
                // ★ e.preventDefault() を呼ばないことが重要！
              });
            });
          }

          // ============================================
          // 1. 貼り付けボタン（📋）- サイズ調整版 + 初期値設定対応 + 改行対応
          // ============================================
          const pasteBtn = document.createElement("button")
          pasteBtn.id = "myPasteBtn"
          pasteBtn.innerText = "📋 入力"
          
          pasteBtn.style.position = "fixed"
          pasteBtn.style.top = "50%"
          pasteBtn.style.right = "180px"
          pasteBtn.style.transform = "translateY(-50%)"
          pasteBtn.style.zIndex = "999999"
          pasteBtn.style.padding = "10px 18px"
          pasteBtn.style.color = "white"
          pasteBtn.style.fontSize = "14px"
          pasteBtn.style.fontWeight = "bold"
          pasteBtn.style.border = "none"
          pasteBtn.style.borderRadius = "8px"
          pasteBtn.style.cursor = "pointer"
          pasteBtn.style.boxShadow = "0 3px 12px rgba(0,0,0,0.3)"
          pasteBtn.style.transition = "all 0.3s ease"
          pasteBtn.style.letterSpacing = "0.5px"
          pasteBtn.style.backgroundColor = "#4CAF50"
          pasteBtn.style.whiteSpace = "nowrap"

          pasteBtn.addEventListener("mouseenter", () => {
            pasteBtn.style.transform = "translateY(-50%) scale(1.05)"
            pasteBtn.style.boxShadow = "0 6px 20px rgba(0,0,0,0.4)"
          })
          pasteBtn.addEventListener("mouseleave", () => {
            pasteBtn.style.transform = "translateY(-50%) scale(1)"
            pasteBtn.style.boxShadow = "0 3px 12px rgba(0,0,0,0.3)"
          })

          // 貼り付けボタンのクリック処理（初期値対応版）
          pasteBtn.addEventListener("click", async function() {
            console.log("📋 貼り付けボタンがクリックされました")
            
            this.style.backgroundColor = "#FF9800"
            this.innerText = "⏳ 貼り付け中..."
            this.style.transform = "translateY(-50%) scale(0.95)"
            
            try {
              // 貼り付け先のテキストエリアを先に取得
              const textarea = document.querySelector('textarea[name="note"][data-field-key="note"]') ||
                               document.querySelector('textarea[name="note"]')
              
              if (!textarea) {
                console.error("❌ テキストエリアが見つかりません")
                this.style.backgroundColor = "#f44336"
                this.innerText = "❌ エラー"
                setTimeout(() => {
                  this.style.backgroundColor = "#4CAF50"
                  this.innerText = "📋 入力"
                  this.style.transform = "translateY(-50%) scale(1)"
                }, 2000)
                return
              }

              // ★ テキストエリアを引数として渡す（初期値取得のため）
              const clipboardText = await getClipboardText(textarea);
              
              if (!clipboardText || clipboardText.trim().length === 0) {
                console.error("❌ 貼り付け内容が空です")
                this.style.backgroundColor = "#f44336"
                this.innerText = "❌ 空です"
                setTimeout(() => {
                  this.style.backgroundColor = "#4CAF50"
                  this.innerText = "📋 入力"
                  this.style.transform = "translateY(-50%) scale(1)"
                }, 2000)
                return
              }

              scrollToElement(textarea)
              
              textarea.value = clipboardText
              textarea.dispatchEvent(new Event('input', { bubbles: true }))
              textarea.dispatchEvent(new Event('change', { bubbles: true }))
              
              highlightElement(textarea)
              textarea.focus()
              
              console.log("✅ テキストを貼り付けました")
              this.style.backgroundColor = "#4CAF50"
              this.innerText = "✅ 完了！"
              setTimeout(() => {
                this.style.backgroundColor = "#4CAF50"
                this.innerText = "📋 入力"
                this.style.transform = "translateY(-50%) scale(1)"
              }, 2000)

            } catch (error) {
              console.error("❌ 貼り付けエラー:", error)
              this.style.backgroundColor = "#f44336"
              this.innerText = "❌ エラー"
              setTimeout(() => {
                this.style.backgroundColor = "#4CAF50"
                this.innerText = "📋 入力"
                this.style.transform = "translateY(-50%) scale(1)"
              }, 2000)
            }
          })

          document.body.appendChild(pasteBtn)
          console.log("✅ 貼り付けボタン生成完了（サイズ調整版 + 初期値設定対応 + 改行対応）")

          // ============================================
          // 2. 下書き保存ボタン（💾）- サイズ調整版
          // ============================================
          const draftBtn = document.createElement("button")
          draftBtn.id = "myCustomDraftBtn"
          draftBtn.innerText = "💾 下書き保存"
          
          draftBtn.style.position = "fixed"
          draftBtn.style.top = "50%"
          draftBtn.style.right = "20px"
          draftBtn.style.transform = "translateY(-50%)"
          draftBtn.style.zIndex = "999999"
          draftBtn.style.padding = "10px 18px"
          draftBtn.style.color = "white"
          draftBtn.style.fontSize = "14px"
          draftBtn.style.fontWeight = "bold"
          draftBtn.style.border = "none"
          draftBtn.style.borderRadius = "8px"
          draftBtn.style.cursor = "pointer"
          draftBtn.style.boxShadow = "0 3px 12px rgba(0,0,0,0.3)"
          draftBtn.style.transition = "all 0.3s ease"
          draftBtn.style.letterSpacing = "0.5px"
          draftBtn.style.backgroundColor = "#9C27B0"
          draftBtn.style.whiteSpace = "nowrap"

          draftBtn.addEventListener("mouseenter", () => {
            draftBtn.style.transform = "translateY(-50%) scale(1.05)"
            draftBtn.style.boxShadow = "0 6px 20px rgba(0,0,0,0.4)"
          })
          draftBtn.addEventListener("mouseleave", () => {
            draftBtn.style.transform = "translateY(-50%) scale(1)"
            draftBtn.style.boxShadow = "0 3px 12px rgba(0,0,0,0.3)"
          })

          draftBtn.addEventListener("click", function() {
            console.log("💾 下書き保存ボタンがクリックされました")
            
            this.style.backgroundColor = "#FF9800"
            this.innerText = "⏳ 保存中..."
            this.style.transform = "translateY(-50%) scale(0.95)"
            
            try {
              let saveButton = document.querySelector('button[data-save-button][value="1"]')
              
              if (!saveButton) {
                saveButton = document.querySelector('button.btn.btn-sm.draft[data-save-button=""]')
              }
              
              if (!saveButton) {
                const allButtons = document.querySelectorAll('button')
                for (const btn of allButtons) {
                  if (btn.textContent.includes('下書き') || 
                      btn.textContent.includes('draft') ||
                      (btn.hasAttribute('data-save-button') && btn.getAttribute('value') === '1')) {
                    saveButton = btn
                    break
                  }
                }
              }
              
              if (!saveButton) {
                console.error("❌ 下書き保存ボタンが見つかりません")
                this.style.backgroundColor = "#f44336"
                this.innerText = "❌ エラー"
                setTimeout(() => {
                  this.style.backgroundColor = "#9C27B0"
                  this.innerText = "💾 下書き保存"
                  this.style.transform = "translateY(-50%) scale(1)"
                }, 2000)
                return
              }

              console.log("✅ 下書き保存ボタンを発見:", saveButton)
              
              scrollToElement(saveButton)
              highlightElement(saveButton)

              setTimeout(() => {
                try {
                  saveButton.click()
                  console.log("✅ 標準クリック実行")
                } catch (e) {
                  console.warn("⚠️ 標準クリック失敗:", e)
                  try {
                    const clickEvent = new MouseEvent('click', {
                      view: window,
                      bubbles: true,
                      cancelable: true
                    })
                    saveButton.dispatchEvent(clickEvent)
                    console.log("✅ dispatchEventクリック実行")
                  } catch (e2) {
                    console.error("❌ すべてのクリック方法が失敗:", e2)
                  }
                }
                
                this.style.backgroundColor = "#4CAF50"
                this.innerText = "✅ 保存完了！"
                setTimeout(() => {
                  this.style.backgroundColor = "#9C27B0"
                  this.innerText = "💾 下書き保存"
                  this.style.transform = "translateY(-50%) scale(1)"
                }, 2500)
              }, 500)

            } catch (error) {
              console.error("❌ 下書き保存エラー:", error)
              this.style.backgroundColor = "#f44336"
              this.innerText = "❌ エラー"
              setTimeout(() => {
                this.style.backgroundColor = "#9C27B0"
                this.innerText = "💾 下書き保存"
                this.style.transform = "translateY(-50%) scale(1)"
              }, 2000)
            }
          })

          document.body.appendChild(draftBtn)
          console.log("✅ 下書き保存ボタン生成完了（サイズ調整版）")

          console.log("=== ボタン生成完了（サイズ調整版 + 初期値設定対応 + 改行対応） ===")
          console.log("📋 貼り付けボタン: 右から180px")
          console.log("💾 下書き保存ボタン: 右から20px")

        } catch (e) {
          console.error("❌ ボタン生成エラー:", e)
        }
      })();
    `)

  })

  activateTab(newId)
}