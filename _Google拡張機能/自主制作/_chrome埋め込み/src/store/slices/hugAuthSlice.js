import { createSlice } from '@reduxjs/toolkit'

/**
 * HUG WM ログイン状態と自動ログイン設定。
 *
 * - loginStatus / loginVerifiedAt … UI 表示用キャッシュ（正は checkHugWmLoginStatus の HTML 判定）
 * - loginId / password … 実行中のみ保持。永続化は lib/hugAuthCredentials.js 経由
 */
const initialState = {
  loginStatus: 'unknown',
  loginVerifiedAt: null,
  autoLoginEnabled: false,
  keepSession: false,
  loginId: '',
  password: '',
  loginCheckLoading: false,
}

const hugAuthSlice = createSlice({
  name: 'hugAuth',
  initialState,
  reducers: {
    setHugLoginStatus: (state, action) => {
      state.loginStatus = action.payload
      state.loginVerifiedAt = Date.now()
    },
    setHugAutoLoginEnabled: (state, action) => {
      state.autoLoginEnabled = action.payload
    },
    setHugKeepSession: (state, action) => {
      state.keepSession = action.payload
    },
    setHugLoginId: (state, action) => {
      state.loginId = action.payload
    },
    setHugPassword: (state, action) => {
      state.password = action.payload
    },
    setHugAuthCredentials: (state, action) => {
      const { loginId, password, autoLoginEnabled, keepSession } = action.payload
      if (loginId !== undefined) state.loginId = loginId
      if (password !== undefined) state.password = password
      if (autoLoginEnabled !== undefined) state.autoLoginEnabled = autoLoginEnabled
      if (keepSession !== undefined) state.keepSession = keepSession
    },
    clearHugAuthCredentialsState: (state) => {
      state.loginId = ''
      state.password = ''
      state.autoLoginEnabled = false
      state.keepSession = false
    },
    setHugLoginCheckLoading: (state, action) => {
      state.loginCheckLoading = action.payload
    },
    resetHugLoginStatus: (state) => {
      state.loginStatus = 'unknown'
      state.loginVerifiedAt = null
    },
  },
})

export const {
  setHugLoginStatus,
  setHugAutoLoginEnabled,
  setHugKeepSession,
  setHugLoginId,
  setHugPassword,
  setHugAuthCredentials,
  clearHugAuthCredentialsState,
  setHugLoginCheckLoading,
  resetHugLoginStatus,
} = hugAuthSlice.actions

export const selectHugLoginStatus = (state) => state.hugAuth.loginStatus
export const selectHugLoginVerifiedAt = (state) => state.hugAuth.loginVerifiedAt
export const selectHugAutoLoginEnabled = (state) => state.hugAuth.autoLoginEnabled
export const selectHugKeepSession = (state) => state.hugAuth.keepSession
export const selectHugLoginId = (state) => state.hugAuth.loginId
export const selectHugLoginCheckLoading = (state) => state.hugAuth.loginCheckLoading

export default hugAuthSlice.reducer
