// src/store/slices/databaseSlice.js
// SQLiteテーブルデータの状態管理

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// 引数を受け取りstoreに保存するだけのアクション
export const fetchAllTables = createAsyncThunk(
  'sqlite/fetchAllTables',
  async (payload) => {
    // 受け取ったデータをそのまま返す
    return payload
  }
)

// 初期状態
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
      const {
        children = [],
        staffs = [],
        managers = [],
        pc = [],
        pc_to_children = [],
        pronunciation = [],
        children_type = [],
        facility_children = [],
        facility_staff = [],
        facilitys = [],
      } = action.payload || {}

      state.children = children
      state.staffs = staffs
      state.managers = managers
      state.pc = pc
      state.pc_to_children = pc_to_children
      state.pronunciation = pronunciation
      state.children_type = children_type
      state.facility_children = facility_children
      state.facility_staff = facility_staff
      state.facilitys = facilitys
      state.metadata.lastFetched = new Date().toISOString()
      state.error = null
    },
    clearSqliteData: (state) => {
      state.children = []
      state.staffs = []
      state.managers = []
      state.pc = []
      state.pc_to_children = []
      state.pronunciation = []
      state.children_type = []
      state.error = null
      state.metadata = { lastFetched: null, fetchedAt: null }
    },
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllTables.fulfilled, (state, action) => {
        state.loading = false
        const {
          children = [],
          staffs = [],
          managers = [],
          pc = [],
          pc_to_children = [],
          pronunciation = [],
          children_type = [],
          facility_children = [],
          facility_staff = [],
          facilitys = [],
        } = action.payload || {}
      
        state.children = children
        state.staffs = staffs
        state.managers = managers
        state.pc = pc
        state.pc_to_children = pc_to_children
        state.pronunciation = pronunciation
        state.children_type = children_type
        state.facility_children = facility_children
        state.facility_staff = facility_staff
        state.facilitys = facilitys
        state.metadata.lastFetched = new Date().toISOString()
        state.metadata.fetchedAt = new Date().toISOString()
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
