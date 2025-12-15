// contexts/appState/useReduxBindings.js
import { useSelector, shallowEqual } from 'react-redux'
import * as s from '@/store/slices/appStateSlice'

export function useReduxBindings() {
  // ⚠️ object を返す selector だけ shallowEqual を指定
  const appState = useSelector(s.selectAppState, shallowEqual)

  // primitives / memoized selector はそのままでOK
  const HUG_USERNAME = useSelector(s.selectHugUsername)
  const HUG_PASSWORD = useSelector(s.selectHugPassword)
  const GEMINI_API_KEY = useSelector(s.selectGeminiApiKey)

  const USE_AI = useSelector(s.selectUseAI)
  const SELECT_CHILD = useSelector(s.selectSelectedChild)

  const STAFF_ID = useSelector(s.selectStaffId)
  const FACILITY_ID = useSelector(s.selectFacilityId)

  const DATE_STR = useSelector(s.selectDateStr)
  const WEEK_DAY = useSelector(s.selectWeekDay)

  const PROMPTS = useSelector(s.selectPrompts)
  const childrenData = useSelector(s.selectChildrenData)
  const attendanceData = useSelector(s.selectAttendanceData)

  return {
    appState,

    HUG_USERNAME,
    HUG_PASSWORD,
    GEMINI_API_KEY,

    USE_AI,
    SELECT_CHILD,

    STAFF_ID,
    FACILITY_ID,

    DATE_STR,
    WEEK_DAY,

    PROMPTS,
    childrenData,
    attendanceData,
  }
}

