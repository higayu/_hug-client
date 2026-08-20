// src/components/CustomButtonsPanel/webviewActions.js

import { getActiveWebview, setActiveWebview } from '@/utils/webview/webviewState.js'


export async function handleCustomAction1(buttonConfig, appState) {
  console.log("🔧 カスタムアクション1を実行")

  const webviewContainer = document.getElementById("webview-container")
  const tabsContainer = document.getElementById("tabs")

  if (!webviewContainer || !tabsContainer) {
    console.error("❌ 必要なDOMが見つかりません")
    return
  }

  const newId = `hugview-${Date.now()}-${document.querySelectorAll("webview").length}`

  const newWebview = document.createElement("webview")
  newWebview.id = newId

  const targetUrl = `https://www.hug-ayumu.link/hug/wm/attendance.php?mode=add&date=${appState.CURRENT_YMD}&f_id=${appState.FACILITY_ID}`

  newWebview.src = targetUrl
  newWebview.setAttribute("allowpopups", "true")
  newWebview.setAttribute("disablewebsecurity", "true")

  if (window.preloadPath) {
    newWebview.setAttribute("preload", window.preloadPath)
  }

  webviewContainer.querySelectorAll("webview").forEach((webview) => {
    webview.classList.add("hidden")
  })
  newWebview.className = "absolute inset-0 h-full w-full border-none"
  webviewContainer.appendChild(newWebview)
  setActiveWebview(newWebview)
}

export function handleAdditionCompare(appState,facilytys) {
  if (window.electronAPI?.open_addition_compare_btn) {
    window.electronAPI.open_addition_compare_btn(
      appState.FACILITY_ID,
      appState.CURRENT_YMD
    )
  }
}

export function handleProfessionalSupportSearch(appState,facilytys) {
 
    const facilityId = Number(appState.FACILITY_ID)

    const targetFacility = facilytys.find(
    f => f.id === facilityId
    )

    console.log(targetFacility);

    if (window.electronAPI?.handleProfessionalSupportSearch) {
        window.electronAPI.handleProfessionalSupportSearch(
            appState.FACILITY_ID,
            targetFacility,
            appState.CURRENT_YMD
        )
    }
}

