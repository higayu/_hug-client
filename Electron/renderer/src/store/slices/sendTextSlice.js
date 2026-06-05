// renderer/src/store/slices/sendTextSlice.js
import { createSlice } from '@reduxjs/toolkit'

const PROMPT_KEYS = [
  'personalRecord',
  'professional1',
  'professional2'
]

const createPromptState = () => ({
  aiText: '',
  sending: false,
  error: null,
  lastSentAt: null
})

const initialState = {
  personalRecord: createPromptState(),
  professional1: createPromptState(),
  professional2: createPromptState()
}

const sendTextSlice = createSlice({
  name: 'sendText',
  initialState,
  reducers: {
    setAiText: (state, action) => {
      const { key, text } = action.payload
      if (PROMPT_KEYS.includes(key)) {
        state[key].aiText = text ?? ''
      }
    },
    clearAiText: (state, action) => {
      const { key } = action.payload
      if (PROMPT_KEYS.includes(key)) {
        state[key].aiText = ''
        state[key].error = null
      }
    },
    sendStart: (state, action) => {
      const { key } = action.payload
      state[key].sending = true
      state[key].error = null
    },
    sendSuccess: (state, action) => {
      const { key } = action.payload
      state[key].sending = false
      state[key].lastSentAt = new Date().toISOString()
    },
    sendError: (state, action) => {
      const { key, error } = action.payload
      state[key].sending = false
      state[key].error = error || '送信に失敗しました'
    }
  }
})

export const {
  setAiText,
  clearAiText,
  sendStart,
  sendSuccess,
  sendError
} = sendTextSlice.actions

export default sendTextSlice.reducer
