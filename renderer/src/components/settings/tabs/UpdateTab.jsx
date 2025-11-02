function UpdateTab() {
  return (
    <div>
      <h3 className="text-gray-700 text-lg mb-4 pb-2 border-b border-gray-200">🔧 アップデートデバッグ</h3>
      <div className="mb-6">
        <div id="update-debug-info" className="bg-gray-100 border border-gray-200 rounded-lg p-4 my-2.5">
          <div className="flex justify-between items-center py-2 border-b border-gray-200 font-mono text-sm last:border-b-0">
            <strong className="text-gray-700 min-w-[180px]">📊 現在のバージョン:</strong> <span id="current-version" className="text-gray-600 font-medium">読み込み中...</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-200 font-mono text-sm last:border-b-0">
            <strong className="text-gray-700 min-w-[180px]">🔍 チェック中:</strong> <span id="is-checking" className="text-gray-600 font-medium">読み込み中...</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-200 font-mono text-sm last:border-b-0">
            <strong className="text-gray-700 min-w-[180px]">📅 最終チェック時刻:</strong> <span id="last-check-time" className="text-gray-600 font-medium">読み込み中...</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-200 font-mono text-sm last:border-b-0">
            <strong className="text-gray-700 min-w-[180px]">🔢 チェック回数:</strong> <span id="check-count" className="text-gray-600 font-medium">読み込み中...</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-200 font-mono text-sm last:border-b-0">
            <strong className="text-gray-700 min-w-[180px]">✅ アップデート利用可能:</strong> <span id="update-available" className="text-gray-600 font-medium">読み込み中...</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-200 font-mono text-sm last:border-b-0">
            <strong className="text-gray-700 min-w-[180px]">🆕 新しいバージョン:</strong> <span id="new-version" className="text-gray-600 font-medium">読み込み中...</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-200 font-mono text-sm last:border-b-0">
            <strong className="text-gray-700 min-w-[180px]">📥 ダウンロード進捗:</strong> <span id="download-progress" className="text-gray-600 font-medium">読み込み中...</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-200 font-mono text-sm last:border-b-0 hidden" id="error-info">
            <strong className="text-gray-700 min-w-[180px]">❌ 最後のエラー:</strong> <span id="last-error" className="text-gray-600 font-medium"></span>
          </div>
        </div>
      </div>
      
      <div className="mb-6">
        <h4 className="text-gray-700 font-semibold mb-3">操作</h4>
        <div className="flex gap-2.5 flex-wrap my-4">
          <button id="manual-check-update" className="bg-gradient-to-r from-blue-600 to-blue-700 text-white border-none flex-1 min-w-[120px] px-3 py-2 text-sm rounded-md cursor-pointer font-medium transition-all duration-200 hover:from-blue-700 hover:to-blue-800 hover:-translate-y-0.5 hover:shadow-lg">🔄 手動チェック</button>
          <button id="show-debug-console" className="bg-gray-600 text-white border-none flex-1 min-w-[120px] px-3 py-2 text-sm rounded-md cursor-pointer font-medium transition-all duration-200 hover:bg-gray-700 hover:-translate-y-0.5">📊 コンソール表示</button>
          <button id="toggle-auto-monitor" className="bg-gray-600 text-white border-none flex-1 min-w-[120px] px-3 py-2 text-sm rounded-md cursor-pointer font-medium transition-all duration-200 hover:bg-gray-700 hover:-translate-y-0.5">⏰ 自動監視</button>
          <button id="refresh-update-info" className="bg-gray-600 text-white border-none flex-1 min-w-[120px] px-3 py-2 text-sm rounded-md cursor-pointer font-medium transition-all duration-200 hover:bg-gray-700 hover:-translate-y-0.5">🔄 情報更新</button>
        </div>
      </div>

      <div className="mb-6">
        <h4 className="text-gray-700 font-semibold mb-3">ログ</h4>
        <div id="update-log-container" className="bg-gray-900 text-gray-300 rounded-md p-4 max-h-[200px] overflow-y-auto font-mono text-xs leading-snug">
          <div className="my-0.5 py-0.5">アプリ起動中...</div>
        </div>
      </div>
    </div>
  )
}

export default UpdateTab

