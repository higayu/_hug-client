// src/hooks/useHugActions.js
// hugActions.jsの機能をReact hooksに移行

import { useEffect, useCallback, useRef } from 'react'
import { useDispatch } from 'react-redux'
//import { useAppState } from '@/contexts/AppStateContext.jsx'
import { useAppState } from '@/contexts/appState'
import { useToast } from  '@/components/common/ToastContext.jsx'
import { getActiveWebview } from '../utils/webview/webviewState.js'
import { loadAllReload } from '../utils/config/reloadSettings.js'
import { updateButtonVisibility } from '../utils/app/buttonVisibility.js'
import { useCustomButtonManager } from './useCustomButtonManager.js'
import { fetchAttendanceTable } from '../store/slices/attendanceSlice.js'

export function useHugActions() {
  const { appState, updateAppState } = useAppState()
  const { showSuccessToast, showErrorToast } = useToast()
  const { reloadCustomButtons } = useCustomButtonManager()
  const dispatch = useDispatch()
  const initializedRef = useRef(false)

  // 自動ログイン
  const handleLogin = useCallback(async () => {
    console.log("🖱️ [HugActions] loginBtn clicked")
    const vw = getActiveWebview()
    if (!vw) return alert("Webview が見つかりません")

    await new Promise((resolve) => {
      if (vw.isLoading()) {
        vw.addEventListener("did-finish-load", resolve, { once: true })
      } else {
        resolve()
      }
    })

    if (!appState.HUG_USERNAME || !appState.HUG_PASSWORD) {
      alert("config.json がまだ読み込まれていません。")
      return
    }

    console.log("🚀 自動ログイン開始...")
    try {
      await vw.executeJavaScript(`
        document.querySelector('input[name="username"]').value = ${JSON.stringify(appState.HUG_USERNAME)};
        document.querySelector('input[name="password"]').value = ${JSON.stringify(appState.HUG_PASSWORD)};
        const checkbox = document.querySelector('input[name="setexpire"]');
        if (checkbox && !checkbox.checked) checkbox.click();
        document.querySelector("input.btn-login")?.click();
      `)
    } catch (err) {
      console.error("❌ ログインスクリプト実行エラー:", err)
      alert("ログインスクリプト実行に失敗しました")
    }
  }, [appState.HUG_USERNAME, appState.HUG_PASSWORD])

  // 個別支援計画（別ウインドウ）
  const handleIndividualSupport = useCallback(() => {
    window.electronAPI.openIndividualSupportPlan(appState.SELECT_CHILD)
  }, [appState.SELECT_CHILD])

  // 専門的支援計画（別ウインドウ）
  const handleSpecializedSupport = useCallback(() => {
    window.electronAPI.openSpecializedSupportPlan(appState.SELECT_CHILD)
  }, [appState.SELECT_CHILD])


  // URLの取得
  const handleGetUrl = useCallback(async () => {
    console.log("🖱️ [HugActions] Get-Url clicked")
    try {
      console.log("🔄 URLの取得処理を開始...")
      const vw = getActiveWebview()
      
      if (!vw) {
        showErrorToast("❌ WebViewが見つかりません")
        return
      }

      // WebViewのURLを取得
      const url = vw.getURL()
      console.log("📋 取得したURL:", url)

      if (!url || url === 'about:blank') {
        showErrorToast("❌ URLが取得できませんでした")
        return
      }

      // クリップボードにコピー
      await navigator.clipboard.writeText(url)
      console.log("✅ URLをクリップボードにコピーしました:", url)
      
      // 成功メッセージを表示（URLの詳細情報も含める）
      const urlObj = new URL(url)
      const shortUrl = urlObj.hostname + urlObj.pathname
      showSuccessToast(`✅ URLをコピーしました\n${shortUrl}`)
      
    } catch (err) {
      console.error("❌ URL取得・コピーエラー:", err)
      
      // フォールバック: 古いブラウザ対応
      try {
        const vw = getActiveWebview()
        const url = vw.getURL()
        
        // テキストエリアを使用したフォールバック
        const textArea = document.createElement('textarea')
        textArea.value = url
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        
        showSuccessToast(`✅ URLをクリップボードにコピーしました（フォールバック）`)
        console.log("✅ フォールバック方式でコピー成功")
        
      } catch (fallbackErr) {
        console.error("❌ フォールバック方式も失敗:", fallbackErr)
        showErrorToast("❌ URLのコピーに失敗しました")
      }
    }
  }, [showSuccessToast, showErrorToast])

  // ini.jsonの手動読み込み
  const handleLoadIni = useCallback(async () => {
    try {
      const reloadOk = await loadAllReload()
      if (reloadOk) {
        updateButtonVisibility() // ボタン表示を更新
        // カスタムボタンも再読み込み
        await reloadCustomButtons()
        showSuccessToast("✅ 設定の再読み込みが完了しました")
      }
    } catch (err) {
      console.error("❌ ini.json読み込みエラー:", err)
      alert("❌ エラーが発生しました: " + err.message)
    }
  }, [showSuccessToast])

  // 閉じるボタンの表示ON/OFF
  const handleCloseToggle = useCallback((e) => {
    const visible = e.target.checked
    updateAppState({ closeButtonsVisible: visible })
    document.querySelectorAll(".close-btn").forEach(btn => {
      btn.style.display = visible ? "inline" : "none"
    })
  }, [updateAppState])

  // 出勤データ取得処理
  const handleFetchAttendanceData = useCallback(async (button) => {
    const resultEl = document.getElementById("settings")?.querySelector("#attendanceResult")
    
    if (!resultEl) {
      console.error("❌ 結果表示要素が見つかりません")
      return
    }

    try {
      // ボタンを無効化
      button.disabled = true
      button.textContent = "⏳ 取得中..."
      resultEl.style.display = "block"
      resultEl.className = "attendance-result info"
      resultEl.textContent = "📥 データを取得しています..."

      // 施設IDと日付を取得
      const facilitySelect = document.getElementById("facilitySelect")
      const dateInput = document.getElementById("settings")?.querySelector("#dateSelect")
      
      const facility_id = facilitySelect?.value || appState.FACILITY_ID
      const date_str = dateInput?.value || appState.CURRENT_YMD

      if (!facility_id || !date_str) {
        throw new Error("施設IDまたは日付が設定されていません")
      }

      console.log("📊 [ATTENDANCE] 出勤データ取得開始:", { facility_id, date_str })

      // Reduxの非同期アクションを実行
      const result = await dispatch(fetchAttendanceTable({
        facility_id,
        date_str,
        options: { showToast: true }
      }))

      if (fetchAttendanceTable.fulfilled.match(result)) {
        const tableData = result.payload
        // 成功時
        resultEl.className = "attendance-result success"
        resultEl.innerHTML = `
          <div style="font-weight: bold; margin-bottom: 8px;">✅ データ取得完了</div>
          <div style="margin-bottom: 4px;">施設ID: ${facility_id}</div>
          <div style="margin-bottom: 4px;">日付: ${date_str}</div>
          <div style="margin-bottom: 4px;">テーブル行数: ${tableData.rowCount}</div>
          <div style="margin-bottom: 4px;">ページタイトル: ${tableData.pageTitle || "N/A"}</div>
          <details style="margin-top: 8px;">
            <summary style="cursor: pointer; font-weight: bold;">テーブルHTML（クリックで展開）</summary>
            <pre style="margin-top: 8px; padding: 8px; background: #f8f9fa; border-radius: 4px; overflow-x: auto; font-size: 10px; max-height: 300px; overflow-y: auto;">${escapeHtml(tableData.html)}</pre>
          </details>
        `
        console.log("✅ [ATTENDANCE] 出勤データ取得成功:", tableData)
      } else {
        // 失敗時
        const error = result.payload || result.error || '不明なエラー'
        resultEl.className = "attendance-result error"
        resultEl.innerHTML = `
          <div style="font-weight: bold; margin-bottom: 8px;">❌ データ取得失敗</div>
          <div>エラー: ${escapeHtml(error)}</div>
        `
        console.error("❌ [ATTENDANCE] 出勤データ取得失敗:", error)
      }

    } catch (error) {
      console.error("❌ [ATTENDANCE] 出勤データ取得エラー:", error)
      const resultEl = document.getElementById("settings")?.querySelector("#attendanceResult")
      if (resultEl) {
        resultEl.className = "attendance-result error"
        resultEl.innerHTML = `
          <div style="font-weight: bold; margin-bottom: 8px;">❌ エラーが発生しました</div>
          <div>${escapeHtml(error.message || "不明なエラー")}</div>
        `
      }
    } finally {
      // ボタンを再有効化
      if (button) {
        button.disabled = false
        button.textContent = "📊 出勤データ取得"
      }
    }
  }, [appState.FACILITY_ID, appState.CURRENT_YMD, dispatch])

  /**
   * HTMLエスケープ関数
   */
  const escapeHtml = (text) => {
    const div = document.createElement("div")
    div.textContent = text
    return div.innerHTML
  }

  // 出勤データ取得ボタンのイベントリスナーを設定
  useEffect(() => {
    const checkAndSetup = () => {
      const settingsEl = document.getElementById("settings")
      const button = settingsEl?.querySelector("#fetchAttendanceBtn")
      
      if (button && !button.dataset.listenerAdded) {
        button.dataset.listenerAdded = "true"
        
        button.addEventListener("click", async () => {
          await handleFetchAttendanceData(button)
        })
        
        console.log("✅ 出勤データ取得ボタンのイベントリスナーを設定しました")
      } else if (!button) {
        // まだ読み込まれていない場合、少し待って再試行
        setTimeout(checkAndSetup, 500)
      }
    }
    
    // 初期チェック
    checkAndSetup()
    
    // DOM変更を監視してサイドバーが読み込まれたら設定
    const observer = new MutationObserver(() => {
      checkAndSetup()
    })
    
    const settingsEl = document.getElementById("settings")
    if (settingsEl) {
      observer.observe(settingsEl, { childList: true, subtree: true })
    }

    return () => {
      observer.disconnect()
    }
  }, [handleFetchAttendanceData])

  // ボタンのイベントリスナーを設定
  useEffect(() => {
    if (initializedRef.current) return
    initializedRef.current = true

    // loginBtn
    const loginBtn = document.getElementById("loginBtn")
    if (loginBtn) {
      console.log("🔗 [HugActions] Attaching click listener: loginBtn")
      loginBtn.addEventListener("click", handleLogin)
    }

    // Individual_Support_Button
    const individualBtn = document.getElementById("Individual_Support_Button")
    if (individualBtn) {
      individualBtn.addEventListener("click", handleIndividualSupport)
    }

    // Specialized-Support-Plan
    const specializedBtn = document.getElementById("Specialized-Support-Plan")
    if (specializedBtn) {
      specializedBtn.addEventListener("click", handleSpecializedSupport)
    }


    // Get-Url
    const getUrlBtn = document.getElementById("Get-Url")
    if (getUrlBtn) {
      console.log("🔗 [HugActions] Attaching click listener: Get-Url")
      getUrlBtn.addEventListener("click", handleGetUrl)
    }

    // closeToggle
    const closeToggle = document.getElementById("closeToggle")
    if (closeToggle) {
      closeToggle.addEventListener("change", handleCloseToggle)
    }

    return () => {
      if (loginBtn) loginBtn.removeEventListener("click", handleLogin)
      if (individualBtn) individualBtn.removeEventListener("click", handleIndividualSupport)
      if (specializedBtn) specializedBtn.removeEventListener("click", handleSpecializedSupport)
      if (getUrlBtn) getUrlBtn.removeEventListener("click", handleGetUrl)
      if (closeToggle) closeToggle.removeEventListener("change", handleCloseToggle)
    }
  }, [
    handleLogin,
    handleIndividualSupport,
    handleSpecializedSupport,
    handleGetUrl,
    handleCloseToggle
  ])

  // ハンドラーを返して、JSXの onClick からも呼べるようにする
  return {
    handleLogin,
    handleGetUrl,
    handleIndividualSupport,
    handleSpecializedSupport,
  }
}

