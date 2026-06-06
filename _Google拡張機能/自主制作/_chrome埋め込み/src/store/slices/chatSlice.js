import { createSlice } from '@reduxjs/toolkit'
import { getDefaultDateRange } from './dateUtils'

const defaultDateRange = getDefaultDateRange()

const initialState = {
  chatStarted: false,
  chatInput: '',
  chatModel: 'Gemini 3.1 Flash',
  chatStartDate: defaultDateRange.start,
  chatEndDate: defaultDateRange.end,
  chatMessages: [
    { role: 'assistant', content: '過去の支援記録をもとに質問してください。' },
  ],
}

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setChatStarted: (state, action) => {
      state.chatStarted = action.payload
    },
    setChatInput: (state, action) => {
      state.chatInput = action.payload
    },
    setChatModel: (state, action) => {
      state.chatModel = action.payload
    },
    setChatStartDate: (state, action) => {
      state.chatStartDate = action.payload
    },
    setChatEndDate: (state, action) => {
      state.chatEndDate = action.payload
    },
    setChatMessages: (state, action) => {
      state.chatMessages = action.payload
    },
  },
})

export const {
  setChatStarted,
  setChatInput,
  setChatModel,
  setChatStartDate,
  setChatEndDate,
  setChatMessages,
} = chatSlice.actions
export default chatSlice.reducer
