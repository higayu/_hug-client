// AppStateContext/useAppInitializer/index.js

import { loadConfig } from '@/utils/config/configUtils'
import { loadIni, loadPrompt } from '@/utils/config/iniUtils'
import { updateAppState, setPrompts } from '@/store/slices/appStateSlice'

/**
 * AppState 初期化
 *
 * 方針:
 * - config.json / ini.json / prompt を読み込む
 * - 読み込んだ値はすべて Redux(appStateSlice) に反映する
 * - activeApi は使わない
 * - DATABASE_TYPE を正本にする
 *
 * @param {Object} params
 * @param {Function} params.dispatch Redux dispatch
 * @param {Function} params.setIsInitialized 初期化完了フラグ setter
 * @returns {Promise<{ ini: Object | null }>}
 */
export async function initializeAppState({
  dispatch,
  setIsInitialized,
}) {
  const merged = {}

  try {
    console.log('🚀 [initializeAppState] 初期化開始')

    // =============================================================
    // 1) ファイル読み込み
    // =============================================================
    const config = await loadConfig()
    const ini = await loadIni()
    const prompts = await loadPrompt()

    console.log('📄 [initializeAppState] config:', config)
    console.log('📄 [initializeAppState] ini:', ini)
    console.log('📄 [initializeAppState] prompts:', prompts)

    // =============================================================
    // 2) config.json → Redux
    // 存在するものだけ反映する
    // =============================================================

    // HUG 認証情報
    if (config?.HUG_USERNAME !== undefined) {
      merged.HUG_USERNAME = config.HUG_USERNAME
    }

    if (config?.HUG_PASSWORD !== undefined) {
      merged.HUG_PASSWORD = config.HUG_PASSWORD
    }

    // Gemini
    if (config?.GEMINI_API_KEY !== undefined) {
      merged.GEMINI_API_KEY = config.GEMINI_API_KEY
    }

    if (config?.GEMINI_MODEL !== undefined) {
      merged.GEMINI_MODEL = config.GEMINI_MODEL
    }

    // OpenRouter
    if (config?.OPEN_ROUTER_API_KEY !== undefined) {
      merged.OPEN_ROUTER_API_KEY = config.OPEN_ROUTER_API_KEY
    }

    if (config?.OPEN_ROUTER_MODEL !== undefined) {
      merged.OPEN_ROUTER_MODEL = config.OPEN_ROUTER_MODEL
    }

    // DeepSeek
    if (config?.DEEPSEEK_MAIL !== undefined) {
      merged.DEEPSEEK_MAIL = config.DEEPSEEK_MAIL
    }

    if (config?.DEEPSEEK_PASSWORD !== undefined) {
      merged.DEEPSEEK_PASSWORD = config.DEEPSEEK_PASSWORD
    }

    // OpenAI
    if (config?.OPENAI_MAIL !== undefined) {
      merged.OPENAI_MAIL = config.OPENAI_MAIL
    }

    if (config?.OPENAI_PASSWORD !== undefined) {
      merged.OPENAI_PASSWORD = config.OPENAI_PASSWORD
    }

    // Ollama
    if (config?.OLLAMA_URL !== undefined) {
      merged.OLLAMA_URL = config.OLLAMA_URL
    }

    if (config?.OLLAMA_MODEL !== undefined) {
      merged.OLLAMA_MODEL = config.OLLAMA_MODEL
    }

    // 日付情報
    if (config?.CURRENT_DAY_OF_WEEK !== undefined) {
      merged.CURRENT_DAY_OF_WEEK = config.CURRENT_DAY_OF_WEEK
    }

    // =============================================================
    // 3) ini.json → Redux
    // =============================================================
    const apiSettings = ini?.apiSettings ?? {}

    merged.DATABASE_TYPE = apiSettings.databaseType || 'sqlite'
    merged.USE_AI = apiSettings.useAI || 'gemini'

    if (apiSettings.staffId != null) {
      merged.STAFF_ID = String(apiSettings.staffId)
    }

    if (apiSettings.facilityId != null) {
      merged.FACILITY_ID = String(apiSettings.facilityId)
    }

    if (apiSettings.debugFlg != null) {
      merged.DEBUG_FLG =
        apiSettings.debugFlg === true || apiSettings.debugFlg === 'true'
    }

    if (apiSettings.baseURL !== undefined) {
      merged.VITE_API_BASE_URL = apiSettings.baseURL || ''
    }

    // =============================================================
    // 4) Redux 反映
    // =============================================================
    console.log('📤 [initializeAppState] updateAppState:', merged)

    dispatch(updateAppState(merged))

    console.log('📤 [initializeAppState] setPrompts:', prompts || {})

    dispatch(setPrompts(prompts || {}))

    // =============================================================
    // 5) 初期化完了
    // =============================================================
    setIsInitialized(true)

    console.log('✅ [initializeAppState] 初期化完了')

    return { ini }
  } catch (error) {
    console.error('❌ [initializeAppState] 初期化エラー:', error)

    // 初期化に失敗してもアプリを完全停止させない
    setIsInitialized(true)

    return { ini: null }
  }
}