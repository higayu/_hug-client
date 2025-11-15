// renderer/src/components/settings/tabs/ConfigTab.jsx
// renderer/src/hooks/useSettingsModalLogic.js からデータ操作を行っている
function ConfigTab({ onSaveConfig, onReloadConfig, onTogglePassword }) {
  // 再読み込みボタンのハンドラー
  const handleReload = async () => {
    if (onReloadConfig) {
      await onReloadConfig()
    }
  }

  // 保存ボタンのハンドラー
  const handleSave = async () => {
    if (onSaveConfig) {
      await onSaveConfig()
    }
  }

  return (
    <div>
      <h3 className="text-gray-700 text-lg mb-4 pb-2 border-b border-gray-200">
        Config.json設定
      </h3>

      <div className="mb-6">
        {/* HUGユーザー名 */}
        <div className="flex items-center mb-3 py-2">
          <label
            htmlFor="config-username"
            className="font-medium text-gray-700 min-w-[120px]"
          >
            HUGユーザー名:
          </label>
          <input
            type="text"
            id="config-username"
            data-path="HUG_USERNAME"
            className="px-3 py-2 border border-gray-300 rounded-md text-sm transition-all flex-1 max-w-[200px] focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
          />
        </div>

        {/* HUGパスワード */}
        <div className="flex items-center mb-3 py-2">
          <label
            htmlFor="config-password"
            className="font-medium text-gray-700 min-w-[120px]"
          >
            HUGパスワード:
          </label>
          <div className="relative flex items-center w-full flex-1 max-w-[200px]">
            <input
              type="password"
              id="config-password"
              data-path="HUG_PASSWORD"
              className="w-full flex-1 pr-10 px-3 py-2 border border-gray-300 rounded-md text-sm transition-all focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
            />
            <button
              type="button"
              id="toggle-password"
              onClick={onTogglePassword}
              className="absolute right-2 bg-transparent border-none cursor-pointer text-base p-1 rounded transition-colors hover:bg-gray-100"
            >
              👁️
            </button>
          </div>
        </div>

        {/* GEMINI API KEY の追加項目 */}
        <div className="flex items-center mb-3 py-2">
          <label
            htmlFor="config-gemini"
            className="font-medium text-gray-700 min-w-[120px]"
          >
            GEMINI API Key:
          </label>
          <input
            type="text"
            id="config-gemini"
            data-path="GEMINI_API_KEY"
            className="px-3 py-2 border border-gray-300 rounded-md text-sm transition-all flex-1 max-w-[200px] focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
          />
        </div>
      </div>

      <div className="mb-6 flex gap-2.5">
        <button
          id="reload-config"
          onClick={handleReload}
          className="bg-gray-600 text-white border-none px-5 py-2.5 rounded-md cursor-pointer font-medium transition-all duration-200 hover:bg-gray-700 hover:-translate-y-0.5"
        >
          Config.jsonを再読み込み
        </button>
        <button
          id="save-config"
          onClick={handleSave}
          className="bg-gradient-to-r from-blue-600 to-blue-700 text-white border-none px-5 py-2.5 rounded-md cursor-pointer font-medium transition-all duration-200 hover:from-blue-700 hover:to-blue-800 hover:-translate-y-0.5 hover:shadow-lg"
        >
          Config.jsonを保存
        </button>
      </div>
    </div>
  )
}

export default ConfigTab
