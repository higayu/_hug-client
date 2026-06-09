import { createSlice } from '@reduxjs/toolkit'
import { getFormattedDate } from './dateUtils'

const ATTENDANCE_FACILITY_OPTIONS = [
  { id: 3, value: 'PD吉島', defaultChecked: true },
  { id: 6, value: 'PD光', defaultChecked: false },
  { id: 7, value: 'PD横川', defaultChecked: false },
  { id: 8, value: 'PD五日市駅前', defaultChecked: false },
]

const getStoredHalfTime = () => {
  if (typeof localStorage === 'undefined') return '12:30'
  try {
    return localStorage.getItem('hugAttendanceHalfTime') || '12:30'
  } catch {
    return '12:30'
  }
}

const getStoredShowLeftRecords = () => {
  if (typeof localStorage === 'undefined') return 1
  try {
    return localStorage.getItem('hugAttendanceShowLeftRecords') === '0' ? 0 : 1
  } catch {
    return 1
  }
}

export const ATTENDANCE_AUTO_UPDATE_STORAGE_KEY = 'hugAttendanceAutoUpdateEnabled'

const getStoredAttendanceAutoUpdateEnabled = () => {
  if (typeof localStorage === 'undefined') return 1
  try {
    return localStorage.getItem(ATTENDANCE_AUTO_UPDATE_STORAGE_KEY) === '0' ? 0 : 1
  } catch {
    return 1
  }
}

const initialState = {
  attendanceDate: getFormattedDate(new Date()),
  attendanceRows: [],
  attendanceLoading: false,
  attendanceStatus: 'HUG WM にログインしたうえで「一覧を取得」を押してください。',
  attendanceLastFetchedAt: null,
  halfTime: getStoredHalfTime(),
  showLeftRecords: getStoredShowLeftRecords(),
  attendanceFacilityMap: Object.fromEntries(
    ATTENDANCE_FACILITY_OPTIONS.map((option) => [String(option.id), option.defaultChecked]),
  ),
  attendanceAutoUpdateEnabled: getStoredAttendanceAutoUpdateEnabled(),
}

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {
    setAttendanceDate: (state, action) => {
      state.attendanceDate = action.payload
    },
    setAttendanceRows: (state, action) => {
      state.attendanceRows = action.payload
    },
    setAttendanceLoading: (state, action) => {
      state.attendanceLoading = action.payload
    },
    setAttendanceStatus: (state, action) => {
      state.attendanceStatus = action.payload
    },
    setAttendanceLastFetchedAt: (state, action) => {
      state.attendanceLastFetchedAt = action.payload
    },
    setHalfTime: (state, action) => {
      state.halfTime = action.payload
    },
    setShowLeftRecords: (state, action) => {
      state.showLeftRecords = action.payload
    },
    setAttendanceFacilityMap: (state, action) => {
      state.attendanceFacilityMap = action.payload
    },
    setAttendanceAutoUpdateEnabled: (state, action) => {
      state.attendanceAutoUpdateEnabled = action.payload
    },
  },
})

export const {
  setAttendanceDate,
  setAttendanceRows,
  setAttendanceLoading,
  setAttendanceStatus,
  setAttendanceLastFetchedAt,
  setHalfTime,
  setShowLeftRecords,
  setAttendanceFacilityMap,
  setAttendanceAutoUpdateEnabled,
} = attendanceSlice.actions

// attendance slice 全体
export const selectAttendanceState = (state) => state.attendance

// 入退室一覧データ
export const selectAttendanceRows = (state) => state.attendance.attendanceRows

// 取得児童データとして使う場合
export const selectAttendanceChildren = (state) => state.attendance.attendanceRows

// 出席表日付
export const selectAttendanceDate = (state) => state.attendance.attendanceDate

// ローディング状態
export const selectAttendanceLoading = (state) => state.attendance.attendanceLoading

// ステータスメッセージ
export const selectAttendanceStatus = (state) => state.attendance.attendanceStatus

// 一覧の最終取得成功時刻（ms）
export const selectAttendanceLastFetchedAt = (state) => state.attendance.attendanceLastFetchedAt

// 半日時間
export const selectHalfTime = (state) => state.attendance.halfTime

// 左記録表示
export const selectShowLeftRecords = (state) => state.attendance.showLeftRecords

// 出席施設チェック状態
export const selectAttendanceFacilityMap = (state) => state.attendance.attendanceFacilityMap

// 入退室一覧の定期自動更新（1=オン, 0=オフ）
export const selectAttendanceAutoUpdateEnabled = (state) => state.attendance.attendanceAutoUpdateEnabled

export default attendanceSlice.reducer