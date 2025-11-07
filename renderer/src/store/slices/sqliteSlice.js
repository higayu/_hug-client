// src/store/slices/sqliteSlice.js
// SQLiteテーブルデータの状態管理

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { sqliteApi } from '../../sql/sqliteApi.js'

// 非同期アクション: 全テーブルデータを取得
export const fetchAllTables = createAsyncThunk(
  'sqlite/fetchAllTables',
  async (_, { rejectWithValue }) => {
    try {
      const result = await sqliteApi.getAllTables()
      if (result) {
        return result
      } else {
        return rejectWithValue('テーブルデータの取得に失敗しました')
      }
    } catch (error) {
      return rejectWithValue(error.message || '予期しないエラーが発生しました')
    }
  }
)

// 初期状態
const initialState = {
  // テーブルデータ
  children: [],
  staffs: [],
  managers: [],
  pc: [],
  pc_to_children: [],
  pronunciation: [],
  children_type: [],
  // ローディング状態
  loading: false,
  // エラー状態
  error: null,
  // メタデータ
  metadata: {
    lastFetched: null,
    fetchedAt: null
  }
}

// Sliceの作成
const sqliteSlice = createSlice({
  name: 'sqlite',
  initialState,
  reducers: {
    // 全テーブルデータを設定
    setAllTables: (state, action) => {
      const {
        children = [],
        staffs = [],
        managers = [],
        pc = [],
        pc_to_children = [],
        pronunciation = [],
        children_type = []
      } = action.payload || {}
      
      state.children = children
      state.staffs = staffs
      state.managers = managers
      state.pc = pc
      state.pc_to_children = pc_to_children
      state.pronunciation = pronunciation
      state.children_type = children_type
      state.metadata.lastFetched = new Date().toISOString()
      state.error = null
    },
    // 個別テーブルデータを設定
    setChildren: (state, action) => {
      state.children = action.payload || []
    },
    setStaffs: (state, action) => {
      state.staffs = action.payload || []
    },
    setManagers: (state, action) => {
      state.managers = action.payload || []
    },
    setPc: (state, action) => {
      state.pc = action.payload || []
    },
    setPcToChildren: (state, action) => {
      state.pc_to_children = action.payload || []
    },
    setPronunciation: (state, action) => {
      state.pronunciation = action.payload || []
    },
    setChildrenType: (state, action) => {
      state.children_type = action.payload || []
    },
    // 状態をクリア
    clearSqliteData: (state) => {
      state.children = []
      state.staffs = []
      state.managers = []
      state.pc = []
      state.pc_to_children = []
      state.pronunciation = []
      state.children_type = []
      state.error = null
      state.metadata = {
        lastFetched: null,
        fetchedAt: null
      }
    },
    // エラーをクリア
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchAllTables
      .addCase(fetchAllTables.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAllTables.fulfilled, (state, action) => {
        state.loading = false
        const {
          children = [],
          staffs = [],
          managers = [],
          pc = [],
          pc_to_children = [],
          pronunciation = [],
          children_type = []
        } = action.payload || {}
        
        state.children = children
        state.staffs = staffs
        state.managers = managers
        state.pc = pc
        state.pc_to_children = pc_to_children
        state.pronunciation = pronunciation
        state.children_type = children_type
        state.metadata.lastFetched = new Date().toISOString()
        state.metadata.fetchedAt = new Date().toISOString()
        state.error = null
      })
      .addCase(fetchAllTables.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'テーブルデータの取得に失敗しました'
      })
  }
})

// アクションのエクスポート
export const {
  setAllTables,
  setChildren,
  setStaffs,
  setManagers,
  setPc,
  setPcToChildren,
  setPronunciation,
  setChildrenType,
  clearSqliteData,
  clearError
} = sqliteSlice.actions

// セレクターのエクスポート
export const selectChildren = (state) => state.sqlite.children
export const selectStaffs = (state) => state.sqlite.staffs
export const selectManagers = (state) => state.sqlite.managers
export const selectPc = (state) => state.sqlite.pc
export const selectPcToChildren = (state) => state.sqlite.pc_to_children
export const selectPronunciation = (state) => state.sqlite.pronunciation
export const selectChildrenType = (state) => state.sqlite.children_type
export const selectSqliteLoading = (state) => state.sqlite.loading
export const selectSqliteError = (state) => state.sqlite.error
export const selectSqliteMetadata = (state) => state.sqlite.metadata
export const selectAllTables = (state) => ({
  children: state.sqlite.children,
  staffs: state.sqlite.staffs,
  managers: state.sqlite.managers,
  pc: state.sqlite.pc,
  pc_to_children: state.sqlite.pc_to_children,
  pronunciation: state.sqlite.pronunciation,
  children_type: state.sqlite.children_type
})
export const selectSqliteState = (state) => state.sqlite

// リデューサーのエクスポート
export default sqliteSlice.reducer

