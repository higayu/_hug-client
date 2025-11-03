// src/hooks/useTabs.js
// タブ管理のフック

import { useEffect, useCallback, useRef } from 'react'
import { useAppState } from '../contexts/AppStateContext.jsx'
import { setActiveWebview, getActiveWebview } from '../utils/webviewState.js'
import { getDateString } from '../utils/dateUtils.js'

/**
 * タブ管理のフック
 */
export function useTabs() {
  const { appState } = useAppState()
  const tabsInitializedRef = useRef(false)

  // webviewを作成する共通関数
  const createWebview = useCallback((id, src, attributes = {}) => {
    const webview = document.createElement('webview')
    webview.id = id
    webview.src = src
    webview.setAttribute('allowpopups', 'true')
    webview.setAttribute('disablewebsecurity', 'true')
    
    if (window.preloadPath) {
      webview.setAttribute('preload', window.preloadPath)
    }
    
    Object.entries(attributes).forEach(([key, value]) => {
      webview.setAttribute(key, value)
    })
    
    webview.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;'
    webview.classList.add('hidden')
    
    // consoleメッセージを転送
    webview.addEventListener('console-message', (e) => {
      console.log(`🪶 [${webview.id}] ${e.message}`)
    })
    
    return webview
  }, [])

  // タブボタンを作成する共通関数
  const createTabButton = useCallback((targetId, label, closeButtonsVisible) => {
    const tabsContainer = document.getElementById('tabs')
    if (!tabsContainer) return null

    const tabButton = document.createElement('button')
    tabButton.className = 'mr-1 px-2.5 py-1 border-none cursor-pointer bg-[#777] text-black rounded font-bold shadow-sm'
    tabButton.innerHTML = `
      ${label}
      <span class="close-btn"${closeButtonsVisible ? '' : " style='display:none'"}>❌</span>
    `
    tabButton.dataset.target = targetId
    
    return tabButton
  }, [])

  // タブをアクティブにする共通関数
  const activateTab = useCallback((targetId) => {
    const tabsContainer = document.getElementById('tabs')
    const content = document.getElementById('content')
    
    if (!tabsContainer || !content) return

    // すべてのタブからactive-tabクラスを削除
    tabsContainer.querySelectorAll('button').forEach(btn => {
      btn.classList.remove('active-tab')
    })

    // すべてのwebviewを非表示
    document.querySelectorAll('webview').forEach(v => {
      v.classList.add('hidden')
    })

    // 対象のwebviewを表示
    const targetView = document.getElementById(targetId)
    if (targetView) {
      targetView.classList.remove('hidden')
      setActiveWebview(targetView)
      
      // タブボタンにactive-tabクラスを追加
      const tabBtn = tabsContainer.querySelector(`button[data-target="${targetId}"]`)
      if (tabBtn) {
        tabBtn.classList.add('active-tab')
      }
    }
  }, [])

  // タブを閉じる共通関数
  const closeTab = useCallback((targetId) => {
    const tabsContainer = document.getElementById('tabs')
    const content = document.getElementById('content')
    
    if (!tabsContainer || !content) return

    const webview = document.getElementById(targetId)
    const tabButton = tabsContainer.querySelector(`button[data-target="${targetId}"]`)

    if (!webview || !tabButton) return

    // デフォルトのwebviewに戻す
    if (getActiveWebview() === webview) {
      const defaultView = document.getElementById('hugview')
      if (defaultView) {
        defaultView.classList.remove('hidden')
        setActiveWebview(defaultView)
        const defaultTabBtn = tabsContainer.querySelector('button[data-target="hugview"]')
        if (defaultTabBtn) {
          defaultTabBtn.classList.add('active-tab')
        }
      }
    }

    webview.remove()
    tabButton.remove()
  }, [])

  // 通常タブを追加
  const addNormalTab = useCallback(() => {
    const tabsContainer = document.getElementById('tabs')
    const content = document.getElementById('content')
    
    if (!tabsContainer || !content) {
      console.error('❌ tabsまたはcontent要素が見つかりません')
      return
    }

    const newId = `hugview-${Date.now()}-${document.querySelectorAll('webview').length}`
    const newWebview = createWebview(
      newId,
      `https://www.hug-ayumu.link/hug/wm/attendance.php?mode=detail&f_id=${appState.FACILITY_ID}&date=${appState.DATE_STR}`
    )
    
    content.appendChild(newWebview)

    const tabButton = createTabButton(
      newId,
      `Hug-${tabsContainer.querySelectorAll("button[data-target^='hugview']").length + 1}`,
      appState.closeButtonsVisible
    )

    if (!tabButton) return

    const addTabBtn = tabsContainer.querySelector('button:last-child')
    if (addTabBtn) {
      tabsContainer.insertBefore(tabButton, addTabBtn)
    } else {
      tabsContainer.appendChild(tabButton)
    }

    // タブクリック処理
    tabButton.addEventListener('click', () => {
      activateTab(newId)
    })

    // 閉じる処理
    const closeBtn = tabButton.querySelector('.close-btn')
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation()
        if (!confirm('このタブを閉じますか？')) return
        closeTab(newId)
      })
    }

    // すぐにアクティブにする
    activateTab(newId)
  }, [appState.FACILITY_ID, appState.DATE_STR, appState.closeButtonsVisible, createWebview, createTabButton, activateTab, closeTab])

  // 個人記録タブを追加
  const addPersonalRecordTab = useCallback(() => {
    if (!appState.SELECT_CHILD) {
      alert('子どもを選択してください')
      return
    }

    const tabsContainer = document.getElementById('tabs')
    const content = document.getElementById('content')
    
    if (!tabsContainer || !content) {
      console.error('❌ tabsまたはcontent要素が見つかりません')
      return
    }

    const newId = `hugview-${appState.DATE_STR}-${document.querySelectorAll('webview').length}`
    const newWebview = createWebview(
      newId,
      `https://www.hug-ayumu.link/hug/wm/contact_book.php?id=${appState.SELECT_CHILD}`
    )
    
    content.appendChild(newWebview)

    const tabButton = createTabButton(
      newId,
      `個人記録 : ${appState.SELECT_CHILD_NAME}`,
      appState.closeButtonsVisible
    )

    if (!tabButton) return

    tabsContainer.appendChild(tabButton)

    // タブクリック処理
    tabButton.addEventListener('click', () => {
      activateTab(newId)
    })

    // 閉じる処理
    const closeBtn = tabButton.querySelector('.close-btn')
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation()
        if (!confirm('このタブを閉じますか？')) return
        closeTab(newId)
      })
    }

    // contact_book ページの初回ロード時の処理
    let hasSearched = false
    let hasClickedEdit = false

    if (appState.DATE_STR === getDateString()) {
      console.log('当日のため省略', appState.DATE_STR + '　＝＝　' + getDateString())
    } else {
      console.log('当日ではない', appState.DATE_STR + '　＝＝　' + getDateString())
    }

    // did-finish-loadイベント（初回ロード時のみ）
    newWebview.addEventListener('did-finish-load', async () => {
      if (hasSearched) return
      hasSearched = true

      console.log('✅ contact_book ページロード完了 — 日付設定＆検索処理を開始')

      newWebview.executeJavaScript(`
        try {
          console.log("🗓️ 日付設定を実行");
          const dp1 = document.querySelector('input[name="date"]');
          const dp2 = document.querySelector('input[name="date_end"]');
          if (dp1 && dp2) {
            dp1.value = "${appState.DATE_STR}";
            dp2.value = "${appState.DATE_STR}";
            dp1.dispatchEvent(new Event("change", { bubbles: true }));
            dp2.dispatchEvent(new Event("change", { bubbles: true }));
            console.log("📅 日付を設定:", dp1.value, dp2.value);
          } else {
            console.warn("⚠️ 日付入力欄が見つかりません");
          }

          const searchBtn = document.querySelector('button.btn.btn-sm.search');
          if (searchBtn) {
            setTimeout(() => {
              console.log("🔍 検索ボタンをクリックします");
              searchBtn.click();
            }, 800);
          } else {
            console.warn("⚠️ 検索ボタンが見つかりません");
          }
        } catch (e) {
          console.error("❌ 自動日付・検索処理エラー:", e);
        }
      `)
    }, { once: true })

    // did-stop-loadingイベント（編集ボタン探索）
    newWebview.addEventListener('did-stop-loading', async () => {
      if (hasClickedEdit) return

      const url = await newWebview.getURL()
      if (!url.includes('contact_book.php')) return

      console.log('✅ 編集ボタン探索開始:', url)

      newWebview.executeJavaScript(`
        try {
          const btns = document.querySelectorAll('button.btn.btn-sm.m0.edit');
          const target = [...btns].find(b => (b.getAttribute('onclick') || '').includes('cal_date=${appState.DATE_STR}'));
          if (target) {
            console.log("✅ 編集ボタン発見 — クリック実行");
            target.click();
          } else {
            console.warn("❌ 編集ボタン未検出");
          }
        } catch (e) {
          console.error("❌ 編集ボタン探索エラー:", e);
        }
      `)

      hasClickedEdit = true
    })

    // did-stop-loadingイベント（編集ページでの記録者設定）
    newWebview.addEventListener('did-stop-loading', async () => {
      const url = await newWebview.getURL()
      console.log('🔁 読み込み完了:', url)

      if (url.includes('contact_book.php?mode=edit') || url.includes('record_proceedings.php?mode=edit')) {
        newWebview.executeJavaScript(`
          console.log("📝 編集ページ内で record_staff を設定中...");
          const staffSelect = document.querySelector('select[name="record_staff"]');
          if (staffSelect) {
            staffSelect.value = "${appState.STAFF_ID}";
            staffSelect.dispatchEvent(new Event("change", { bubbles: true }));
            console.log("✅ record_staff 設定完了:", staffSelect.value);
          } else {
            console.warn("⚠️ record_staff が見つかりません");
          }
        `)
      }
    })

    // すぐにアクティブにする
    activateTab(newId)
  }, [appState.SELECT_CHILD, appState.SELECT_CHILD_NAME, appState.DATE_STR, appState.STAFF_ID, appState.closeButtonsVisible, createWebview, createTabButton, activateTab, closeTab])

  // 専門的支援一覧タブを追加
  const addProfessionalSupportListTab = useCallback(() => {
    const tabsContainer = document.getElementById('tabs')
    const content = document.getElementById('content')
    
    if (!tabsContainer || !content) {
      console.error('❌ tabsまたはcontent要素が見つかりません')
      return
    }

    const newId = `hugview-${appState.DATE_STR}-${document.querySelectorAll('webview').length}`
    const newWebview = createWebview(
      newId,
      `https://www.hug-ayumu.link/hug/wm/record_proceedings.php`
    )
    
    content.appendChild(newWebview)

    const tabButton = createTabButton(
      newId,
      `専門的加算 一覧 : ${appState.SELECT_CHILD_NAME}`,
      appState.closeButtonsVisible
    )

    if (!tabButton) return

    tabsContainer.appendChild(tabButton)

    // タブクリック処理
    tabButton.addEventListener('click', () => {
      activateTab(newId)
    })

    // 閉じる処理
    const closeBtn = tabButton.querySelector('.close-btn')
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation()
        if (!confirm('このタブを閉じますか？')) return
        closeTab(newId)
      })
    }

    // 初回ロード時の処理
    let hasSearched = false

    if (appState.DATE_STR === getDateString()) {
      console.log('当日のため省略', appState.DATE_STR + '　＝＝　' + getDateString())
    } else {
      console.log('当日ではない', appState.DATE_STR + '　＝＝　' + getDateString())
    }

    // did-finish-loadイベント（初回ロード時のみ）
    newWebview.addEventListener('did-finish-load', async () => {
      if (hasSearched) return
      hasSearched = true

      console.log('✅ record_proceedings ページロード完了 — 施設チェックと加算選択を設定中...')

      newWebview.executeJavaScript(`
        try {
          // ====== 施設チェック ======
          const facilityId = "${appState.FACILITY_ID}";
          console.log("🏢 FACILITY_ID =", facilityId);

          const boxes = document.querySelectorAll('#facility_check input[type="checkbox"]');
          if (boxes.length) {
            boxes.forEach(box => {
              const match = box.value === facilityId;
              box.checked = match;
              console.log(\`🔘 \${box.value} : \${match ? "✅ チェック" : "❌ 解除"}\`);
            });
          } else {
            console.warn("⚠️ #facility_check のチェックボックスが見つかりません");
          }

          // ====== 専門的支援実施加算（value=55）選択 ======
          const selectSupport = document.querySelector('select[name="adding_children_id"]');
          if (selectSupport) {
            selectSupport.value = "55";
            selectSupport.dispatchEvent(new Event("change", { bubbles: true }));
            console.log("✅ 専門的支援実施加算（55）を選択");
          } else {
            console.warn("⚠️ adding_children_id セレクトボックスが見つかりません");
          }

          // ====== 検索ボタンクリック ======
          const searchBtn = document.querySelector('button.btn.btn-sm.search[type="submit"]');
          if (searchBtn) {
            console.log("🔍 検索ボタンをクリックします...");
            searchBtn.click();
          } else {
            console.warn("⚠️ 検索ボタンが見つかりません");
          }

          console.log("✅ 施設チェック・加算選択・検索ボタン押下まで完了");
        } catch (e) {
          console.error("❌ record_proceedings 初期化中にエラー:", e);
        }
      `)
    }, { once: true })

    // DevToolsを開く（開発用）
    newWebview.addEventListener('dom-ready', () => {
      newWebview.openDevTools({ mode: 'detach' })
    })

    // すぐにアクティブにする
    activateTab(newId)
  }, [appState.FACILITY_ID, appState.DATE_STR, appState.SELECT_CHILD_NAME, appState.closeButtonsVisible, createWebview, createTabButton, activateTab, closeTab])

  // 専門的支援-新規タブを追加
  const addProfessionalSupportNewTab = useCallback(() => {
    if (!appState.SELECT_CHILD) {
      alert('子どもを選択してください')
      return
    }

    const tabsContainer = document.getElementById('tabs')
    const content = document.getElementById('content')

    if (!tabsContainer || !content) {
      console.error('❌ tabsまたはcontent要素が見つかりません')
      return
    }

    const newId = `hugview-${appState.DATE_STR}-${document.querySelectorAll('webview').length}`
    console.log('newIdの値', newId)
    const newWebview = createWebview(
      newId,
      `https://www.hug-ayumu.link/hug/wm/record_proceedings.php?mode=edit`
    )
    
    console.log('👤  — 選択した日付:', appState.DATE_STR)
    
    content.appendChild(newWebview)

    const tabButton = createTabButton(
      newId,
      `専門的加算 : ${appState.SELECT_CHILD_NAME || appState.SELECT_CHILD}`,
      appState.closeButtonsVisible
    )

    if (!tabButton) return

    tabsContainer.appendChild(tabButton)

    // タブクリック処理
    tabButton.addEventListener('click', () => {
      activateTab(newId)
    })

    // 閉じる処理
    const closeBtn = tabButton.querySelector('.close-btn')
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation()
        if (!confirm('このタブを閉じますか？')) return
        closeTab(newId)
      })
    }

    // 初回ロード時の処理
    let hasSearched = false

    if (appState.DATE_STR === getDateString()) {
      console.log('当日のため省略', appState.DATE_STR + '　＝＝　' + getDateString())
    } else {
      console.log('当日ではない', appState.DATE_STR + '　＝＝　' + getDateString())
    }

    // did-finish-loadイベント（初回ロード時のみ）
    newWebview.addEventListener('did-finish-load', async () => {
      if (hasSearched) return
      hasSearched = true

      console.log('✅ record_proceedings ページロード完了 — 日付設定＆検索処理を開始')

      // DATE_STRを日本語形式に変換する関数
      const convertDateToJapanese = (dateStr) => {
        const parts = dateStr.split('-')
        if (parts.length === 3) {
          const year = parts[0]
          const month = parts[1]
          const day = parts[2]
          return `${year}年${parseInt(month)}月${parseInt(day)}日`
        }
        return dateStr
      }

      const japaneseDate = convertDateToJapanese(appState.DATE_STR)

      newWebview.executeJavaScript(`
        // 専門的支援実施加算
        const selectSupport = document.querySelector('select[name="adding_children_id"]');
        if (selectSupport) {
          selectSupport.value = "55";
          selectSupport.dispatchEvent(new Event("change", { bubbles: true }));
          console.log("✅ 専門的支援実施加算を選択");
        }

        // 子どもリスト
        const selectChild = document.querySelector('select[name="c_id_list[0][id]"]');
        if (selectChild) {
          selectChild.value = "${appState.SELECT_CHILD}";
          selectChild.dispatchEvent(new Event("change", { bubbles: true }));
          console.log("✅ 子どもリストで選択");
        }

        // 記録者（recorder）
        const selectRecorder = document.querySelector('select[name="recorder"]');
        if (selectRecorder) {
          selectRecorder.value = "${appState.STAFF_ID || ''}";
          selectRecorder.dispatchEvent(new Event("change", { bubbles: true }));
          console.log("✅ 記録者を選択:", selectRecorder.value);
        }

        // 面接担当（interview_staff[]）
        const interviewSelect = document.querySelector('select[name="interview_staff[]"]');
        if (interviewSelect) {
          interviewSelect.value = "${appState.STAFF_ID || ''}";
          interviewSelect.dispatchEvent(new Event("change", { bubbles: true }));
          console.log("✅ 面接担当を選択:", interviewSelect.value);
        }

        // カスタマイズ項目のタイトル入力
        const customizeInput = document.querySelector('input[name="customize[title][]"]');
        if (customizeInput) {
          customizeInput.value = "記録";
          customizeInput.dispatchEvent(new Event("input", { bubbles: true }));
          console.log("✅ カスタマイズタイトル入力:", customizeInput.value);
        }

        // 日付設定（interview_date または dp1）
        const dateInput = document.querySelector('input[name="interview_date"]') || document.getElementById('dp1');
        if (dateInput) {
          dateInput.value = "${japaneseDate}";
          // datepickerを更新
          if (dateInput.dispatchEvent) {
            dateInput.dispatchEvent(new Event("change", { bubbles: true }));
            // datepickerのイベントもトリガー
            if (typeof jQuery !== 'undefined' && jQuery(dateInput).datepicker) {
              jQuery(dateInput).datepicker('setDate', dateInput.value);
            }
          }
          console.log("✅ 日付を設定:", dateInput.value);
        } else {
          console.warn("⚠️ 日付入力欄（interview_date または dp1）が見つかりません");
        }
      `)
    }, { once: true })

    // すぐにアクティブにする
    activateTab(newId)
  }, [appState.SELECT_CHILD, appState.SELECT_CHILD_NAME, appState.DATE_STR, appState.STAFF_ID, appState.closeButtonsVisible, createWebview, createTabButton, activateTab, closeTab])

  // タブ切り替えイベントの設定
  useEffect(() => {
    const tabsContainer = document.getElementById('tabs')
    if (!tabsContainer) return

    const handleTabClick = (e) => {
      const tab = e.target.closest('button[data-target]')
      if (!tab) return

      const targetId = tab.dataset.target
      activateTab(targetId)
    }

    tabsContainer.addEventListener('click', handleTabClick)

    return () => {
      tabsContainer.removeEventListener('click', handleTabClick)
    }
  }, [activateTab])

  // 初期化（一度だけ実行）
  useEffect(() => {
    if (tabsInitializedRef.current) return
    tabsInitializedRef.current = true

    // 初期アクティブwebview設定
    const defaultWebview = document.getElementById('hugview')
    if (defaultWebview) {
      setActiveWebview(defaultWebview)
    }

    // 追加ボタンのイベントリスナー設定
    const tabsContainer = document.getElementById('tabs')
    if (!tabsContainer) return

    // 追加ボタンを探す（まだ存在しない場合は後で作成）
    let addTabBtn = tabsContainer.querySelector('button:last-child')
    if (!addTabBtn || addTabBtn.dataset.target) {
      // 追加ボタンが存在しない場合は作成
      addTabBtn = document.createElement('button')
      addTabBtn.textContent = '＋'
      addTabBtn.className = 'px-2 py-1 text-white cursor-pointer rounded transition-colors duration-200 hover:bg-[#777] hover:text-white border-none bg-transparent text-black font-bold'
      tabsContainer.appendChild(addTabBtn)
    }

    // 通常タブ追加イベント
    addTabBtn.addEventListener('click', addNormalTab)

    // 通常タブの右クリックイベント
    addTabBtn.addEventListener('contextmenu', (e) => {
      e.preventDefault()
      window.electronAPI.Open_NowDayPage({
        facilityId: appState.FACILITY_ID,
        dateStr: appState.DATE_STR,
      })
    })

    // 個人記録ボタンのイベントリスナー設定
    const kojinButton = document.getElementById('kojin-kiroku')
    if (kojinButton) {
      kojinButton.addEventListener('click', addPersonalRecordTab)
    }

    // 専門的支援ボタンのイベントリスナー設定
    const professionalSupportBtn = document.getElementById('professional-support')
    if (professionalSupportBtn) {
      professionalSupportBtn.addEventListener('click', addProfessionalSupportListTab)
    }

    // 専門的支援-新規ボタンは既にToolbarで処理されているので、ここでは設定不要

    console.log('✅ タブ機能 初期化完了')

    return () => {
      // クリーンアップ（必要に応じて）
      if (addTabBtn) {
        addTabBtn.removeEventListener('click', addNormalTab)
        addTabBtn.removeEventListener('contextmenu', () => {})
      }
      if (kojinButton) {
        kojinButton.removeEventListener('click', addPersonalRecordTab)
      }
      if (professionalSupportBtn) {
        professionalSupportBtn.removeEventListener('click', addProfessionalSupportListTab)
      }
    }
  }, [addNormalTab, addPersonalRecordTab, addProfessionalSupportListTab, appState.FACILITY_ID, appState.DATE_STR])

  return {
    addNormalTab,
    addPersonalRecordTab,
    addProfessionalSupportListTab,
    addProfessionalSupportNewTab,
    activateTab,
    closeTab
  }
}

