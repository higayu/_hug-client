function UITab() {
  return (
    <div>
      <h3 className="text-gray-700 text-lg mb-4 pb-2 border-b border-gray-200">UI設定</h3>
      <div className="mb-6">
        <div className="flex items-center mb-3 py-2">
          <label htmlFor="theme-select" className="font-medium text-gray-700 min-w-[120px]">テーマ:</label>
          <select id="theme-select" data-path="appSettings.ui.theme" className="px-3 py-2 border border-gray-300 rounded-md text-sm transition-all flex-1 max-w-[200px] focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200">
            <option value="light">ライト</option>
            <option value="dark">ダーク</option>
          </select>
        </div>
        <div className="flex items-center mb-3 py-2">
          <label htmlFor="language-select" className="font-medium text-gray-700 min-w-[120px]">言語:</label>
          <select id="language-select" data-path="appSettings.ui.language" className="px-3 py-2 border border-gray-300 rounded-md text-sm transition-all flex-1 max-w-[200px] focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200">
            <option value="ja">日本語</option>
            <option value="en">English</option>
          </select>
        </div>
        <label className="flex items-center gap-2 mb-3 py-2 cursor-pointer font-medium text-gray-700">
          <input type="checkbox" id="show-close-buttons" data-path="appSettings.ui.showCloseButtons" className="w-[18px] h-[18px] accent-blue-600" />
          <span>閉じるボタンを表示</span>
        </label>
        <label className="flex items-center gap-2 mb-3 py-2 cursor-pointer font-medium text-gray-700">
          <input type="checkbox" id="auto-refresh" data-path="appSettings.ui.autoRefresh.enabled" className="w-[18px] h-[18px] accent-blue-600" />
          <span>自動リフレッシュ</span>
        </label>
        <div className="flex items-center mb-3 py-2">
          <label htmlFor="refresh-interval" className="font-medium text-gray-700 min-w-[120px]">リフレッシュ間隔 (秒):</label>
          <input type="number" id="refresh-interval" data-path="appSettings.ui.autoRefresh.interval" min="10" max="300" className="px-3 py-2 border border-gray-300 rounded-md text-sm transition-all flex-1 max-w-[200px] focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200" />
        </div>
        <label className="flex items-center gap-2 mb-3 py-2 cursor-pointer font-medium text-gray-700">
          <input type="checkbox" id="confirm-on-close" data-path="appSettings.ui.confirmOnClose" className="w-[18px] h-[18px] accent-blue-600" />
          <span>ウインドウを閉じる時 確認ダイアログを表示</span>
        </label>
      </div>
    </div>
  )
}

export default UITab

