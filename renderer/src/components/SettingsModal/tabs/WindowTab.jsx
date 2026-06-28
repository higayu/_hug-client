function WindowTab() {
  return (
    <div>
      <h3 className="text-gray-700 text-lg mb-4 pb-2 border-b border-gray-200">ウィンドウ設定</h3>
      <div className="mb-6">
        <div className="flex items-center mb-3 py-2">
          <label htmlFor="window-width" className="font-medium text-gray-700 min-w-[120px]">幅:</label>
          <input type="number" id="window-width" data-path="appSettings.window.width" min="800" className="px-3 py-2 border border-gray-300 rounded-md text-sm transition-all flex-1 max-w-[200px] focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200" />
        </div>
        <div className="flex items-center mb-3 py-2">
          <label htmlFor="window-height" className="font-medium text-gray-700 min-w-[120px]">高さ:</label>
          <input type="number" id="window-height" data-path="appSettings.window.height" min="600" className="px-3 py-2 border border-gray-300 rounded-md text-sm transition-all flex-1 max-w-[200px] focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200" />
        </div>
        <label className="flex items-center gap-2 mb-3 py-2 cursor-pointer font-medium text-gray-700">
          <input type="checkbox" id="window-maximized" data-path="appSettings.window.maximized" className="w-[18px] h-[18px] accent-blue-600" />
          <span>最大化で起動</span>
        </label>
        <label className="flex items-center gap-2 mb-3 py-2 cursor-pointer font-medium text-gray-700">
          <input type="checkbox" id="window-always-on-top" data-path="appSettings.window.alwaysOnTop" className="w-[18px] h-[18px] accent-blue-600" />
          <span>常に最前面</span>
        </label>
      </div>
    </div>
  )
}

export default WindowTab

