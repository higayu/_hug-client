// src/store/slices/databaseSlice.js
// SQLiteテーブルデータの状態管理

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// --- 共通処理：payload → state へのマッピング ---
const tableKeys = [
  'children',
  'staffs',
  'managers',
  'facility_children',
  'facility_staff',
  'facilitys',          // ← facilitys を正式名称へ
  'pc',
  'pc_to_children',
  'pronunciation',
  'children_type',
  'day_of_week'
]

const applyPayloadToState = (state, payload = {}) => {
  tableKeys.forEach((key) => {
    state[key] = payload[key] ?? []
  })
}

// asyncThunk（単に payload を返すだけ）
export const fetchAllTables = createAsyncThunk(
  'sqlite/fetchAllTables',
  async (payload) => payload
)

// --- 初期状態 ---
const initialState = {
  children: [],
  staffs: [],
  managers: [],
  facility_children: [],
  facility_staff: [],
  facilitys: [],
  pc: [],
  pc_to_children: [],
  pronunciation: [],
  children_type: [],
  day_of_week: [],
  loading: false,
  error: null,
  metadata: {
    lastFetched: null,
    fetchedAt: null
  }
}

// Slice
const databaseSlice = createSlice({
  name: 'sqlite',
  initialState,
  reducers: {
    setAllTables: (state, action) => {
      applyPayloadToState(state, action.payload)
      const now = new Date().toISOString()
      state.metadata.lastFetched = now
      state.metadata.fetchedAt = now
      state.error = null
    },
    clearSqliteData: (state) => {
      tableKeys.forEach((key) => (state[key] = []))
      state.error = null
      state.metadata = { lastFetched: null, fetchedAt: null }
    },
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllTables.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchAllTables.fulfilled, (state, action) => {
        state.loading = false
        applyPayloadToState(state, action.payload)
        const now = new Date().toISOString()
        state.metadata.lastFetched = now
        state.metadata.fetchedAt = now
        state.error = null
      })
      .addCase(fetchAllTables.rejected, (state, action) => {
        state.loading = false
        state.error = action.error?.message || 'データ保存に失敗しました'
      })
  }
})

export const { setAllTables, clearSqliteData, clearError } = databaseSlice.actions
export default databaseSlice.reducer
