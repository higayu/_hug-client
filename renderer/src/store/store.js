// src/store/store.js
// Redux storeの設定

import { configureStore } from '@reduxjs/toolkit'
import attendanceReducer from './slices/attendanceSlice.js'
import appStateReducer from './slices/appStateSlice.js'
import sqliteReducer from './slices/sqliteSlice.js'

export const store = configureStore({
  reducer: {
    attendance: attendanceReducer,
    appState: appStateReducer,
    sqlite: sqliteReducer
  },
  // Redux DevToolsは開発環境で有効
  devTools: process.env.NODE_ENV !== 'production'
})

export default store

