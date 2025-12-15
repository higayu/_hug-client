// contexts/appState/useAppInitializer.js
import { loadConfig } from '@/utils/configUtils'
import { loadIni, loadPrompt } from '@/utils/iniUtils'
import { updateAppState, setPrompts } from '@/store/slices/appStateSlice'

export async function initializeAppState({
  dispatch,
  resolveApiByDatabaseType,
  setActiveApi,
  setIsInitialized,
}) {
  try {
    const merged = {}

    // ===== ファイル読み込み =====
    const config = await loadConfig()
    const ini = await loadIni()
    const prompts = await loadPrompt()

    // ===== config.json → Redux =====
    if (config?.HUG_USERNAME) merged.HUG_USERNAME = config.HUG_USERNAME
    if (config?.HUG_PASSWORD) merged.HUG_PASSWORD = config.HUG_PASSWORD
    if (config?.GEMINI_API_KEY) merged.GEMINI_API_KEY = config.GEMINI_API_KEY

    // ===== ini.json → Context & Redux =====
    if (ini?.apiSettings) {
      const s = ini.apiSettings

      // ★ APIクライアントは Context のみ
      const api = resolveApiByDatabaseType(s.databaseType)
      setActiveApi(api)

      // ★ Redux には「状態」だけ
      merged.DATABASE_TYPE = s.databaseType ?? 'sqlite'
      merged.USE_AI = s.useAI ?? 'gemini'
      merged.STAFF_ID = s.staffId != null ? String(s.staffId) : ''
      merged.FACILITY_ID = s.facilityId != null ? String(s.facilityId) : ''
    }

    // ===== Redux 反映 =====
    dispatch(updateAppState(merged))
    dispatch(setPrompts(prompts || {}))
  } finally {
    setIsInitialized(true)
  }
}
