import React, { useCallback } from "react"

import { useTabs } from "@/hooks/useTabs"
import { useAppState } from "@/AppStateContext"
import {
  createWebview,
  createTabButton,
} from "@/hooks/useTabs/common/index.js"

import tabIcon from "@assets/images/icon.png"

const DEEPSEEK_URL = "https://chat.deepseek.com/"
const TAB_LABEL = "DeepSeek"

export default function DeepseekTabButton() {
  const { appState } = useAppState()
  const { activateTab, closeTab } = useTabs()

  const handleDeepSeek = useCallback(() => {
    const tabsContainer = document.getElementById("tabs")
    const webviewContainer =
      document.getElementById("webview-container")

    console.log("▶ DeepSeekタブ作成開始")

    if (!tabsContainer || !webviewContainer) {
      console.error(
        "❌ tabs または webview-container が見つかりません",
      )
      alert("タブ領域が見つかりません。")
      return
    }

    const webviewCount =
      document.querySelectorAll("webview").length

    const newId =
      `deepseek-${Date.now()}-${webviewCount}`

    console.log(
      "🧠 DeepSeekタブ作成:",
      newId,
      DEEPSEEK_URL,
    )

    const newWebview = createWebview(
      newId,
      DEEPSEEK_URL,
    )

    webviewContainer.appendChild(newWebview)

    const tabButton = createTabButton(
      newId,
      TAB_LABEL,
      appState.closeButtonsVisible,
    )

    if (!tabButton) {
      newWebview.remove()
      return
    }

    tabsContainer.appendChild(tabButton)

    let tabClosed = false

    function notifyWebviewTabClosed() {
      window.dispatchEvent(
        new CustomEvent("app:webview-tab-closed", {
          detail: {
            tabId: newId,
            service: "deepseek",
          },
        }),
      )
    }

    function restoreRendererFocus() {
      const activeElement = document.activeElement

      if (activeElement instanceof HTMLElement) {
        activeElement.blur()
      }

      window.focus()

      if (document.body) {
        document.body.focus()
      }

      const textarea =
        document.querySelector(
          '[data-memo-input="true"]:not([disabled]):not([readonly])',
        ) ??
        document.querySelector(
          "textarea:not([disabled]):not([readonly])",
        )

      if (textarea instanceof HTMLTextAreaElement) {
        textarea.focus({
          preventScroll: true,
        })
      }
    }

    function restoreFocusAfterDomUpdate() {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          notifyWebviewTabClosed()
          restoreRendererFocus()
        })
      })
    }

    function handleTabClick() {
      if (tabClosed) {
        return
      }

      console.log(
        "🟩 DeepSeekタブをアクティブ化:",
        newId,
      )

      activateTab(newId)
    }

    function handleDidFinishLoad() {
      if (tabClosed) {
        return
      }

      console.log("✅ DeepSeekページロード完了")
    }

    function handleDomReady() {
      if (tabClosed) {
        return
      }

      console.log("✅ DeepSeek dom-ready")
    }

    function handleCloseClick(event) {
      event.preventDefault()
      event.stopPropagation()

      console.log(
        "🟥 DeepSeekタブを閉じるクリック:",
        newId,
      )

      if (!confirm("このタブを閉じますか？")) {
        restoreFocusAfterDomUpdate()
        return
      }

      tabClosed = true

      try {
        newWebview.blur()
      } catch (error) {
        console.warn(
          "⚠️ DeepSeek webviewのblurに失敗しました",
          error,
        )
      }

      tabButton.removeEventListener(
        "click",
        handleTabClick,
      )

      closeBtn?.removeEventListener(
        "click",
        handleCloseClick,
      )

      newWebview.removeEventListener(
        "did-finish-load",
        handleDidFinishLoad,
      )

      newWebview.removeEventListener(
        "dom-ready",
        handleDomReady,
      )

      closeTab(newId)

      if (newWebview.isConnected) {
        newWebview.remove()
      }

      if (tabButton.isConnected) {
        tabButton.remove()
      }

      restoreFocusAfterDomUpdate()
    }

    tabButton.addEventListener(
      "click",
      handleTabClick,
    )

    const closeBtn =
      tabButton.querySelector(".close-btn")

    if (closeBtn) {
      closeBtn.addEventListener(
        "click",
        handleCloseClick,
      )
    }

    newWebview.addEventListener(
      "did-finish-load",
      handleDidFinishLoad,
      {
        once: true,
      },
    )

    newWebview.addEventListener(
      "dom-ready",
      handleDomReady,
      {
        once: true,
      },
    )

    activateTab(newId)
  }, [
    appState.closeButtonsVisible,
    activateTab,
    closeTab,
  ])

  return (
    <button
      type="button"
      onClick={handleDeepSeek}
      className="
        min-w-[150px]
        flex items-center justify-center gap-2
        bg-white hover:bg-blue-300
        text-blue-600
        rounded-xl shadow-md
        px-3 py-2
        transition-colors
      "
      title="新しいタブで開く"
    >
      <img
        src={tabIcon}
        alt="DeepSeek"
        className="
          w-[20px] h-[20px]
          object-contain
        "
      />

      <span>DeepSeekを起動</span>
    </button>
  )
}