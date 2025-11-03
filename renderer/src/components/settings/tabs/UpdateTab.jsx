// src/components/settings/tabs/UpdateTab.jsx
// アップデートタブコンポーネント

import { useEffect, useState, useRef } from 'react'
import { getUpdateInfo, checkForUpdates, displayUpdateInfo } from '../../../utils/updateManager.js'

function UpdateTab() {
  const [updateInfo, setUpdateInfo] = useState(null)
  const [logs, setLogs] = useState(['アプリ起動中...'])
  const modalRef = useRef(null)

  // モーダル要素を取得
  useEffect(() => {
    // SettingsModal内の要素を取得するため、親要素を探す
    const modal = document.querySelector('.bg-white.m-\\[2\\%\\]')
    if (modal) {
      modalRef.current = modal
    }
  }, [])

  // 初期読み込み
  useEffect(() => {
    refreshUpdateInfo()
  }, [])

  // ログを追加
  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString()
    const logMessage = `[${timestamp}] ${message}`
    
    setLogs(prev => {
      const newLogs = [...prev, logMessage]
      // ログが50件を超える場合は古いものを削除
      if (newLogs.length > 50) {
        return newLogs.slice(-50)
      }
      return newLogs
    })

    // スクロールを最下部に移動
    setTimeout(() => {
      const logContainer = document.getElementById('update-log-container')
      if (logContainer) {
        logContainer.scrollTop = logContainer.scrollHeight
      }
    }, 100)
  }

  // アップデート情報を更新
  const refreshUpdateInfo = async () => {
    try {
      const debugInfo = await getUpdateInfo()
      setUpdateInfo(debugInfo)
      updateUpdateInfoDisplay(debugInfo)
      addLog('🔄 アップデート情報を更新しました', 'info')
    } catch (err) {
      console.error('❌ [UPDATE] 情報更新エラー:', err)
      addLog('❌ 情報更新エラー: ' + err.message, 'error')
    }
  }

  // アップデート情報表示を更新
  const updateUpdateInfoDisplay = (info) => {
    if (!info) return

    // 各要素を更新
    const elements = {
      'current-version': info.currentVersion || '不明',
      'is-checking': info.isChecking ? 'はい' : 'いいえ',
      'last-check-time': info.lastCheckTime ? new Date(info.lastCheckTime).toLocaleString() : '未実行',
      'check-count': info.checkCount || 0,
      'update-available': info.updateAvailable ? 'はい' : 'いいえ',
      'new-version': info.newVersion || 'なし',
      'download-progress': info.downloadProgress + '%'
    }

    Object.entries(elements).forEach(([id, value]) => {
      const element = document.getElementById(id)
      if (element) {
        element.textContent = value
      }
    })

    // エラー情報の表示
    const errorInfo = document.getElementById('error-info')
    const lastError = document.getElementById('last-error')
    if (info.lastError && errorInfo && lastError) {
      lastError.textContent = info.lastError
      errorInfo.style.display = 'block'
    } else if (errorInfo) {
      errorInfo.style.display = 'none'
    }
  }

  // 手動アップデートチェック
  const handleManualCheck = async () => {
    try {
      console.log('🔧 [UPDATE] 手動アップデートチェック開始')
      addLog('🔄 手動アップデートチェックを開始...', 'info')
      
      const result = await checkForUpdates()
      if (result) {
        addLog('✅ 手動チェック完了: ' + JSON.stringify(result), 'success')
      } else {
        addLog('⚠️ 手動チェック結果なし', 'warning')
      }
      
      await refreshUpdateInfo()
    } catch (err) {
      console.error('❌ [UPDATE] 手動チェックエラー:', err)
      addLog('❌ 手動チェックエラー: ' + err.message, 'error')
    }
  }

  // デバッグ情報をコンソールに表示
  const handleShowDebugConsole = async () => {
    console.log('🔧 [UPDATE] デバッグ情報をコンソールに表示')
    const debugInfo = await getUpdateInfo()
    displayUpdateInfo(debugInfo)
    addLog('📊 デバッグ情報をコンソールに表示しました', 'info')
  }

  // 自動監視の切り替え（機能削除済み）
  const handleToggleAutoMonitor = () => {
    addLog('⚠️ 自動監視機能は削除されました', 'warning')
  }

  return (
    <div>
      <h3 className="text-gray-700 text-lg mb-4 pb-2 border-b border-gray-200">🔧 アップデートデバッグ</h3>
      <div className="mb-6">
        <div id="update-debug-info" className="bg-gray-100 border border-gray-200 rounded-lg p-4 my-2.5">
          <div className="flex justify-between items-center py-2 border-b border-gray-200 font-mono text-sm last:border-b-0">
            <strong className="text-gray-700 min-w-[180px]">📊 現在のバージョン:</strong> 
            <span id="current-version" className="text-gray-600 font-medium">
              {updateInfo?.currentVersion || '読み込み中...'}
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-200 font-mono text-sm last:border-b-0">
            <strong className="text-gray-700 min-w-[180px]">🔍 チェック中:</strong> 
            <span id="is-checking" className="text-gray-600 font-medium">
              {updateInfo ? (updateInfo.isChecking ? 'はい' : 'いいえ') : '読み込み中...'}
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-200 font-mono text-sm last:border-b-0">
            <strong className="text-gray-700 min-w-[180px]">📅 最終チェック時刻:</strong> 
            <span id="last-check-time" className="text-gray-600 font-medium">
              {updateInfo?.lastCheckTime ? new Date(updateInfo.lastCheckTime).toLocaleString() : '未実行'}
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-200 font-mono text-sm last:border-b-0">
            <strong className="text-gray-700 min-w-[180px]">🔢 チェック回数:</strong> 
            <span id="check-count" className="text-gray-600 font-medium">
              {updateInfo?.checkCount || 0}
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-200 font-mono text-sm last:border-b-0">
            <strong className="text-gray-700 min-w-[180px]">✅ アップデート利用可能:</strong> 
            <span id="update-available" className="text-gray-600 font-medium">
              {updateInfo ? (updateInfo.updateAvailable ? 'はい' : 'いいえ') : '読み込み中...'}
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-200 font-mono text-sm last:border-b-0">
            <strong className="text-gray-700 min-w-[180px]">🆕 新しいバージョン:</strong> 
            <span id="new-version" className="text-gray-600 font-medium">
              {updateInfo?.newVersion || 'なし'}
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-200 font-mono text-sm last:border-b-0">
            <strong className="text-gray-700 min-w-[180px]">📥 ダウンロード進捗:</strong> 
            <span id="download-progress" className="text-gray-600 font-medium">
              {updateInfo ? `${updateInfo.downloadProgress}%` : '読み込み中...'}
            </span>
          </div>
          {updateInfo?.lastError && (
            <div 
              className="flex justify-between items-center py-2 border-b border-gray-200 font-mono text-sm last:border-b-0"
              id="error-info"
            >
              <strong className="text-gray-700 min-w-[180px]">❌ 最後のエラー:</strong> 
              <span id="last-error" className="text-gray-600 font-medium">
                {updateInfo.lastError}
              </span>
            </div>
          )}
          {!updateInfo?.lastError && (
            <div id="error-info" className="hidden"></div>
          )}
        </div>
      </div>
      
      <div className="mb-6">
        <h4 className="text-gray-700 font-semibold mb-3">操作</h4>
        <div className="flex gap-2.5 flex-wrap my-4">
          <button 
            id="manual-check-update"
            onClick={handleManualCheck}
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white border-none flex-1 min-w-[120px] px-3 py-2 text-sm rounded-md cursor-pointer font-medium transition-all duration-200 hover:from-blue-700 hover:to-blue-800 hover:-translate-y-0.5 hover:shadow-lg"
          >
            🔄 手動チェック
          </button>
          <button 
            id="show-debug-console"
            onClick={handleShowDebugConsole}
            className="bg-gray-600 text-white border-none flex-1 min-w-[120px] px-3 py-2 text-sm rounded-md cursor-pointer font-medium transition-all duration-200 hover:bg-gray-700 hover:-translate-y-0.5"
          >
            📊 コンソール表示
          </button>
          <button 
            id="toggle-auto-monitor"
            onClick={handleToggleAutoMonitor}
            className="bg-gray-600 text-white border-none flex-1 min-w-[120px] px-3 py-2 text-sm rounded-md cursor-pointer font-medium transition-all duration-200 hover:bg-gray-700 hover:-translate-y-0.5"
          >
            ⏰ 自動監視
          </button>
          <button 
            id="refresh-update-info"
            onClick={refreshUpdateInfo}
            className="bg-gray-600 text-white border-none flex-1 min-w-[120px] px-3 py-2 text-sm rounded-md cursor-pointer font-medium transition-all duration-200 hover:bg-gray-700 hover:-translate-y-0.5"
          >
            🔄 情報更新
          </button>
        </div>
      </div>

      <div className="mb-6">
        <h4 className="text-gray-700 font-semibold mb-3">ログ</h4>
        <div id="update-log-container" className="bg-gray-900 text-gray-300 rounded-md p-4 max-h-[200px] overflow-y-auto font-mono text-xs leading-snug">
          {logs.map((log, index) => (
            <div key={index} className="my-0.5 py-0.5">
              {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default UpdateTab
