// contexts/appState/useActiveApi.js
import { useState } from 'react'
import { sqliteApi } from '@/sql/sqliteApi'
import { mariadbApi } from '@/sql/mariadbApi'

export function useActiveApi() {
  const [activeApi, setActiveApi] = useState(null)

  const resolveApiByDatabaseType = (type = 'sqlite') =>
    type === 'mariadb' ? mariadbApi : sqliteApi

  return { activeApi, setActiveApi, resolveApiByDatabaseType }
}
