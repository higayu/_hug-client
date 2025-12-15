// contexts/appState/useReduxBindings.js
import { useSelector } from 'react-redux'
import * as s from '@/store/slices/appStateSlice'

export function useReduxBindings() {
  return {
    appState: useSelector(s.selectAppState),

    HUG_USERNAME: useSelector(s.selectHugUsername),
    HUG_PASSWORD: useSelector(s.selectHugPassword),
    GEMINI_API_KEY: useSelector(s.selectGeminiApiKey),

    USE_AI: useSelector(s.selectUseAI),
    SELECT_CHILD: useSelector(s.selectSelectedChild),

    STAFF_ID: useSelector(s.selectStaffId),
    FACILITY_ID: useSelector(s.selectFacilityId),

    DATE_STR: useSelector(s.selectDateStr),
    WEEK_DAY: useSelector(s.selectWeekDay),

    PROMPTS: useSelector(s.selectPrompts),
    childrenData: useSelector(s.selectChildrenData),
    attendanceData: useSelector(s.selectAttendanceData),
  }
}
