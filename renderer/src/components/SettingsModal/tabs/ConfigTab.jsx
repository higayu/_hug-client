// renderer/src/components/SettingsModal/tabs/ConfigTab.jsx

import ToggleContainer from "@/components/ui/ToggleContainer";

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
        <div className="rounded-lg bg-slate-50 border border-gray-500 p-2 mb-2">
          <label className="font-bold">【 ログイン用データ 】</label>
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
                onClick={() => onTogglePassword ? onTogglePassword('config-password', 'toggle-password') : null}
                className="absolute right-2 bg-transparent border-none cursor-pointer text-base p-1 rounded transition-colors hover:bg-gray-100"
              >
                👁️
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col rounded-lg bg-slate-50 border border-gray-500 gap-2 p-2 mb-2">
          <label className="font-bold">【 AIの設定 】</label>
          <ToggleContainer buttonLabel="OpenAI">
            {/* OpenAI  */}
            <div>
              {/* OpenAI メールアドレス */}
              <div className="flex items-center mb-3 py-2">
                <label
                  htmlFor="config-openai-mail"
                  className="font-medium text-gray-700 min-w-[120px]"
                >
                  OpenAIメールアドレス:
                </label>
                <input
                  type="text"
                  id="config-openai-mail"
                  data-path="OPENAI_MAIL"
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm transition-all flex-1 max-w-[200px] focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
                />
              </div>

              {/* OpenAI パスワード */}
              <div className="flex items-center mb-3 py-2">
                <label
                  htmlFor="config-openai-password"
                  className="font-medium text-gray-700 min-w-[120px]"
                >
                  OpenAIパスワード:
                </label>
                <div className="relative flex items-center w-full flex-1 max-w-[200px]">
                  <input
                    type="password"
                    id="config-openai-password"
                    data-path="OPENAI_PASSWORD"
                    className="w-full flex-1 pr-10 px-3 py-2 border border-gray-300 rounded-md text-sm transition-all focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
                  />
                  <button
                    type="button"
                    id="toggle-openai-password"
                    onClick={() => onTogglePassword ? onTogglePassword('config-openai-password', 'toggle-openai-password') : null}
                    className="absolute right-2 bg-transparent border-none cursor-pointer text-base p-1 rounded transition-colors hover:bg-gray-100"
                  >
                    👁️
                  </button>
                </div>
              </div>
            </div>
          </ToggleContainer>

          <ToggleContainer buttonLabel="Gemini">
            {/* GEMINI API KEY の追加項目 */}
            <div>
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

              <div className="flex items-center mb-3 py-2">
                <label
                  htmlFor="config-gemini-model"
                  className="font-medium text-gray-700 min-w-[120px]"
                >
                  GEMINI Model:
                </label>
                <input
                  type="text"
                  id="config-gemini-model"
                  data-path="GEMINI_MODEL"
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm transition-all flex-1 max-w-[200px] focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
                />
              </div>
            </div>
          </ToggleContainer>

          <ToggleContainer buttonLabel="DeepSeek">
            {/* DeepSeek  */}
            <div>
              {/* DeepSeekメールアドレス */}
              <div className="flex items-center mb-3 py-2">
                <label
                  htmlFor="config-deepseek-mail"
                  className="font-medium text-gray-700 min-w-[120px]"
                >
                  Deepseekメールアドレス:
                </label>
                <input
                  type="text"
                  id="config-deepseek-mail"
                  data-path="DEEPSEEK_MAIL"
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm transition-all flex-1 max-w-[200px] focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
                />
              </div>

              {/* Deepseek パスワード */}
              <div className="flex items-center mb-3 py-2">
                <label
                  htmlFor="config-deepseek-password"
                  className="font-medium text-gray-700 min-w-[120px]"
                >
                  Deepseekパスワード:
                </label>
                <div className="relative flex items-center w-full flex-1 max-w-[200px]">
                  <input
                    type="password"
                    id="config-deepseek-password"
                    data-path="DEEPSEEK_PASSWORD"
                    className="w-full flex-1 pr-10 px-3 py-2 border border-gray-300 rounded-md text-sm transition-all focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
                  />
                  <button
                    type="button"
                    id="toggle-deepseek-password"
                    onClick={() => onTogglePassword ? onTogglePassword('config-deepseek-password', 'toggle-deepseek-password') : null}
                    className="absolute right-2 bg-transparent border-none cursor-pointer text-base p-1 rounded transition-colors hover:bg-gray-100"
                  >
                    👁️
                  </button>
                </div>
              </div>
            </div>
          </ToggleContainer>

          <ToggleContainer buttonLabel="Open-Router">
            {/* OPEN_ROUTER_API_KEY の追加項目 */}
            <div>
              <div className="flex items-center mb-3 py-2">
                <label
                  htmlFor="config-openrouter-key"
                  className="font-medium text-gray-700 min-w-[120px]"
                >
                  OpenRouter API Key:
                </label>
                <input
                  type="text"
                  id="config-openrouter-key"
                  data-path="OPEN_ROUTER_API_KEY"
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm transition-all flex-1 max-w-[200px] focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <div className="flex items-center mb-3 py-2">
                <label
                  htmlFor="config-openrouter-model"
                  className="font-medium text-gray-700 min-w-[120px]"
                >
                  OpenRouter Model:
                </label>
                <input
                  type="text"
                  id="config-openrouter-model"
                  data-path="OPEN_ROUTER_MODEL"
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm transition-all flex-1 max-w-[200px] focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
                />
              </div>
            </div>
          </ToggleContainer>
          
          <ToggleContainer buttonLabel="Ollama">
            {/* Ollama の追加項目 */}
            <div>
              <div className="flex items-center mb-3 py-2">
                <label
                  htmlFor="config-ollama-url"
                  className="font-medium text-gray-700 min-w-[120px]"
                >
                  Ollama URL:
                </label>
                <input
                  type="text"
                  id="config-ollama-url"
                  data-path="OLLAMA_URL"
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm transition-all flex-1 max-w-[200px] focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
                />
              </div>
              <div className="flex items-center mb-3 py-2">
                <label
                  htmlFor="config-ollama-model"
                  className="font-medium text-gray-700 min-w-[120px]"
                >
                  Ollama Model:
                </label>
                <input
                  type="text"
                  id="config-ollama-model"
                  data-path="OLLAMA_MODEL"
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm transition-all flex-1 max-w-[200px] focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
                />
              </div>
            </div>
          </ToggleContainer>
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
