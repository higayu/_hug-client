// contexts/appState/useReduxBindings.js
import { useSelector, shallowEqual } from 'react-redux'
import * as s from '@/store/slices/appStateSlice'

export function useReduxBindings() {
  // ✅ appState 全体（必要な場合のみ）
  const appState = useSelector(s.selectAppState, shallowEqual)

  // =========================
  // primitives
  // =========================
  const HUG_USERNAME = useSelector(s.selectHugUsername)
  const HUG_PASSWORD = useSelector(s.selectHugPassword)
  const GEMINI_API_KEY = useSelector(s.selectGeminiApiKey)
  const GEMINI_MODEL = useSelector(s.selectGeminiModel)
  const OPENAI_MAIL = useSelector(s.selectOpenaiMail)
  const OPENAI_PASSWORD = useSelector(s.selectOpenaiPassword)
  const OLLAMA_URL = useSelector(s.selectOllamaUrl)
  const OLLAMA_MODEL = useSelector(s.selectOllamaModel)

  const USE_AI = useSelector(s.selectUseAI)
  const DATABASE_TYPE = useSelector(s.selectDatabaseType)

  const STAFF_ID = useSelector(s.selectStaffId)
  const FACILITY_ID = useSelector(s.selectFacilityId)

  const SELECT_CHILD = useSelector(s.selectSelectedChild)

  // =========================
  // ✅ 日付・曜日は1本化
  // =========================
  const CURRENT_DAY_OF_WEEK = useSelector(s.selectCurrentDate, shallowEqual)
  const CURRENT_YMD = useSelector(s.selectCurrentYmd)
  // { dateStr, weekdayId }

  // =========================
  // others
  // =========================
  const PROMPTS = useSelector(s.selectPrompts)
  const childrenData = useSelector(s.selectChildrenData)
  const attendanceData = useSelector(s.selectAttendanceData)
  const DEBUG_FLG = useSelector(s.selectDebugFlg)
  const SELECT_CHILD_FILTER_MODE = useSelector(s.selectSelectChildFilterMode)

  return {
    appState,

    HUG_USERNAME,
    HUG_PASSWORD,
    GEMINI_API_KEY,
    GEMINI_MODEL,
    OPENAI_MAIL,
    OPENAI_PASSWORD,
    OLLAMA_URL,
    OLLAMA_MODEL,

    USE_AI,
    DATABASE_TYPE,

    STAFF_ID,
    FACILITY_ID,

    SELECT_CHILD,

    // ✅ これだけ
    CURRENT_DAY_OF_WEEK,
    CURRENT_YMD,
    PROMPTS,
    childrenData,
    attendanceData,
    DEBUG_FLG,
    SELECT_CHILD_FILTER_MODE,
  }
}
