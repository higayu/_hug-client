import React, { useCallback } from "react"

import { FaRobot } from "react-icons/fa"
import { useTabs } from "@/hooks/useTabs"
import { useAppState } from "@/AppStateContext";
import { createWebview, createTabButton } from "@/hooks/useTabs/common/index.js"
import tabIcon from '@assets/images/icon.png';

const DEEPSEEK_URL = "https://chat.deepseek.com/"
const TAB_LABEL = "deepseek"

export default function DeepseekTabButton() {
  const { appState } = useAppState()
  const { activateTab, closeTab } = useTabs()

  const handleDeepSeek = useCallback(() => {
    const tabsContainer = document.getElementById("tabs")
    const webviewContainer = document.getElementById("webview-container")

    console.log("▶ handleDeepSeek 実行開始")

    if (!tabsContainer || !webviewContainer) {
      console.error("❌ tabs または webview-container が見つかりません")
      alert("タブ領域が見つかりません。")
      return
    }

    const newId = `openai-${Date.now()}-${document.querySelectorAll("webview").length}`

    console.log("🧠 OpenAIタブ作成:", newId, DEEPSEEK_URL)

    const newWebview = createWebview(newId, DEEPSEEK_URL)
    webviewContainer.appendChild(newWebview)

    const tabButton = createTabButton(
      newId,
      TAB_LABEL,
      appState.closeButtonsVisible
    )

    if (!tabButton) return
    tabsContainer.appendChild(tabButton)
    tabButton.addEventListener("click", () => {
      console.log("🟩 タブアクティブ切り替え:", newId)
      activateTab(newId)
    })

    const closeBtn = tabButton.querySelector(".close-btn")
    if (closeBtn) {
      closeBtn.addEventListener("click", (e) => {
        e.stopPropagation()
        console.log("🟥 タブ閉じるクリック:", newId)
        if (!confirm("このタブを閉じますか？")) return
        closeTab(newId)
      })

    }

    activateTab(newId)

    let temporaryChatDone = false
    let enablePending = false
    const scheduleEnableTemporaryChat = () => {
      if (temporaryChatDone || enablePending) return
      enablePending = true
    }

    newWebview.addEventListener("did-finish-load", () => {
      console.log("✅ OpenAIページロード完了")
      scheduleEnableTemporaryChat()
    })

    newWebview.addEventListener("dom-ready", () => {
      console.log("✅ OpenAI dom-ready")
      scheduleEnableTemporaryChat()
    })
  }, [appState.closeButtonsVisible, activateTab, closeTab])



  return (

    <button
      type="button"
      onClick={handleDeepSeek}
      className="min-w-[150px] flex items-center justify-center gap-2 bg-white hover:bg-blue-300 text-blue-600 rounded-xl shadow-md px-3 py-2 transition-colors"
      title="新しいタブで開く"
    >
      <img 
        src={tabIcon} 
        alt="icon" 
        className="w-[20px] h-[20px] object-contain hover:bg-blue-300"
      />
      <span>deepseekを起動</span>
    </button>

  )

}

