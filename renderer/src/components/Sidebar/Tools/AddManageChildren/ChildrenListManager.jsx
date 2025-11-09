// renderer/src/components/Sidebar/Tools/AddManageChildren/index.jsx
import { useEffect, useState } from 'react'
import TableDataGetButon from './TableDataGetButon.jsx'

function ChildrenListManager() {
  useEffect(() => {
    console.log('AddManageChildren')
  }, [])

  return (
    <div>
      <h2 className="text-lg font-bold text-blue-600 mb-4">
        👶 子ども管理
      </h2>
      <p className="text-sm text-gray-600 mb-3">
        子どもデータの一覧・編集を管理します。
      </p>
      <TableDataGetButon />
    </div>

  )
}

export default ChildrenListManager
