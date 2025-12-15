// src/store/store.js
// Redux storeの設定

import { configureStore } from '@reduxjs/toolkit'
import attendanceReducer from './slices/attendanceSlice.js'
import appStateReducer from './slices/appStateSlice.js'
import databaseReducer from './slices/databaseSlice.js'
import sendTextReducer from './slices/sendTextSlice.js'

export const store = configureStore({
  reducer: {
    attendance: attendanceReducer,
    appState: appStateReducer,
    database: databaseReducer,
    sendText: sendTextReducer   // ← ここを修正
  },
  devTools: process.env.NODE_ENV !== 'production'
})


export default store

