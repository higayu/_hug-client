import React from 'react'
import { Database, Server, AlertCircle } from 'lucide-react'
import { useAppState } from '@/contexts/appState/AppStateContext'

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
  const { activeApi, DATABASE_TYPE } = useAppState()

  const apiType = getActiveApiType(activeApi)
  const displayType = apiType !== 'unknown' ? apiType : DATABASE_TYPE

  const isMariaDb = displayType === 'mariadb'
  const isSqlite = displayType === 'sqlite'

  const icon = isMariaDb ? (
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

  return (
    <div
      className={[
        'inline-flex items-center gap-1 rounded-md border px-2 text-xs leading-none',
        isMariaDb
          ? 'border-red-200 bg-red-50 text-red-800'
          : isSqlite
            ? 'border-blue-200 bg-blue-50 text-blue-800'
            : 'border-gray-200 bg-gray-50 text-gray-600',
        className,
      ].join(' ')}
      title={
        isMariaDb
          ? 'サーバー側APIを使用しています'
          : isSqlite
            ? 'ローカルSQLiteを使用しています'
            : 'activeApi がまだ初期化されていません'
      }
    >
      <span className="shrink-0">
        {icon}
      </span>

      <span className="font-semibold">
        {label}
      </span>

      <span className="opacity-75">
        {detail}
      </span>
    </div>
  )
}

export default ActiveApiStatus