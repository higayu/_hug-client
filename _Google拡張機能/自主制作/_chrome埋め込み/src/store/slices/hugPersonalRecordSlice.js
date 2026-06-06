import { createSlice } from '@reduxjs/toolkit'
import { getDefaultDateRange } from './dateUtils'

const defaultDateRange = getDefaultDateRange()

const initialState = {
  hprStartDate: defaultDateRange.start,
  hprEndDate: defaultDateRange.end,
  hprResults: [],
  hprLoading: false,
  hprNote: '',
  hprCachedRecord: null,
  hprRecordStaff: '',
  hugStatus: 'HUG WM にログインしたうえで実行してください。',
}

const hugPersonalRecordSlice = createSlice({
  name: 'hugPersonalRecord',
  initialState,
  reducers: {
    setHprStartDate: (state, action) => {
      state.hprStartDate = action.payload
    },
    setHprEndDate: (state, action) => {
      state.hprEndDate = action.payload
    },
    setHprResults: (state, action) => {
      state.hprResults = action.payload
    },
    setHprLoading: (state, action) => {
      state.hprLoading = action.payload
    },
    setHprNote: (state, action) => {
      state.hprNote = action.payload
    },
    setHprCachedRecord: (state, action) => {
      state.hprCachedRecord = action.payload
    },
    setHprRecordStaff: (state, action) => {
      state.hprRecordStaff = action.payload
    },
    setHugStatus: (state, action) => {
      state.hugStatus = action.payload
    },
  },
})

export const {
  setHprStartDate,
  setHprEndDate,
  setHprResults,
  setHprLoading,
  setHprNote,
  setHprCachedRecord,
  setHprRecordStaff,
  setHugStatus,
} = hugPersonalRecordSlice.actions
export default hugPersonalRecordSlice.reducer
