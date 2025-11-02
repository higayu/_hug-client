import { useEffect } from 'react'

function ConfigTab({ onSaveConfig, onReloadConfig }) {
  // 再読み込みボタンのイベントリスナー
  useEffect(() => {
    const reloadBtn = document.getElementById('reload-config')
    const handleReload = async () => {
      if (onReloadConfig) {
        await onReloadConfig()
      }
    }

    if (reloadBtn) {
      reloadBtn.addEventListener('click', handleReload)
    }

    return () => {
      if (reloadBtn) {
        reloadBtn.removeEventListener('click', handleReload)
      }
    }
  }, [onReloadConfig])

  // 保存ボタンのイベントリスナー
  useEffect(() => {
    const saveBtn = document.getElementById('save-config')
    const handleSave = async () => {
      if (onSaveConfig) {
        await onSaveConfig()
      }
    }

    if (saveBtn) {
      saveBtn.addEventListener('click', handleSave)
    }

    return () => {
      if (saveBtn) {
        saveBtn.removeEventListener('click', handleSave)
      }
    }
  }, [onSaveConfig])

  return (
    <div>
      <h3 className="text-gray-700 text-lg mb-4 pb-2 border-b border-gray-200">Config.json設定</h3>
      <div className="mb-6">
        <div className="flex items-center mb-3 py-2">
          <label htmlFor="config-username" className="font-medium text-gray-700 min-w-[120px]">HUGユーザー名:</label>
          <input type="text" id="config-username" data-path="HUG_USERNAME" className="px-3 py-2 border border-gray-300 rounded-md text-sm transition-all flex-1 max-w-[200px] focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200" />
        </div>
        <div className="flex items-center mb-3 py-2">
          <label htmlFor="config-password" className="font-medium text-gray-700 min-w-[120px]">HUGパスワード:</label>
          <div className="relative flex items-center w-full flex-1 max-w-[200px]">
            <input type="password" id="config-password" data-path="HUG_PASSWORD" className="w-full flex-1 pr-10 px-3 py-2 border border-gray-300 rounded-md text-sm transition-all focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200" />
            <button type="button" id="toggle-password" className="absolute right-2 bg-transparent border-none cursor-pointer text-base p-1 rounded transition-colors hover:bg-gray-100">👁️</button>
          </div>
        </div>
        <div className="flex items-center mb-3 py-2">
          <label htmlFor="config-api-url" className="font-medium text-gray-700 min-w-[120px]">APIベースURL:</label>
          <input type="text" id="config-api-url" data-path="VITE_API_BASE_URL" className="px-3 py-2 border border-gray-300 rounded-md text-sm transition-all flex-1 max-w-[200px] focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200" />
        </div>
        <div className="flex items-center mb-3 py-2">
          <label htmlFor="config-staff-id" className="font-medium text-gray-700 min-w-[120px]">スタッフ:</label>
          <select id="config-staff-id" data-path="STAFF_ID" className="px-3 py-2 border border-gray-300 rounded-md text-sm transition-all flex-1 max-w-[200px] focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200">
            <option value="">選択してください</option>
          </select>
        </div>
        <div className="flex items-center mb-3 py-2">
          <label htmlFor="config-facility-id" className="font-medium text-gray-700 min-w-[120px]">施設:</label>
          <select id="config-facility-id" data-path="FACILITY_ID" className="px-3 py-2 border border-gray-300 rounded-md text-sm transition-all flex-1 max-w-[200px] focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200">
            <option value="">選択してください</option>
          </select>
        </div>
      </div>
      <div className="mb-6 flex gap-2.5">
        <button id="reload-config" className="bg-gray-600 text-white border-none px-5 py-2.5 rounded-md cursor-pointer font-medium transition-all duration-200 hover:bg-gray-700 hover:-translate-y-0.5">Config.jsonを再読み込み</button>
        <button id="save-config" className="bg-gradient-to-r from-blue-600 to-blue-700 text-white border-none px-5 py-2.5 rounded-md cursor-pointer font-medium transition-all duration-200 hover:from-blue-700 hover:to-blue-800 hover:-translate-y-0.5 hover:shadow-lg">Config.jsonを保存</button>
      </div>
    </div>
  )
}

export default ConfigTab

