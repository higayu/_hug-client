// renderer/src/store/slices/modeSlice.js
// アプリケーションの表示モード管理

import { createSlice } from '@reduxjs/toolkit'

export const APP_MODES = Object.freeze({
  DASHBOARD: 'dashboard',
  AI_INQUIRY: 'aiInquiry',
})

const VALID_MODES = Object.values(APP_MODES)

const initialState = {
  currentMode: APP_MODES.DASHBOARD,
}

const modeSlice = createSlice({
  name: 'mode',
  initialState,

  reducers: {
    /**
     * 表示モードを変更
     */
    setMode: (state, action) => {
      const mode = action.payload

      state.currentMode = VALID_MODES.includes(mode)
        ? mode
        : APP_MODES.DASHBOARD
    },

    /**
     * 初期モードへ戻す
     */
    resetMode: (state) => {
      state.currentMode = APP_MODES.DASHBOARD
    },
  },
})

export const {
  setMode,
  resetMode,
} = modeSlice.actions

export const selectModeState = (state) =>
  state.mode ?? initialState

export const selectCurrentMode = (state) =>
  state.mode?.currentMode ?? APP_MODES.DASHBOARD

export const selectIsDashboardMode = (state) =>
  selectCurrentMode(state) === APP_MODES.DASHBOARD

export const selectIsAiInquiryMode = (state) =>
  selectCurrentMode(state) === APP_MODES.AI_INQUIRY

export default modeSlice.reducer