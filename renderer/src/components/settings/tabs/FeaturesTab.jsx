function FeaturesTab() {
  return (
    <div>
      <h3 className="text-gray-700 text-lg mb-4 pb-2 border-b border-gray-200">機能の有効/無効</h3>
      <div className="mb-6">
        <label className="flex items-center gap-2 mb-3 py-2 cursor-pointer font-medium text-gray-700">
          <input type="checkbox" id="feature-individualSupportPlan" data-path="appSettings.features.individualSupportPlan.enabled" className="w-[18px] h-[18px] accent-blue-600" />
          <span>個別支援計画</span>
        </label>
        <label className="flex items-center gap-2 mb-3 py-2 cursor-pointer font-medium text-gray-700">
          <input type="checkbox" id="feature-specializedSupportPlan" data-path="appSettings.features.specializedSupportPlan.enabled" className="w-[18px] h-[18px] accent-blue-600" />
          <span>専門的支援計画</span>
        </label>
        <label className="flex items-center gap-2 mb-3 py-2 cursor-pointer font-medium text-gray-700">
          <input type="checkbox" id="feature-importSetting" data-path="appSettings.features.importSetting.enabled" className="w-[18px] h-[18px] accent-blue-600" />
          <span>設定ファイル取得</span>
        </label>
        <label className="flex items-center gap-2 mb-3 py-2 cursor-pointer font-medium text-gray-700">
          <input type="checkbox" id="feature-getUrl" data-path="appSettings.features.getUrl.enabled" className="w-[18px] h-[18px] accent-blue-600" />
          <span>URL取得</span>
        </label>
        <label className="flex items-center gap-2 mb-3 py-2 cursor-pointer font-medium text-gray-700">
          <input type="checkbox" id="feature-loadIni" data-path="appSettings.features.loadIni.enabled" className="w-[18px] h-[18px] accent-blue-600" />
          <span>設定の再読み込み</span>
        </label>
      </div>

      <h3 className="text-gray-700 text-lg mb-4 pb-2 border-b border-gray-200">ボタンテキスト設定</h3>
      <div className="mb-6">
        <div className="flex items-center mb-3 py-2">
          <label htmlFor="text-individualSupportPlan" className="font-medium text-gray-700 min-w-[120px]">個別支援計画:</label>
          <input type="text" id="text-individualSupportPlan" data-path="appSettings.features.individualSupportPlan.buttonText" className="px-3 py-2 border border-gray-300 rounded-md text-sm transition-all flex-1 max-w-[200px] focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200" />
        </div>
        <div className="flex items-center mb-3 py-2">
          <label htmlFor="text-specializedSupportPlan" className="font-medium text-gray-700 min-w-[120px]">専門的支援計画:</label>
          <input type="text" id="text-specializedSupportPlan" data-path="appSettings.features.specializedSupportPlan.buttonText" className="px-3 py-2 border border-gray-300 rounded-md text-sm transition-all flex-1 max-w-[200px] focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200" />
        </div>
        <div className="flex items-center mb-3 py-2">
          <label htmlFor="text-loadIni" className="font-medium text-gray-700 min-w-[120px]">設定の再読み込み:</label>
          <input type="text" id="text-loadIni" data-path="appSettings.features.loadIni.buttonText" className="px-3 py-2 border border-gray-300 rounded-md text-sm transition-all flex-1 max-w-[200px] focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200" />
        </div>
      </div>

      <h3 className="text-gray-700 text-lg mb-4 pb-2 border-b border-gray-200">ボタンカラー設定</h3>
      <div className="mb-6">
        <div className="flex items-center mb-3 py-2">
          <label htmlFor="color-individualSupportPlan" className="font-medium text-gray-700 min-w-[120px]">個別支援計画:</label>
          <input type="color" id="color-individualSupportPlan" data-path="appSettings.features.individualSupportPlan.buttonColor" className="w-[50px] h-10 border-none rounded-md cursor-pointer" />
        </div>
        <div className="flex items-center mb-3 py-2">
          <label htmlFor="color-specializedSupportPlan" className="font-medium text-gray-700 min-w-[120px]">専門的支援計画:</label>
          <input type="color" id="color-specializedSupportPlan" data-path="appSettings.features.specializedSupportPlan.buttonColor" className="w-[50px] h-10 border-none rounded-md cursor-pointer" />
        </div>
        <div className="flex items-center mb-3 py-2">
          <label htmlFor="color-loadIni" className="font-medium text-gray-700 min-w-[120px]">設定の再読み込み:</label>
          <input type="color" id="color-loadIni" data-path="appSettings.features.loadIni.buttonColor" className="w-[50px] h-10 border-none rounded-md cursor-pointer" />
        </div>
      </div>

      <h3 className="text-gray-700 text-lg mb-4 pb-2 border-b border-gray-200">現在のURL</h3>
      <div className="mb-6 hidden" id="current-url-container">
        <div className="flex items-center mb-3 py-2 w-full">
          <label htmlFor="current-webview-url" className="font-medium text-gray-700 min-w-[120px]">アクティブWebViewのURL:</label>
          <input type="text" id="current-webview-url" readOnly className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm flex-1" placeholder="URLを取得中..." />
        </div>
      </div>
    </div>
  )
}

export default FeaturesTab

