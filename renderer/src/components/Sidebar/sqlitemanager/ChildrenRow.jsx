// renderer/src/components/Sidebar/sqlitemanager/ChildrenRow.jsx
import { useState } from 'react'

function ChildrenRow({ child }) {
  const [memo, setMemo] = useState(child.memo || '')
  const [editing, setEditing] = useState(false)

  const handleSave = () => {
    setEditing(false)
    console.log(`💾 保存: ID=${child.id}, メモ=${memo}`)
    // TODO: SQLite UPDATE 文をIPC経由で送る処理をここに追加
  }

  return (
    <tr className="border-b border-gray-200 hover:bg-blue-50 transition-colors duration-150">
      <td className="p-2 border-r border-gray-300">{child.id}</td>
      <td className="p-2 border-r border-gray-300">{child.name}</td>
      <td className="p-2 border-r border-gray-300">{child.age}</td>
      <td className="p-2 border-r border-gray-300">{child.weekday}</td>
      <td className="p-2">
        {editing ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
            />
            <button
              onClick={handleSave}
              className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
            >
              保存
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <span>{memo || '（なし）'}</span>
            <button
              onClick={() => setEditing(true)}
              className="ml-2 text-xs text-blue-600 hover:underline"
            >
              編集
            </button>
          </div>
        )}
      </td>
    </tr>
  )
}

export default ChildrenRow
