import { useEffect, useRef } from 'react'
// initTabs は React側の useTabs() フックに移行済み
import { updateButtonVisibility } from '../utils/buttonVisibility.js'
// initChildrenList は React側の useChildrenList() フックに移行済み
import { useHugActions } from './useHugActions.js'
import { loadAllReload } from '../utils/reloadSettings.js'
// updateUI は React側の useUpdateUI() フックに移行済み
import { useUpdateUI } from './useUpdateUI.js'
import { useCustomButtonManager } from './useCustomButtonManager.js'
// buttonVisibilityManager は削除されました（機能が空のため）
import { getActiveWebview } from '../utils/webviewState.js'
import { useToast } from  '@/components/common/ToastContext.jsx'

export function useAppInitialization() {
  const { showErrorToast } = useToast()
  const { addUpdateButtons } = useUpdateUI()
  const { init: initCustomButtons, reloadCustomButtons } = useCustomButtonManager()
  const showErrorToastRef = useRef(showErrorToast)
  const initializedRef = useRef(false)
  
  // hugActionsの機能をReact hooksに移行
  useHugActions()

  // showErrorToastの参照を更新
  useEffect(() => {
    showErrorToastRef.current = showErrorToast
  }, [showErrorToast])

  useEffect(() => {
    if (initializedRef.current) return
    initializedRef.current = true

    const initializeApp = async () => {
      console.log("🚀 React App 初期化開始")

      // ===== 1️⃣ 設定読み込み =====
      const ok = await loadAllReload()
      if (!ok) {
        showErrorToastRef.current("❌ config.json の読み込みに失敗しました")
        return
      }

      // ===== 2️⃣ サイドバー & タブ初期化 =====
      // サイドバーの開閉機能を設定
      const settingsEl = document.getElementById("settings")
      const menuToggle = document.getElementById("menuToggle")

      // サイドバーの固定状態を管理
      let isSidebarPinned = false

      if (settingsEl && menuToggle) {
        menuToggle.addEventListener("click", (e) => {
          e.stopPropagation()
          e.preventDefault()
          const isOpen = settingsEl.classList.toggle("open")
          console.log(isOpen ? "📂 サイドバーを開いた" : "📁 サイドバーを閉じた")
        }, true) // captureフェーズで処理

        // サイドバーの固定状態変更イベントをリスニング
        window.addEventListener("sidebar-pin-changed", (e) => {
          isSidebarPinned = e.detail?.pinned || false
          console.log(isSidebarPinned ? "📌 サイドバー固定状態: ON" : "📍 サイドバー固定状態: OFF")
        })

        // 外側クリックでサイドバーを閉じる処理（固定時は無効化）
        document.addEventListener("click", (e) => {
          if (isSidebarPinned) {
            // 固定時は外側クリックで閉じない
            return
          }
          
          // webviewのクリックは除外（webviewは外側クリックとして扱わない）
          const isWebviewClick = e.target.tagName === 'WEBVIEW' || e.target.closest('webview')
          
          if (
            settingsEl.classList.contains("open") &&
            !settingsEl.contains(e.target) &&
            !menuToggle.contains(e.target) &&
            !isWebviewClick
          ) {
            settingsEl.classList.remove("open")
            console.log("📁 サイドバーを閉じました（外側クリック）")
          }
        })

        console.log("✅ サイドバーの開閉機能を設定しました")
      }


      // ===== 5️⃣ 設定エディター初期化 =====
      // 少し遅延させて確実に初期化
      setTimeout(async () => {
        console.log("🔄 設定エディターを初期化中...")

        // 設定が正しく読み込まれているか確認
        console.log("🔍 [MAIN] IniState確認:", window.IniState)
        console.log("🔍 [MAIN] AppState確認:", window.AppState)
        // customButtonsはcustomButtons.jsonに統一されたため、IniStateからの参照は削除

        // settingsEditorはReactコンポーネント（SettingsModal）に統合されました
        // window.settingsEditor = initSettingsEditor()
      }, 200)

      // ===== 6️⃣ ボタンの表示を更新（少し遅延させて確実に実行） =====
      setTimeout(() => {
        updateButtonVisibility()
      }, 100)

      // ===== 7️⃣ 設定ファイルインポート後の再読み込み処理 =====
      // 設定ファイルインポートボタンのイベントリスナーを追加
      const importSettingBtn = document.getElementById("Import-Setting")
      if (importSettingBtn) {
        importSettingBtn.addEventListener("click", async () => {
          try {
            const result = await window.electronAPI.importConfigFile()
            if (result.success) {
              // 設定ファイルインポート後に設定を再読み込み
              const reloadOk = await loadAllReload()
              if (reloadOk) {
                updateButtonVisibility() // ボタン表示を更新
                console.log("✅ 設定ファイルインポート後の再読み込み完了")
              }
            }
          } catch (err) {
            console.error("❌ 設定ファイルインポート後の再読み込みエラー:", err)
          }
        })
      }

      // ===== 8️⃣ ini.jsonの手動読み込み処理 =====
      const loadIniBtn = document.getElementById("Load-Ini")
      if (loadIniBtn) {
        loadIniBtn.addEventListener("click", async () => {
          try {
            const reloadOk = await loadAllReload()
            if (reloadOk) {
              updateButtonVisibility() // ボタン表示を更新
              // カスタムボタンも再読み込み
              await reloadCustomButtons()
              console.log("✅ ini.jsonの手動読み込み完了")
            }
          } catch (err) {
            console.error("❌ ini.jsonの手動読み込みエラー:", err)
          }
        })
      }

      // ===== 退出確認（メインからの要求に応答） =====
      window.electronAPI.onConfirmCloseRequest(async () => {
        try {
          const enabled = window.IniState?.appSettings?.ui?.confirmOnClose !== false // 未設定時は確認ON
          let shouldClose = true
          if (enabled) {
            shouldClose = window.confirm('アプリを終了しますか？')
          }
          window.electronAPI.sendConfirmCloseResponse(shouldClose)
        } catch (err) {
          console.error('❌ 終了確認処理エラー:', err)
          // 失敗時は安全側（閉じない）
          window.electronAPI.sendConfirmCloseResponse(false)
        }
      })

      console.log("🎉 初期化完了:", window.AppState)

      // 🔄 アップデートUI機能を初期化
      // updateUI は React側の useUpdateUI() フックに移行済み（自動初期化）
      const isDebugMode = window.electronAPI.isDebugMode()

      // デバッグモードの場合、追加のUIボタンを表示
      if (isDebugMode) {
        console.log("🔧 デバッグモード: 追加UIボタンを表示します")
        addUpdateButtons()
      }

      // ===== 9️⃣ カスタムボタンマネージャー初期化 =====
      console.log("🔧 カスタムボタンマネージャーを初期化中...")
      await initCustomButtons()

      // ===== 🔟 ボタン表示制御マネージャー初期化 =====
      // buttonVisibilityManager は削除されました（機能が空のため）

      // ===== ⓫ アクティブURLのUI反映（設定モーダルのみ） =====
      function setModalUrlText(urlText) {
        const input = document.getElementById("current-webview-url")
        if (input) input.value = urlText || ""
      }

      function refreshUrlUI() {
        const vw = getActiveWebview()
        const url = vw && typeof vw.getURL === 'function' ? vw.getURL() : ''
        setModalUrlText(url)
      }

      // 初期反映
      refreshUrlUI()

      // アクティブwebview変更時に更新
      document.addEventListener('active-webview-changed', (e) => {
        const url = e?.detail?.url || ''
        setModalUrlText(url)
      })

      // webviewのナビゲーションイベントで更新
      function attachWebviewUrlListeners(vw) {
        if (!vw) return
        const handler = () => {
          const url = typeof vw.getURL === 'function' ? vw.getURL() : ''
          setModalUrlText(url)
        }
        vw.addEventListener('did-navigate', handler)
        vw.addEventListener('did-navigate-in-page', handler)
        vw.addEventListener('did-redirect-navigation', handler)
      }

      // 既存のhugviewにリスナー
      const hugview = document.getElementById('hugview')
      if (hugview) {
        attachWebviewUrlListeners(hugview)
      }

      // 追加されるwebviewにも自動でリスナーを付与
      const contentEl = document.getElementById('content')
      if (contentEl) {
        const mo = new MutationObserver((mutations) => {
          for (const m of mutations) {
            m.addedNodes.forEach((node) => {
              if (node && node.tagName === 'WEBVIEW') {
                attachWebviewUrlListeners(node)
              }
            })
          }
        })
        mo.observe(contentEl, { childList: true })
      }

      // 設定保存などによりIniStateが更新された場合の反映
      document.addEventListener('app-settings-updated', () => {
        refreshUrlUI()
      })
    }

    initializeApp()
  }, [])
}

