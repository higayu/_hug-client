function ApiTab({ onSaveApiSettings, onReloadApiSettings, onInitializeSelectBoxes }) {
  // 再読み込みボタンのハンドラー
  const handleReload = async () => {
    if (onReloadApiSettings) {
      await onReloadApiSettings()
    }
  }

  // 保存ボタンのハンドラー
  const handleSave = async () => {
    if (onSaveApiSettings) {
      await onSaveApiSettings()
    }
  }

  return (
    <div>
      <h3 className="text-gray-700 text-lg mb-4 pb-2 border-b border-gray-200">API設定 (ini.json)</h3>
      <div className="mb-6">
        <div className="flex items-center mb-3 py-2">
          <label htmlFor="api-base-url" className="font-medium text-gray-700 min-w-[120px]">APIベースURL:</label>
          <input type="text" id="api-base-url" data-path="apiSettings.baseURL" className="px-3 py-2 border border-gray-300 rounded-md text-sm transition-all flex-1 max-w-[200px] focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200" />
        </div>
        <div className="flex items-center mb-3 py-2">
          <label htmlFor="api-staff-id" className="font-medium text-gray-700 min-w-[120px]">スタッフ:</label>
          <select id="api-staff-id" data-path="apiSettings.staffId" className="px-3 py-2 border border-gray-300 rounded-md text-sm transition-all flex-1 max-w-[200px] focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200">
            <option value="">選択してください</option>
          </select>
        </div>
        <div className="flex items-center mb-3 py-2">
          <label htmlFor="api-facility-id" className="font-medium text-gray-700 min-w-[120px]">施設:</label>
          <select id="api-facility-id" data-path="apiSettings.facilityId" className="px-3 py-2 border border-gray-300 rounded-md text-sm transition-all flex-1 max-w-[200px] focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200">
            <option value="">選択してください</option>
          </select>
        </div>
        <div className="flex items-center mb-3 py-2">
          <label htmlFor="api-database-type" className="font-medium text-gray-700 min-w-[120px]">データベースタイプ:</label>
          <select id="api-database-type" data-path="apiSettings.databaseType" className="px-3 py-2 border border-gray-300 rounded-md text-sm transition-all flex-1 max-w-[200px] focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200">
            <option value="sqlite">SQLite</option>
            <option value="mariadb">MariaDB</option>
          </select>
        </div>
      </div>
      <div className="mb-6 flex gap-2.5">
        <button id="reload-api-settings" onClick={handleReload} className="bg-gray-600 text-white border-none px-5 py-2.5 rounded-md cursor-pointer font-medium transition-all duration-200 hover:bg-gray-700 hover:-translate-y-0.5">API設定を再読み込み</button>
        <button id="save-api-settings" onClick={handleSave} className="bg-gradient-to-r from-blue-600 to-blue-700 text-white border-none px-5 py-2.5 rounded-md cursor-pointer font-medium transition-all duration-200 hover:from-blue-700 hover:to-blue-800 hover:-translate-y-0.5 hover:shadow-lg">API設定を保存</button>
      </div>
    </div>
  )
}

export default ApiTab

