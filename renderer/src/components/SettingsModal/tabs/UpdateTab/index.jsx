import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'

import {
  checkForUpdates,
  displayUpdateInfo,
  getUpdateInfo,
} from './updateManager.js'

function UpdateTab() {
  const [updateInfo, setUpdateInfo] =
    useState(null)

  const [logs, setLogs] = useState([
    'アプリ起動中...',
  ])

  const [isChecking, setIsChecking] =
    useState(false)

  const logContainerRef = useRef(null)

  const addLog = useCallback(
    (message) => {
      const timestamp =
        new Date().toLocaleTimeString()

      const logMessage =
        `[${timestamp}] ${message}`

      setLogs((previous) => {
        const nextLogs = [
          ...previous,
          logMessage,
        ]

        return nextLogs.length > 50
          ? nextLogs.slice(-50)
          : nextLogs
      })
    },
    []
  )

  useEffect(() => {
    const container =
      logContainerRef.current

    if (!container) {
      return
    }

    container.scrollTop =
      container.scrollHeight
  }, [logs])

  const refreshUpdateInfo =
    useCallback(async () => {
      try {
        const nextUpdateInfo =
          await getUpdateInfo()

        setUpdateInfo(nextUpdateInfo)

        addLog(
          '🔄 アップデート情報を更新しました'
        )
      } catch (error) {
        console.error(
          '[UpdateTab] 情報更新エラー:',
          error
        )

        addLog(
          `❌ 情報更新エラー: ${
            error?.message || '不明なエラー'
          }`
        )
      }
    }, [addLog])

  useEffect(() => {
    refreshUpdateInfo()
  }, [refreshUpdateInfo])

  const handleManualCheck = async () => {
    if (isChecking) {
      return
    }

    setIsChecking(true)

    try {
      addLog(
        '🔄 手動アップデートチェックを開始...'
      )

      const result =
        await checkForUpdates()

      if (result) {
        addLog(
          `✅ 手動チェック完了: ${JSON.stringify(result)}`
        )
      } else {
        addLog(
          '⚠️ 手動チェック結果なし'
        )
      }

      await refreshUpdateInfo()
    } catch (error) {
      console.error(
        '[UpdateTab] 手動チェックエラー:',
        error
      )

      addLog(
        `❌ 手動チェックエラー: ${
          error?.message || '不明なエラー'
        }`
      )
    } finally {
      setIsChecking(false)
    }
  }

  const handleShowDebugConsole =
    async () => {
      try {
        const debugInfo =
          await getUpdateInfo()

        displayUpdateInfo(debugInfo)

        addLog(
          '📊 デバッグ情報をコンソールに表示しました'
        )
      } catch (error) {
        console.error(
          '[UpdateTab] デバッグ表示エラー:',
          error
        )

        addLog(
          `❌ デバッグ表示エラー: ${
            error?.message || '不明なエラー'
          }`
        )
      }
    }

  return (
    <div>
      <h3 className="mb-4 border-b border-gray-200 pb-2 text-lg text-gray-700">
        🔧 アップデートデバッグ
      </h3>

      <div className="mb-6">
        <div className="my-2.5 rounded-lg border border-gray-200 bg-gray-100 p-4">
          <InfoRow
            label="📊 現在のバージョン:"
            value={
              updateInfo?.currentVersion ||
              '読み込み中...'
            }
          />

          <InfoRow
            label="🔍 チェック中:"
            value={
              updateInfo
                ? updateInfo.isChecking
                  ? 'はい'
                  : 'いいえ'
                : '読み込み中...'
            }
          />

          <InfoRow
            label="📅 最終チェック時刻:"
            value={
              updateInfo?.lastCheckTime
                ? new Date(
                    updateInfo.lastCheckTime
                  ).toLocaleString()
                : '未実行'
            }
          />

          <InfoRow
            label="🔢 チェック回数:"
            value={
              updateInfo?.checkCount ?? 0
            }
          />

          <InfoRow
            label="✅ アップデート利用可能:"
            value={
              updateInfo
                ? updateInfo.updateAvailable
                  ? 'はい'
                  : 'いいえ'
                : '読み込み中...'
            }
          />

          <InfoRow
            label="🆕 新しいバージョン:"
            value={
              updateInfo?.newVersion ||
              'なし'
            }
          />

          <InfoRow
            label="📥 ダウンロード進捗:"
            value={
              updateInfo
                ? `${updateInfo.downloadProgress ?? 0}%`
                : '読み込み中...'
            }
          />

          {updateInfo?.lastError && (
            <InfoRow
              label="❌ 最後のエラー:"
              value={updateInfo.lastError}
            />
          )}
        </div>
      </div>

      <div className="mb-6">
        <h4 className="mb-3 font-semibold text-gray-700">
          操作
        </h4>

        <div className="my-4 flex flex-wrap gap-2.5">
          <button
            type="button"
            onClick={handleManualCheck}
            disabled={isChecking}
            className="min-w-[120px] flex-1 rounded-md bg-gradient-to-r from-blue-600 to-blue-700 px-3 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isChecking
              ? '🔄 チェック中...'
              : '🔄 手動チェック'}
          </button>

          <button
            type="button"
            onClick={
              handleShowDebugConsole
            }
            className="min-w-[120px] flex-1 rounded-md bg-gray-600 px-3 py-2 text-sm font-medium text-white"
          >
            📊 コンソール表示
          </button>

          <button
            type="button"
            onClick={refreshUpdateInfo}
            className="min-w-[120px] flex-1 rounded-md bg-gray-600 px-3 py-2 text-sm font-medium text-white"
          >
            🔄 情報更新
          </button>
        </div>
      </div>

      <div className="mb-6">
        <h4 className="mb-3 font-semibold text-gray-700">
          ログ
        </h4>

        <div
          ref={logContainerRef}
          className="max-h-[200px] overflow-y-auto rounded-md bg-gray-900 p-4 font-mono text-xs leading-snug text-white"
        >
          {logs.map((log, index) => (
            <div
              key={`${index}-${log}`}
              className="my-0.5 py-0.5 text-white"
            >
              {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function InfoRow({
  label,
  value,
}) {
  return (
    <div className="flex items-center justify-between border-b border-gray-200 py-2 font-mono text-sm last:border-b-0">
      <strong className="min-w-[180px] text-gray-700">
        {label}
      </strong>

      <span className="font-medium text-gray-600">
        {String(value)}
      </span>
    </div>
  )
}

export default UpdateTab