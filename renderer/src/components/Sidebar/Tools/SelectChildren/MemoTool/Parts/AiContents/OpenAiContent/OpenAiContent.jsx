// renderer/src/components/Sidebar/Tools/MemoTool/Parts/OpenAiButton.jsx
import React, { useCallback } from "react"
import { FaRobot } from "react-icons/fa"
import { useTabs } from "@/hooks/useTabs";
import { useAppState } from "@/contexts/AppStateContext.jsx"
import { createWebview, createTabButton } from "@/hooks/useTabs/common/index.js"
import { useState } from "react"
import AiInputBox from '../common/AiInputBox.jsx'

export default function OpenAiContent() {
  const { appState } = useAppState()
  const { activateTab, closeTab } = useTabs()
  const [prompt, setPrompt] = useState('') // テキストを共有する状態

  const handleOpenAI = useCallback(() => {
    const tabsContainer = document.getElementById("tabs")
    const webviewContainer = document.getElementById("webview-container")

    if (!tabsContainer || !webviewContainer) {
      console.error("❌ tabs または webview-container が見つかりません")
      alert("タブ領域が見つかりません。")
      return
    }

    // === 新規IDとURL設定 ===
    const newId = `openai-${Date.now()}-${document.querySelectorAll("webview").length}`
    const openAiUrl = "https://chat.openai.com/" // ChatGPT公式ページ or 社内AIポータルなどに変更可
    console.log("🧠 OpenAIタブを作成:", newId, openAiUrl)

    // === webview作成 ===
    const newWebview = createWebview(newId, openAiUrl)
    webviewContainer.appendChild(newWebview)

    // === タブボタン作成 ===
    const tabButton = createTabButton(
      newId,
      "OpenAI ChatGPT",
      appState.closeButtonsVisible
    )

    if (!tabButton) return
    tabsContainer.appendChild(tabButton)

    // === タブクリックイベント ===
    tabButton.addEventListener("click", () => {
      activateTab(newId)
    })

    // === タブ閉じるボタンイベント ===
    const closeBtn = tabButton.querySelector(".close-btn")
    if (closeBtn) {
      closeBtn.addEventListener("click", (e) => {
        e.stopPropagation()
        if (!confirm("このタブを閉じますか？")) return
        closeTab(newId)
      })
    }

    // === 初回ロードログ ===
    newWebview.addEventListener("did-finish-load", () => {
      console.log("✅ OpenAIページロード完了:", openAiUrl)
    })

    // === タブをアクティブ化 ===
    activateTab(newId)
  }, [appState.closeButtonsVisible, activateTab, closeTab])

  return (
    <div className="flex flex-col items-center justify-center w-full p-2">
      <AiInputBox />
      <button
        onClick={handleOpenAI}
        className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md px-3 py-2 transition-colors"
      >
        <FaRobot size={18} />
        <span>OpenAIを起動（新しいタブ）</span>
      </button>
    </div>
  )
}
