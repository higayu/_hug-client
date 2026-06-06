import { createSlice } from '@reduxjs/toolkit'
import { getFormattedDate } from './dateUtils'

const ATTENDANCE_FACILITY_OPTIONS = [
  { id: 3, value: 'PD吉島', defaultChecked: true },
  { id: 6, value: 'PD舟入', defaultChecked: false },
  { id: 7, value: 'PD横川', defaultChecked: false },
  { id: 8, value: 'PD廿日市駅前', defaultChecked: false },
]

const getStoredHalfTime = () => {
  if (typeof localStorage === 'undefined') return '12:00'
  try {
    return localStorage.getItem('hugAttendanceHalfTime') || '12:00'
  } catch {
    return '12:00'
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

const initialState = {
  attendanceDate: getFormattedDate(new Date()),
  attendanceRows: [],
  attendanceLoading: false,
  attendanceStatus: 'HUG WM にログインしたうえで「一覧を取得」を押してください。',
  halfTime: getStoredHalfTime(),
  showLeftRecords: getStoredShowLeftRecords(),
  attendanceFacilityMap: Object.fromEntries(
    ATTENDANCE_FACILITY_OPTIONS.map((option) => [String(option.id), option.defaultChecked]),
  ),
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
    setHalfTime: (state, action) => {
      state.halfTime = action.payload
    },
    setShowLeftRecords: (state, action) => {
      state.showLeftRecords = action.payload
    },
    setAttendanceFacilityMap: (state, action) => {
      state.attendanceFacilityMap = action.payload
    },
  },
})

export const {
  setAttendanceDate,
  setAttendanceRows,
  setAttendanceLoading,
  setAttendanceStatus,
  setHalfTime,
  setShowLeftRecords,
  setAttendanceFacilityMap,
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

// 半日時間
export const selectHalfTime = (state) => state.attendance.halfTime

// 左記録表示
export const selectShowLeftRecords = (state) => state.attendance.showLeftRecords

// 出席施設チェック状態
export const selectAttendanceFacilityMap = (state) => state.attendance.attendanceFacilityMap

export default attendanceSlice.reducer