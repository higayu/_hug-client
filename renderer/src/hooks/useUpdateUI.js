// src/hooks/useUpdateUI.js
// アップデートUI管理のフック

import { useEffect, useRef } from 'react'
import { getUpdateInfo, checkForUpdates, displayUpdateInfo } from '@/utils/app/updateManager.js'

/**
 * アップデートUI管理のフック
 */
export function useUpdateUI() {
  const isInitializedRef = useRef(false)

  // 初期化（起動時に1回だけアップデートチェック）
  useEffect(() => {
    if (isInitializedRef.current) return
    isInitializedRef.current = true

    const init = async () => {
      console.log("🔄 アップデートUI機能を初期化中...")
      
      // 起動時に1回だけアップデートチェック
      await checkForUpdates()
      const debugInfo = await getUpdateInfo()
      displayUpdateInfo(debugInfo)
      console.log("🔄 起動時: アップデートチェック完了")
      
      console.log("✅ アップデートUI機能初期化完了")
    }

    init()
  }, [])

  // デバッグモード用のUIボタンを追加
  const addUpdateButtons = () => {
    // 既存のボタンがあるかチェック
    if (document.getElementById('updateButtons')) return

    const updateContainer = document.createElement('div')
    updateContainer.id = 'updateButtons'
    updateContainer.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: rgba(0, 0, 0, 0.8);
      color: black;
      padding: 10px;
      border-radius: 5px;
      font-family: monospace;
      font-size: 12px;
      z-index: 10000;
      max-width: 300px;
    `

    updateContainer.innerHTML = `
      <div style="margin-bottom: 10px;">
        <strong>🔄 アップデート管理</strong>
      </div>
      <div id="updateInfo" style="margin-bottom: 10px; font-size: 10px;">
        読み込み中...
      </div>
      <div>
        <button id="checkUpdatesBtn" style="margin-right: 5px; padding: 3px 6px; font-size: 10px;">
          🔄 手動チェック
        </button>
        <button id="showUpdateInfoBtn" style="padding: 3px 6px; font-size: 10px;">
          📊 情報表示
        </button>
      </div>
    `

    document.body.appendChild(updateContainer)
    
    // イベントリスナーを設定
    setupEventListeners()
    
    console.log("✅ アップデートUIボタンを追加しました")
  }

  // イベントリスナーを設定
  const setupEventListeners = () => {
    const checkBtn = document.getElementById('checkUpdatesBtn')
    const infoBtn = document.getElementById('showUpdateInfoBtn')

    if (checkBtn) {
      checkBtn.addEventListener('click', async () => {
        console.log("🔄 手動アップデートチェック開始")
        try {
          const result = await checkForUpdates()
          if (result) {
            console.log("✅ 手動チェック成功:", result)
          } else {
            console.log("⚠️ 手動チェック結果なし")
          }
        } catch (err) {
          console.error("❌ 手動チェックエラー:", err)
        }
        
        // 情報を更新
        await updateInfoDisplay()
      })
    }
    
    if (infoBtn) {
      infoBtn.addEventListener('click', async () => {
        console.log("🔄 アップデート情報表示")
        const debugInfo = await getUpdateInfo()
        displayUpdateInfo(debugInfo)
        await updateInfoDisplay()
      })
    }

    console.log("✅ アップデートUIイベントリスナーを設定しました")
  }

  // アップデート情報表示を更新
  const updateInfoDisplay = async () => {
    const container = document.getElementById('updateInfo')
    if (!container) return

    const info = await getUpdateInfo()
    
    if (!info) {
      container.innerHTML = "❌ 情報取得失敗"
      return
    }

    container.innerHTML = `
      <div>📊 バージョン: ${info.currentVersion}</div>
      <div>🔍 チェック中: ${info.isChecking ? "はい" : "いいえ"}</div>
      <div>📅 最終チェック: ${info.lastCheckTime ? new Date(info.lastCheckTime).toLocaleTimeString() : "未実行"}</div>
      <div>🔢 チェック回数: ${info.checkCount}</div>
      <div>✅ アップデート: ${info.updateAvailable ? "利用可能" : "なし"}</div>
      <div>📥 進捗: ${info.downloadProgress}%</div>
      ${info.lastError ? `<div style="color: #ff6b6b;">❌ エラー: ${info.lastError}</div>` : ""}
    `
  }

  return {
    addUpdateButtons
  }
}

