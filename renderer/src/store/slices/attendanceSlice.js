// src/store/slices/attendanceSlice.js
// 出勤データテーブルの状態管理

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { fetchAttendanceTableData, extractColumnData, parseAttendanceTable } from '../../utils/ToDayChildrenList/attendanceTable.js'

// 非同期アクション: テーブルデータを取得
export const fetchAttendanceTable = createAsyncThunk(
  'attendance/fetchTable',
  async ({ facility_id, date_str, options = {} }, { rejectWithValue }) => {
    try {
      const result = await fetchAttendanceTableData(facility_id, date_str, options)
      if (result.success) {
        return result
      } else {
        return rejectWithValue(result.error || 'テーブルデータの取得に失敗しました')
      }
    } catch (error) {
      return rejectWithValue(error.message || '予期しないエラーが発生しました')
    }
  }
)

// 非同期アクション: 列データを抽出
export const extractAttendanceColumns = createAsyncThunk(
  'attendance/extractColumns',
  async (tableHTML, { rejectWithValue }) => {
    try {
      const result = await extractColumnData(tableHTML)
      if (result.success) {
        return result
      } else {
        return rejectWithValue(result.error || '列データの抽出に失敗しました')
      }
    } catch (error) {
      return rejectWithValue(error.message || '予期しないエラーが発生しました')
    }
  }
)

// 非同期アクション: テーブルをパース
export const parseAttendanceTableData = createAsyncThunk(
  'attendance/parseTable',
  async (tableHTML, { rejectWithValue }) => {
    try {
      const result = await parseAttendanceTable(tableHTML)
      if (result.success) {
        return result
      } else {
        return rejectWithValue(result.error || 'テーブルのパースに失敗しました')
      }
    } catch (error) {
      return rejectWithValue(error.message || '予期しないエラーが発生しました')
    }
  }
)

// 非同期アクション: テーブルデータを取得して列データも抽出（統合）
export const fetchAndExtractAttendanceData = createAsyncThunk(
  'attendance/fetchAndExtract',
  async ({ facility_id, date_str, options = {} }, { dispatch, rejectWithValue }) => {
    try {
      // まずテーブルデータを取得
      const tableResult = await dispatch(fetchAttendanceTable({ facility_id, date_str, options }))
      
      if (fetchAttendanceTable.fulfilled.match(tableResult)) {
        const tableData = tableResult.payload
        
        // テーブルHTMLが存在する場合、列データを抽出
        if (tableData.html) {
          const extractResult = await dispatch(extractAttendanceColumns(tableData.html))
          
          if (extractAttendanceColumns.fulfilled.match(extractResult)) {
            return {
              tableData,
              extractedData: extractResult.payload
            }
          } else {
            // 抽出に失敗してもテーブルデータは返す
            return {
              tableData,
              extractedData: null,
              extractError: extractResult.payload
            }
          }
        }
        
        return {
          tableData,
          extractedData: null
        }
      } else {
        return rejectWithValue(tableResult.payload || 'テーブルデータの取得に失敗しました')
      }
    } catch (error) {
      return rejectWithValue(error.message || '予期しないエラーが発生しました')
    }
  }
)

// 初期状態
const initialState = {
  // テーブルデータ
  tableData: null,
  // 抽出された列データ
  extractedData: null,
  // パースされたテーブルデータ
  parsedData: null,
  // ローディング状態
  loading: false,
  // エラー状態
  error: null,
  // メタデータ
  metadata: {
    facility_id: null,
    date_str: null,
    extractedAt: null
  }
}

// Sliceの作成
const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {
    // 状態をクリア
    clearAttendanceData: (state) => {
      state.tableData = null
      state.extractedData = null
      state.parsedData = null
      state.error = null
      state.metadata = {
        facility_id: null,
        date_str: null,
        extractedAt: null
      }
    },
    // エラーをクリア
    clearError: (state) => {
      state.error = null
    },
    // テーブルデータを直接設定（後方互換性のため）
    setTableData: (state, action) => {
      state.tableData = action.payload
      if (action.payload) {
        state.metadata.facility_id = action.payload.facility_id
        state.metadata.date_str = action.payload.date_str
      }
    },
    // 抽出データを直接設定（後方互換性のため）
    setExtractedData: (state, action) => {
      state.extractedData = action.payload
      if (action.payload) {
        state.metadata.extractedAt = new Date().toISOString()
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchAttendanceTable
      .addCase(fetchAttendanceTable.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAttendanceTable.fulfilled, (state, action) => {
        state.loading = false
        state.tableData = action.payload
        state.metadata.facility_id = action.payload.facility_id
        state.metadata.date_str = action.payload.date_str
        state.error = null
      })
      .addCase(fetchAttendanceTable.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'テーブルデータの取得に失敗しました'
      })
      // extractAttendanceColumns
      .addCase(extractAttendanceColumns.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(extractAttendanceColumns.fulfilled, (state, action) => {
        state.loading = false
        state.extractedData = action.payload
        state.metadata.extractedAt = new Date().toISOString()
        state.error = null
      })
      .addCase(extractAttendanceColumns.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || '列データの抽出に失敗しました'
      })
      // parseAttendanceTableData
      .addCase(parseAttendanceTableData.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(parseAttendanceTableData.fulfilled, (state, action) => {
        state.loading = false
        state.parsedData = action.payload
        state.error = null
      })
      .addCase(parseAttendanceTableData.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'テーブルのパースに失敗しました'
      })
      // fetchAndExtractAttendanceData
      .addCase(fetchAndExtractAttendanceData.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAndExtractAttendanceData.fulfilled, (state, action) => {
        state.loading = false
        state.tableData = action.payload.tableData
        state.extractedData = action.payload.extractedData
        state.metadata.facility_id = action.payload.tableData.facility_id
        state.metadata.date_str = action.payload.tableData.date_str
        state.metadata.extractedAt = new Date().toISOString()
        state.error = action.payload.extractError || null
      })
      .addCase(fetchAndExtractAttendanceData.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'データの取得・抽出に失敗しました'
      })
  }
})

// アクションのエクスポート
export const { clearAttendanceData, clearError, setTableData, setExtractedData } = attendanceSlice.actions

// セレクターのエクスポート
export const selectAttendanceTableData = (state) => state.attendance.tableData
export const selectExtractedData = (state) => state.attendance.extractedData
export const selectParsedData = (state) => state.attendance.parsedData
export const selectAttendanceLoading = (state) => state.attendance.loading
export const selectAttendanceError = (state) => state.attendance.error
export const selectAttendanceMetadata = (state) => state.attendance.metadata
export const selectAttendanceState = (state) => state.attendance

// リデューサーのエクスポート
export default attendanceSlice.reducer

