// src/components/CustomButtonsPanel/index.jsx
// カスタムボタンのパネルコンポーネント

import { useEffect, useState } from 'react'
import { useCustomButtons } from '@/components/common/CustomButtonsContext.jsx'
//import { useAppState } from '@/contexts/AppStateContext.jsx'
import { useAppState } from '@/contexts/appState'
import { getActiveWebview, setActiveWebview } from '@/utils/webview/webviewState.js'
import { useSelector } from "react-redux";

function CustomButtonsPanel() {
  const { customButtons, getCustomButtons } = useCustomButtons()
  const { appState } = useAppState()
  const [buttons, setButtons] = useState([])
  const database = useSelector((state) => state.database);
  const facilitys = database.facilitys;

  // カスタムボタンを取得
  useEffect(() => {
    const enabledButtons = getCustomButtons()
    setButtons(enabledButtons)
  }, [customButtons, getCustomButtons])

  // 加算比較ボタンの処理
  const handleAdditionCompare = (buttonConfig) => {
    console.log("🔘 [CUSTOM_BUTTONS] 加算比較ボタンがクリックされました")
    console.log("🔍 [CUSTOM_BUTTONS] buttonConfig:", buttonConfig);

    console.log("🔍 [CUSTOM_BUTTONS] AppState:", {
      FACILITY_ID: appState.FACILITY_ID,
      DATE_STR: appState.CURRENT_YMD})
    try {
      if (window.electronAPI && window.electronAPI.open_addition_compare_btn) {
        console.log("📤 [CUSTOM_BUTTONS] electronAPI.open_addition_compare_btn を呼び出します")
        console.log("📤 施設データ:", facilitys)
        window.electronAPI.open_addition_compare_btn(appState.FACILITY_ID, appState.CURRENT_YMD)
      } else {
        console.error("❌ [CUSTOM_BUTTONS] window.electronAPI.open_addition_compare_btn が見つかりません")
        console.log("🔍 [CUSTOM_BUTTONS] window.electronAPI:", window.electronAPI)
      }
    } catch (error) {
      console.error("❌ [CUSTOM_BUTTONS] 加算比較ボタンクリック処理でエラー:", error)
    }
  }

  // カスタムアクション1の処理
  const handleCustomAction1 = async (buttonConfig) => {
    console.log("🔧 カスタムアクション1を実行")
    console.log("🔍 [CUSTOM_BUTTONS] AppState:", {
      FACILITY_ID: appState.FACILITY_ID,
      DATE_STR: appState.CURRENT_YMD
    })

    // 新しいwebviewを作成
    const webviewContainer = document.getElementById("webview-container")
    const tabsContainer = document.getElementById("tabs")
    const addTabBtn = tabsContainer.querySelector("button:last-child")

    const newId = `hugview-${Date.now()}-${document.querySelectorAll("webview").length}`
    const newWebview = document.createElement("webview")
    newWebview.id = newId
    console.log("🔍 日付指定", appState.CURRENT_YMD)
    // 指定されたURLを設定
    const targetUrl = `https://www.hug-ayumu.link/hug/wm/attendance.php?mode=add&date=${appState.CURRENT_YMD}&f_id=${appState.FACILITY_ID}`
    newWebview.src = targetUrl
    newWebview.setAttribute("allowpopups", "true")
    newWebview.setAttribute("disablewebsecurity", "true")
    // preloadパスがグローバルに保存されている場合は設定
    if (window.preloadPath) {
      newWebview.setAttribute("preload", window.preloadPath)
    }
    newWebview.style.cssText = "position:absolute;inset:0;width:100%;height:100%;z-index:1;pointer-events:auto;"
    newWebview.classList.add("hidden")
    webviewContainer.appendChild(newWebview)

    // タブボタンを作成
    const tabButton = document.createElement("button")
    tabButton.innerHTML = `
      ${buttonConfig.text}
      <span class="close-btn"${appState.closeButtonsVisible ? "" : " style='display:none'"}>❌</span>
    `
    tabButton.dataset.target = newId
    tabsContainer.insertBefore(tabButton, addTabBtn)

    // タブクリック（アクティブ切替）
    tabButton.addEventListener("click", () => {
      document.querySelectorAll("webview").forEach(v => v.classList.add("hidden"))
      newWebview.classList.remove("hidden")
      setActiveWebview(newWebview)
    })

    // 閉じる処理
    const closeBtn = tabButton.querySelector(".close-btn")
    closeBtn.addEventListener("click", (e) => {
      e.stopPropagation()
      if (!confirm("このタブを閉じますか？")) return
      newWebview.remove()
      tabButton.remove()

      // 閉じたタブがアクティブならデフォルトに戻す
      if (getActiveWebview() === newWebview) {
        const defaultView = document.getElementById("hugview")
        defaultView.classList.remove("hidden")
        setActiveWebview(defaultView)
        tabsContainer.querySelector(`button[data-target="hugview"]`)?.classList.add("active-tab")
      }
    })

    // webviewの読み込み完了を待つ
    newWebview.addEventListener("did-finish-load", () => {
      console.log("🔍 [CUSTOM_BUTTONS] webview読み込み完了、select要素を設定中...")

      // 少し遅延を入れてからselect要素にアクセス
      setTimeout(() => {
        try {
          if (appState.SELECT_CHILD) {
            // webview内でJavaScriptを実行してselect要素と備考欄を設定
            const script = `
              (function() {
                let success = true;
                
                // select要素を設定
                const selectElement = document.getElementById("name_list");
                if (selectElement) {
                  selectElement.value = "${appState.SELECT_CHILD}";
                  console.log("✅ select要素を設定:", "${appState.SELECT_CHILD}");
                  
                  // onchangeイベントを手動で発火
                  const changeEvent = new Event('change', { bubbles: true });
                  selectElement.dispatchEvent(changeEvent);
                  console.log("✅ onchangeイベントを発火しました");
                } else {
                  console.warn("⚠️ select要素が見つかりません");
                  success = false;
                }
                
                // 備考欄のinput要素を設定
                const noteInput = document.querySelector('input[name="note"]');
                if (noteInput) {
                  noteInput.value = "${appState.SELECT_PC_NAME || ''}";
                  console.log("✅ 備考欄を設定:", "${appState.SELECT_PC_NAME || ''}");
                } else {
                  console.warn("⚠️ 備考欄のinput要素が見つかりません");
                  success = false;
                }
                
                return success;
              })();
            `

            newWebview.executeJavaScript(script).then((result) => {
              if (result) {
                console.log(`✅ [CUSTOM_BUTTONS] 設定完了 - 子ども: ${appState.SELECT_CHILD}, 備考: ${appState.SELECT_PC_NAME || ''}`)
              } else {
                console.warn("⚠️ [CUSTOM_BUTTONS] 一部の要素の設定に失敗しました")
              }
            }).catch((error) => {
              console.error("❌ [CUSTOM_BUTTONS] executeJavaScriptでエラー:", error)
            })
          } else {
            console.warn("⚠️ [CUSTOM_BUTTONS] SELECT_CHILDが設定されていません")
          }
        } catch (error) {
          console.error("❌ [CUSTOM_BUTTONS] select要素の設定でエラー:", error)
        }
      }, 1000) // 1秒遅延
    })

    // 新しいタブをアクティブにする
    tabButton.click()

    console.log(`✅ [CUSTOM_BUTTONS] カスタムアクション1完了: ${targetUrl}`)
  }

  // カスタムアクション2の処理
  const handleCustomAction2 = (buttonConfig) => {
    console.log("🔧 カスタムアクション2を実行")
    alert(`カスタムアクション2が実行されました！\nボタン: ${buttonConfig.text}\nID: ${buttonConfig.id}`)
  }

  // デフォルトアクションの処理
  const handleDefaultAction = (buttonConfig) => {
    console.log("🔧 デフォルトアクションを実行")
    alert(`カスタムボタンがクリックされました！\nボタン: ${buttonConfig.text}\nアクション: ${buttonConfig.action}`)
  }

  // カスタムボタンのクリック処理
  const handleButtonClick = (buttonConfig) => {
    console.log(`🔧 カスタムボタンがクリックされました: ${buttonConfig.text}`)
    console.log(`📋 ボタン設定:`, buttonConfig)

    // アクションに応じた処理
    switch (buttonConfig.action) {
      case 'customAction1':
        handleCustomAction1(buttonConfig)
        break
      case 'customAction2':
        handleCustomAction2(buttonConfig)
        break
      case 'additionCompare':
        handleAdditionCompare(buttonConfig)
        break
      default:
        handleDefaultAction(buttonConfig)
        break
    }
  }

  return (
    <ul className="list-none m-0 p-0 py-1.25">
      {buttons.map((buttonConfig) => (
        <li key={buttonConfig.id} className="m-0 p-0">
          <button
            onClick={() => handleButtonClick(buttonConfig)}
            style={{
              backgroundColor: buttonConfig.color,
              color: 'white',
              border: 'none',
              padding: '8px 12px',
              borderRadius: '4px',
              cursor: 'pointer',
              width: '100%',
              marginBottom: '4px',
              transition: 'opacity 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.8'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1'
            }}
          >
            {buttonConfig.text}
          </button>
        </li>
      ))}
    </ul>
  )
}

export default CustomButtonsPanel