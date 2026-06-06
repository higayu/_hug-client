import { createSlice } from '@reduxjs/toolkit'
import { getFormattedDate } from './dateUtils'

const initialState = {
  correctionDate: getFormattedDate(new Date()),
  correctionOriginal: '今日の活動では、公園で遊びました。少し疲れた様子でした。',
  correctionAdditional: '',
  correctionText: '',
  correctionModalOpen: false,
  correctionLoading: false,
  correctionMode: 'simple',
}

const correctionSlice = createSlice({
  name: 'correction',
  initialState,
  reducers: {
    setCorrectionDate: (state, action) => {
      state.correctionDate = action.payload
    },
    setCorrectionOriginal: (state, action) => {
      state.correctionOriginal = action.payload
    },
    setCorrectionAdditional: (state, action) => {
      state.correctionAdditional = action.payload
    },
    setCorrectionText: (state, action) => {
      state.correctionText = action.payload
    },
    setCorrectionModalOpen: (state, action) => {
      state.correctionModalOpen = action.payload
    },
    setCorrectionLoading: (state, action) => {
      state.correctionLoading = action.payload
    },
    setCorrectionMode: (state, action) => {
      state.correctionMode = action.payload
    },
  },
})

export const {
  setCorrectionDate,
  setCorrectionOriginal,
  setCorrectionAdditional,
  setCorrectionText,
  setCorrectionModalOpen,
  setCorrectionLoading,
  setCorrectionMode,
} = correctionSlice.actions
export default correctionSlice.reducer
