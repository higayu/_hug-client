// renderer/src/components/Sidebar/Tools/MemoTool/Parts/AiInputBox.jsx
import React, { useState } from 'react'

export default function AiInputBox({
  value,            // AI送信内容
  onChange,         // 親へテキスト変更通知
  onSaveMemo        // メモ保存時の通知
}) {
  const [memo, setMemo] = useState('') // メモ内容

  // メモ変更
  const handleMemoChange = (e) => {
    setMemo(e.target.value)
  }

  // メモ保存
  const handleSaveClick = () => {
    if (onSaveMemo) onSaveMemo(memo)
  }

  return (
    <div className="flex flex-col gap-3 p-2 bg-white rounded-lg shadow-sm border border-gray-200">
      {/* AI入力欄 */}
      <div>
        <label className="text-xs font-bold text-gray-700 block mb-1">
          AIに送信するテキスト
        </label>
        <textarea
          className="w-full h-24 p-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          value={value}
          placeholder="AIに送信する内容を入力..."
          onChange={(e) => onChange(e.target.value)}
        />
      </div>

      {/* メモ欄 */}
      <div>
        <label className="text-xs font-bold text-gray-700 block mb-1">
          メモ
        </label>
        <textarea
          className="w-full p-2 border border-gray-300 rounded text-xs bg-white resize-y min-h-[100px] font-inherit text-black focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
          placeholder="メモを入力..."
          value={memo}
          onChange={handleMemoChange}
          rows={5}
        />
      </div>

      {/* 保存ボタン */}
      <button
        onClick={handleSaveClick}
        className="w-full px-3 py-1.5 bg-blue-600 text-white border-none rounded text-xs cursor-pointer hover:bg-blue-700 transition-colors"
      >
        保存
      </button>
    </div>
  )
}
