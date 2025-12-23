import { loadConfig } from '@/utils/configUtils'
import { loadIni, loadPrompt } from '@/utils/iniUtils'
import { updateAppState, setPrompts } from '@/store/slices/appStateSlice'

// 旧 AppStateContext 互換の初期化フロー
export async function initializeAppState({
  dispatch,
  resolveApiByDatabaseType,
  setActiveApi,
  setIsInitialized,
}) {
  const merged = {}

  // 1) ファイル読み込み
  const config = await loadConfig()
  const ini = await loadIni()
  const prompts = await loadPrompt()

  // 2) config.json → Redux（存在するものだけ反映）
  if (config?.HUG_USERNAME !== undefined) merged.HUG_USERNAME = config.HUG_USERNAME
  if (config?.HUG_PASSWORD !== undefined) merged.HUG_PASSWORD = config.HUG_PASSWORD
  if (config?.GEMINI_API_KEY !== undefined) merged.GEMINI_API_KEY = config.GEMINI_API_KEY
  // OpenAI 用の認証情報（メール / パスワード）も appState に反映
  if (config?.OPENAI_MAIL !== undefined) merged.OPENAI_MAIL = config.OPENAI_MAIL
  if (config?.OPENAI_PASSWORD !== undefined) merged.OPENAI_PASSWORD = config.OPENAI_PASSWORD
  if (config?.CURRENT_DATE !== undefined) merged.CURRENT_DATE = config.CURRENT_DATE

  // 3) ini.json → Context & Redux
  const apiSettings = ini?.apiSettings ?? {}
  const dbType = apiSettings.databaseType ?? 'sqlite'
  const api = resolveApiByDatabaseType(dbType)
  setActiveApi(api)

  merged.DATABASE_TYPE = dbType
  merged.USE_AI = apiSettings.useAI ?? 'gemini'

  // STAFF_ID / FACILITY_ID は値があるときのみ上書き（未設定なら初期値を保持）
  if (apiSettings.staffId != null) {
    merged.STAFF_ID = String(apiSettings.staffId)
  }
  if (apiSettings.facilityId != null) {
    merged.FACILITY_ID = String(apiSettings.facilityId)
  }

  // DEBUG_FLG は文字列の"true"/"false"をbooleanに変換
  if (apiSettings.debugFlg != null) {
    merged.DEBUG_FLG = apiSettings.debugFlg === true || apiSettings.debugFlg === 'true'
  }

  // 4) Redux 反映
  dispatch(updateAppState(merged))
  dispatch(setPrompts(prompts || {}))

  // 5) 初期化完了
  setIsInitialized(true)

  // ini を返して上位で再読込を避ける
  return { ini }
}

