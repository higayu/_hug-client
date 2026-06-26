import React, { useCallback } from "react"

import { FaRobot } from "react-icons/fa"

import { useTabs } from "@/hooks/useTabs"

import { useAppState } from "@/contexts/appState"

import { createWebview, createTabButton } from "@/hooks/useTabs/common/index.js"

import { runEnableTemporaryChatAfterLoad } from "./enableTemporaryChatInWebview.js"



const OPENAI_URL = "https://chat.openai.com/"

const TAB_LABEL = "OpenAI ChatGPT"



export default function OpenAiTabButton() {
  const { appState } = useAppState()
  const { activateTab, closeTab } = useTabs()

  const handleOpenAI = useCallback(() => {
    const tabsContainer = document.getElementById("tabs")
    const webviewContainer = document.getElementById("webview-container")

    console.log("▶ handleOpenAI 実行開始")

    if (!tabsContainer || !webviewContainer) {
      console.error("❌ tabs または webview-container が見つかりません")
      alert("タブ領域が見つかりません。")
      return
    }

    const newId = `openai-${Date.now()}-${document.querySelectorAll("webview").length}`
    console.log("🧠 OpenAIタブ作成:", newId, OPENAI_URL)
    const newWebview = createWebview(newId, OPENAI_URL)
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

      runEnableTemporaryChatAfterLoad(newWebview)
        .then((ok) => {
          if (ok) temporaryChatDone = true
        })
        .finally(() => {
          enablePending = false
        })
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
      onClick={handleOpenAI}
      className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md px-3 py-2 transition-colors"
    >
      <FaRobot size={18} />
      <span>OpenAIを起動（新しいタブ）</span>
    </button>
  )

}

