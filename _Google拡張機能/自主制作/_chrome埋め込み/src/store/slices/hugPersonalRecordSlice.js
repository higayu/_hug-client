import { createSlice } from '@reduxjs/toolkit'
import { getDefaultDateRange, getFormattedDate } from './dateUtils'

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
  hprAttendanceDate: getFormattedDate(new Date()),
  hprSelectedFacilityId: '',
  hprSelectedChildId: '',
  hprChildrenByFacility: {},
  hprAttendanceChildren: [],
  hprAttendanceLoading: false,
  hprFacilities: [],
  hprFacilitiesLoading: false,
  hprPublishSaveVisible: false,
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
    setHprAttendanceDate: (state, action) => {
      state.hprAttendanceDate = action.payload
    },
    setHprSelectedFacilityId: (state, action) => {
      state.hprSelectedFacilityId = action.payload
    },
    setHprSelectedChildId: (state, action) => {
      state.hprSelectedChildId = action.payload
    },
    setHprChildrenByFacility: (state, action) => {
      state.hprChildrenByFacility = action.payload
    },
    setHprAttendanceChildren: (state, action) => {
      state.hprAttendanceChildren = action.payload
    },
    setHprAttendanceLoading: (state, action) => {
      state.hprAttendanceLoading = action.payload
    },
    setHprFacilities: (state, action) => {
      state.hprFacilities = action.payload
    },
    setHprFacilitiesLoading: (state, action) => {
      state.hprFacilitiesLoading = action.payload
    },
    setHprPublishSaveVisible: (state, action) => {
      state.hprPublishSaveVisible = action.payload
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
  setHprAttendanceDate,
  setHprSelectedFacilityId,
  setHprSelectedChildId,
  setHprChildrenByFacility,
  setHprAttendanceChildren,
  setHprAttendanceLoading,
  setHprFacilities,
  setHprFacilitiesLoading,
  setHprPublishSaveVisible,
} = hugPersonalRecordSlice.actions

export const selectHprAttendanceChildren = (state) => state.hugPersonalRecord.hprAttendanceChildren
export const selectHprAttendanceLoading = (state) => state.hugPersonalRecord.hprAttendanceLoading
export const selectHprFacilities = (state) => state.hugPersonalRecord.hprFacilities
export const selectHprFacilitiesLoading = (state) => state.hugPersonalRecord.hprFacilitiesLoading
export const selectHprPublishSaveVisible = (state) => state.hugPersonalRecord.hprPublishSaveVisible

export default hugPersonalRecordSlice.reducer
