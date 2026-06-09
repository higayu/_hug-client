import { combineReducers } from '@reduxjs/toolkit'
import attendanceReducer from './slices/attendanceSlice'
import chatReducer from './slices/chatSlice'
import correctionReducer from './slices/correctionSlice'
import facilityReducer from './slices/facilitySlice'
import hugAuthReducer from './slices/hugAuthSlice'
import hugPersonalRecordReducer from './slices/hugPersonalRecordSlice'
import personalRecordReducer from './slices/personalRecordSlice'
import uiReducer from './slices/uiSlice'

const rootReducer = combineReducers({
  attendance: attendanceReducer,
  chat: chatReducer,
  correction: correctionReducer,
  facility: facilityReducer,
  hugAuth: hugAuthReducer,
  hugPersonalRecord: hugPersonalRecordReducer,
  personalRecord: personalRecordReducer,
  ui: uiReducer,
})

export default rootReducer
