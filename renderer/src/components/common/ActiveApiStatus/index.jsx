import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import {
  Database,
  Server,
  AlertCircle,
  Loader2,
  RefreshCw,
} from 'lucide-react'
import { useAppState } from '@/contexts/appState/AppStateContext'
import {
  checkMariaDbConnection,
  switchDatabaseType,
} from '@/hooks/useDataBase/checkMariaDbConnection'

function getActiveApiType(activeApi) {
  if (!activeApi) return 'unknown'

  if (typeof activeApi === 'string') {
    return activeApi
  }

  if (typeof activeApi === 'object') {
    return (
      activeApi.type ||
      activeApi.databaseType ||
      activeApi.dbType ||
      activeApi.name ||
      'unknown'
    )
  }

  return 'unknown'
}

const ActiveApiStatus = ({ className = '' }) => {
  const dispatch = useDispatch()
  const { activeApi, DATABASE_TYPE } = useAppState()

  const [switching, setSwitching] = useState(false)
  const [lastMessage, setLastMessage] = useState('')

  const apiType = getActiveApiType(activeApi)
  const displayType = apiType !== 'unknown' ? apiType : DATABASE_TYPE

  const isMariaDb = displayType === 'mariadb'
  const isSqlite = displayType === 'sqlite'

  const icon = switching ? (
    <Loader2 size={10} className="animate-spin" />
  ) : isMariaDb ? (
    <Server size={10} />
  ) : isSqlite ? (
    <Database size={10} />
  ) : (
    <AlertCircle size={10} />
  )

  const label = isMariaDb
    ? 'MariaDB'
    : isSqlite
      ? 'SQLite'
      : 'DB未確定'

  const detail = isMariaDb
    ? '接続モード'
    : isSqlite
      ? '非常用モード'
      : '未初期化'

  const nextLabel = isMariaDb ? 'SQLiteへ切替' : 'MariaDBへ切替'

  const handleToggleDatabaseType = async () => {
    if (switching) return

    setSwitching(true)
    setLastMessage('')

    try {
      // MariaDB → SQLite は接続確認不要で即切替
      if (isMariaDb) {
        await switchDatabaseType({
          dispatch,
          databaseType: 'sqlite',
          message: '手動で SQLite に切り替えました',
          persistIni: true,
        })

        setLastMessage('SQLite に切り替えました')
        return
      }

      // SQLite / 未確定 → MariaDB は接続確認してから切替
      const result = await checkMariaDbConnection(dispatch, {
        autoFallbackToSqlite: true,
        switchToMariaDbOnSuccess: true,
        persistIni: true,
      })

      setLastMessage(
        result?.message ||
          (result?.connected
            ? 'MariaDB に切り替えました'
            : 'MariaDB に接続できませんでした')
      )
    } catch (error) {
      console.error('[ActiveApiStatus] DB切替エラー:', error)
      setLastMessage(error?.message || 'DB切替に失敗しました')
    } finally {
      setSwitching(false)
    }
  }

  const titleText = [
    isMariaDb
      ? 'サーバー側APIを使用しています'
      : isSqlite
        ? 'ローカルSQLiteを使用しています'
        : 'activeApi がまだ初期化されていません',
    `現在: ${label}`,
    `操作: ${nextLabel}`,
    lastMessage ? `結果: ${lastMessage}` : null,
  ]
    .filter(Boolean)
    .join('\n')

  return (
    <button
      type="button"
      onClick={handleToggleDatabaseType}
      disabled={switching}
      className={[
        'inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs leading-none transition',
        'disabled:cursor-not-allowed disabled:opacity-70',
        isMariaDb
          ? 'border-red-200 bg-red-50 text-red-800 hover:bg-red-100'
          : isSqlite
            ? 'border-blue-200 bg-blue-50 text-blue-800 hover:bg-blue-100'
            : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100',
        className,
      ].join(' ')}
      title={titleText}
      aria-label={titleText}
    >
      <span className="shrink-0">
        {icon}
      </span>

      <span className="font-semibold">
        {label}
      </span>

      <span className="opacity-75">
        {switching ? '切替中...' : detail}
      </span>

      <RefreshCw size={10} className="ml-1 opacity-70" />
    </button>
  )
}

export default ActiveApiStatus