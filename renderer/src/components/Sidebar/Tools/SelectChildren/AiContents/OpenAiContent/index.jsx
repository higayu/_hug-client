// renderer/src/components/Sidebar/Tools/MemoTool/Parts/OpenAiButton.jsx
import React, { useCallback, useEffect, useState } from "react"
import { FaRobot } from "react-icons/fa"
import { useTabs } from "@/hooks/useTabs";
//import { useAppState } from "@/contexts/AppStateContext.jsx";
import { useAppState } from '@/contexts/appState';

import { createWebview, createTabButton } from "@/hooks/useTabs/common/index.js"
import PromptBox from "./PromptBox";
import AccountInfoPanel from "./common/AccountInfoPanel";

export default function OpenAiContent() {
  const { appState } = useAppState()
  const { activateTab, closeTab } = useTabs()
  const { PROMPTS } = useAppState()


  // 🔥 初期化処理ログ追加（コンポーネントマウント時）
  useEffect(() => {
    console.log("🟦 OpenAiContent コンポーネント初期化（マウント）")
    console.log(" appState:", appState)
    console.log("PROMPTSのデータ",PROMPTS);
  }, []) // ← 初回のみ実行

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
    const openAiUrl = "https://chat.openai.com/"

    console.log("🧠 OpenAIタブ作成:", newId, openAiUrl)

    const newWebview = createWebview(newId, openAiUrl)
    webviewContainer.appendChild(newWebview)

    const tabButton = createTabButton(
      newId,
      "OpenAI ChatGPT",
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

    newWebview.addEventListener("did-finish-load", () => {
      console.log("✅ OpenAIページロード完了:", openAiUrl)
    })

    activateTab(newId)
  }, [appState.closeButtonsVisible, activateTab, closeTab])

  return (
    <div className="flex flex-col items-center justify-center w-full p-2 space-y-3">
      <button
        onClick={handleOpenAI}
        className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md px-3 py-2 transition-colors"
      >
        <FaRobot size={18} />
        <span>OpenAIを起動（新しいタブ）</span>
      </button>

      <PromptBox />
      {/* OpenAI 認証情報の表示（config.json 経由で appState に載っている想定） */}
      <AccountInfoPanel
        title="OpenAI アカウント情報"
        items={[
          { label: "MAIL", value: appState.OPENAI_MAIL },
          { label: "PASSWORD", value: appState.OPENAI_PASSWORD },
        ]}
      />
    </div>
  )
}
