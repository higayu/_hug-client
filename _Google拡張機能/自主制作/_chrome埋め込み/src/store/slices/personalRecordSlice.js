import { createSlice } from '@reduxjs/toolkit'
import { getDefaultDateRange } from './dateUtils'

const defaultDateRange = getDefaultDateRange()

const initialState = {
  prStartDate: defaultDateRange.start,
  prEndDate: defaultDateRange.end,
  prResults: [],
  prStatus: '条件を指定して「一覧を取得」を押してください。',
  selectedPr: null,
}

const personalRecordSlice = createSlice({
  name: 'personalRecord',
  initialState,
  reducers: {
    setPrStartDate: (state, action) => {
      state.prStartDate = action.payload
    },
    setPrEndDate: (state, action) => {
      state.prEndDate = action.payload
    },
    setPrResults: (state, action) => {
      state.prResults = action.payload
    },
    setPrStatus: (state, action) => {
      state.prStatus = action.payload
    },
    setSelectedPr: (state, action) => {
      state.selectedPr = action.payload
    },
  },
})

export const {
  setPrStartDate,
  setPrEndDate,
  setPrResults,
  setPrStatus,
  setSelectedPr,
} = personalRecordSlice.actions
export default personalRecordSlice.reducer
