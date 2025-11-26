// src/store/slices/appStateSlice.js
// アプリケーション状態の管理

import { createSlice } from '@reduxjs/toolkit'
import { getDateString, getTodayWeekday } from '../../utils/dateUtils.js'

// 初期状態
const initialState = {
  // 認証情報
  HUG_USERNAME: "",
  HUG_PASSWORD: "",
  GEMINI_API_KEY: "",
  VITE_API_BASE_URL: "",
  USE_AI: "gemini",
  // ID・日付・選択状態
  STAFF_ID: "",
  FACILITY_ID: "",
  DATE_STR: getDateString(), // 初期値は今日の日付
  WEEK_DAY: getTodayWeekday(), // 初期値は今日の曜日
  SELECT_CHILD: "",
  SELECT_CHILD_NAME: "",
  SELECT_PC_NAME: "",
  // 選択中の児童の出勤データ列
  SELECTED_CHILD_COLUMN5: null,
  SELECTED_CHILD_COLUMN5_HTML: null,
  SELECTED_CHILD_COLUMN6: null,
  SELECTED_CHILD_COLUMN6_HTML: null,
  
  // 子どもデータ
  childrenData: [],
  waiting_childrenData: [],
  Experience_childrenData: [],
  
  // UI状態
  closeButtonsVisible: true,
  
  // マスターデータ
  STAFF_DATA: [],
  FACILITY_DATA: [],
  STAFF_AND_FACILITY_DATA: [],
  
  // 出勤データ一覧（児童対応一覧データ）
  attendanceData: [],

  // ★ 追加：プロンプトデータ
  PROMPTS: {}
}

// Sliceの作成
const appStateSlice = createSlice({
  name: 'appState',
  initialState,
  reducers: {
    // 認証情報を設定
    setHugUsername: (state, action) => {
      state.HUG_USERNAME = action.payload || ""
    },
    setHugPassword: (state, action) => {
      state.HUG_PASSWORD = action.payload || ""
    },
    setGeminiApiKey: (state, action) => {
      state.GEMINI_API_KEY = action.payload || ""
    },
    
    // 施設IDを設定
    setFacilityId: (state, action) => {
      state.FACILITY_ID = action.payload || ""
    },
    
    // スタッフIDを設定
    setStaffId: (state, action) => {
      // 文字列として統一（数値の場合は文字列に変換）
      state.STAFF_ID = action.payload != null ? String(action.payload) : ""
    },
    
    // 日付を設定
    setDateStr: (state, action) => {
      state.DATE_STR = action.payload || ""
    },
    
    // 曜日を設定
    setWeekDay: (state, action) => {
      state.WEEK_DAY = action.payload || ""
    },
    
    // 選択された児童を設定
    setSelectedChild: (state, action) => {
      const { childId, childName } = action.payload
      state.SELECT_CHILD = childId || ""
      state.SELECT_CHILD_NAME = childName || ""
      // 児童が変更されたときは列データもクリア
      state.SELECTED_CHILD_COLUMN5 = null
      state.SELECTED_CHILD_COLUMN5_HTML = null
      state.SELECTED_CHILD_COLUMN6 = null
      state.SELECTED_CHILD_COLUMN6_HTML = null
    },
    
    // PC名を設定
    setSelectedPcName: (state, action) => {
      state.SELECT_PC_NAME = action.payload || ""
    },
    
    // 子どもデータを設定
    setChildrenData: (state, action) => {
      state.childrenData = action.payload || []
    },
    setWaitingChildrenData: (state, action) => {
      state.waiting_childrenData = action.payload || []
    },
    setExperienceChildrenData: (state, action) => {
      state.Experience_childrenData = action.payload || []
    },
    
    // UI状態を設定
    setCloseButtonsVisible: (state, action) => {
      state.closeButtonsVisible = action.payload !== undefined ? action.payload : true
    },
    
    // マスターデータを設定
    setStaffData: (state, action) => {
      state.STAFF_DATA = action.payload || []
    },
    setFacilityData: (state, action) => {
      state.FACILITY_DATA = action.payload || []
    },
    setStaffAndFacilityData: (state, action) => {
      state.STAFF_AND_FACILITY_DATA = action.payload || []
    },
    
    // 出勤データを設定
    setAttendanceData: (state, action) => {
      state.attendanceData = action.payload || []
    },

    // AI種別を設定
    setUseAI: (state, action) => {
      state.USE_AI = action.payload || "gemini"
    },

    // 選択中の児童のcolumn5とcolumn6を設定
    setSelectedChildColumns: (state, action) => {
      const { column5, column5Html, column6, column6Html } = action.payload
      state.SELECTED_CHILD_COLUMN5 = column5 !== undefined ? column5 : null
      state.SELECTED_CHILD_COLUMN5_HTML = column5Html !== undefined ? column5Html : null
      state.SELECTED_CHILD_COLUMN6 = column6 !== undefined ? column6 : null
      state.SELECTED_CHILD_COLUMN6_HTML = column6Html !== undefined ? column6Html : null
    },

        // ★ プロンプトデータ設定
    setPrompts: (state, action) => {
      state.PROMPTS = action.payload || {}
    },
    
    // 複数の状態を一度に更新
    updateAppState: (state, action) => {
      const updates = action.payload
      // 認証情報
      if (updates.HUG_USERNAME !== undefined) state.HUG_USERNAME = updates.HUG_USERNAME
      if (updates.HUG_PASSWORD !== undefined) state.HUG_PASSWORD = updates.HUG_PASSWORD
      if (updates.GEMINI_API_KEY !== undefined) state.GEMINI_API_KEY = updates.GEMINI_API_KEY
      if (updates.VITE_API_BASE_URL !== undefined) state.VITE_API_BASE_URL = updates.VITE_API_BASE_URL
      // ID・日付・選択状態
      if (updates.STAFF_ID !== undefined) {
        // 文字列として統一（数値の場合は文字列に変換）
        state.STAFF_ID = updates.STAFF_ID != null ? String(updates.STAFF_ID) : ""
      }
      if (updates.FACILITY_ID !== undefined) state.FACILITY_ID = updates.FACILITY_ID
      if (updates.DATE_STR !== undefined) state.DATE_STR = updates.DATE_STR
      if (updates.WEEK_DAY !== undefined) state.WEEK_DAY = updates.WEEK_DAY
      if (updates.SELECT_CHILD !== undefined) state.SELECT_CHILD = updates.SELECT_CHILD
      if (updates.SELECT_CHILD_NAME !== undefined) state.SELECT_CHILD_NAME = updates.SELECT_CHILD_NAME
      if (updates.SELECT_PC_NAME !== undefined) state.SELECT_PC_NAME = updates.SELECT_PC_NAME
      // 選択中の児童の出勤データ列
      if (updates.SELECTED_CHILD_COLUMN5 !== undefined) state.SELECTED_CHILD_COLUMN5 = updates.SELECTED_CHILD_COLUMN5
      if (updates.SELECTED_CHILD_COLUMN5_HTML !== undefined) state.SELECTED_CHILD_COLUMN5_HTML = updates.SELECTED_CHILD_COLUMN5_HTML
      if (updates.SELECTED_CHILD_COLUMN6 !== undefined) state.SELECTED_CHILD_COLUMN6 = updates.SELECTED_CHILD_COLUMN6
      if (updates.SELECTED_CHILD_COLUMN6_HTML !== undefined) state.SELECTED_CHILD_COLUMN6_HTML = updates.SELECTED_CHILD_COLUMN6_HTML
      // 子どもデータ
      if (updates.childrenData !== undefined) state.childrenData = updates.childrenData
      if (updates.waiting_childrenData !== undefined) state.waiting_childrenData = updates.waiting_childrenData
      if (updates.Experience_childrenData !== undefined) state.Experience_childrenData = updates.Experience_childrenData
      // UI状態
      if (updates.closeButtonsVisible !== undefined) state.closeButtonsVisible = updates.closeButtonsVisible
      // マスターデータ
      if (updates.STAFF_DATA !== undefined) state.STAFF_DATA = updates.STAFF_DATA
      if (updates.FACILITY_DATA !== undefined) state.FACILITY_DATA = updates.FACILITY_DATA
      if (updates.STAFF_AND_FACILITY_DATA !== undefined) state.STAFF_AND_FACILITY_DATA = updates.STAFF_AND_FACILITY_DATA
      // 出勤データ
      if (updates.attendanceData !== undefined) state.attendanceData = updates.attendanceData
      // AI種別
      if (updates.USE_AI !== undefined) state.USE_AI = updates.USE_AI
    },
    
    // 選択状態をクリア
    clearSelection: (state) => {
      state.SELECT_CHILD = ""
      state.SELECT_CHILD_NAME = ""
      state.SELECT_PC_NAME = ""
      state.SELECTED_CHILD_COLUMN5 = null
      state.SELECTED_CHILD_COLUMN5_HTML = null
      state.SELECTED_CHILD_COLUMN6 = null
      state.SELECTED_CHILD_COLUMN6_HTML = null
    },
    
    // すべての状態をリセット
    resetAppState: () => initialState
  }
})

// アクションのエクスポート
export const {
  setHugUsername,
  setHugPassword,
  setGeminiApiKey,
  setFacilityId,
  setStaffId,
  setDateStr,
  setWeekDay,
  setSelectedChild,
  setSelectedPcName,
  setChildrenData,
  setWaitingChildrenData,
  setExperienceChildrenData,
  setCloseButtonsVisible,
  setStaffData,
  setFacilityData,
  setStaffAndFacilityData,
  setAttendanceData,
  setUseAI,
  setSelectedChildColumns,
  updateAppState,
  clearSelection,
  resetAppState,
    // ★ 追加
  setPrompts
} = appStateSlice.actions

// セレクターのエクスポート
export const selectHugUsername = (state) => state.appState.HUG_USERNAME
export const selectHugPassword = (state) => state.appState.HUG_PASSWORD
export const selectGeminiApiKey = (state) => state.appState.GEMINI_API_KEY
export const selectViteApiBaseUrl = (state) => state.appState.VITE_API_BASE_URL
export const selectUseAI = (state) => state.appState.USE_AI
export const selectStaffId = (state) => state.appState.STAFF_ID
export const selectFacilityId = (state) => state.appState.FACILITY_ID
export const selectDateStr = (state) => state.appState.DATE_STR
export const selectWeekDay = (state) => state.appState.WEEK_DAY
export const selectSelectedChild = (state) => state.appState.SELECT_CHILD
export const selectSelectedChildName = (state) => state.appState.SELECT_CHILD_NAME
export const selectSelectedPcName = (state) => state.appState.SELECT_PC_NAME
export const selectSelectedChildColumn5 = (state) => state.appState.SELECTED_CHILD_COLUMN5
export const selectSelectedChildColumn5Html = (state) => state.appState.SELECTED_CHILD_COLUMN5_HTML
export const selectSelectedChildColumn6 = (state) => state.appState.SELECTED_CHILD_COLUMN6
export const selectSelectedChildColumn6Html = (state) => state.appState.SELECTED_CHILD_COLUMN6_HTML
export const selectChildrenData = (state) => state.appState.childrenData
export const selectWaitingChildrenData = (state) => state.appState.waiting_childrenData
export const selectExperienceChildrenData = (state) => state.appState.Experience_childrenData
export const selectCloseButtonsVisible = (state) => state.appState.closeButtonsVisible
export const selectStaffData = (state) => state.appState.STAFF_DATA
export const selectFacilityData = (state) => state.appState.FACILITY_DATA
export const selectStaffAndFacilityData = (state) => state.appState.STAFF_AND_FACILITY_DATA
export const selectAttendanceData = (state) => state.appState.attendanceData
export const selectAppState = (state) => state.appState

// ★ PROMPTS セレクター追加
export const selectPrompts = (state) => state.appState.PROMPTS

// リデューサーのエクスポート
export default appStateSlice.reducer

