// src/store/slices/attendanceSlice.js
// 利用者データテーブルの状態管理

import { createSlice } from "@reduxjs/toolkit";

// 初期状態
const initialState = {
  // 取得したHTMLテーブルなどの元データ
  tableData: null,

  // 抽出された列データ
  extractedData: null,

  // パース済みデータ
  parsedData: null,

  // ローディング状態
  loading: false,

  // エラー状態
  error: null,

  // メタデータ
  metadata: {
    facility_id: null,
    date_str: null,
    extractedAt: null,
  },
};

const attendanceSlice = createSlice({
  name: "attendance",
  initialState,
  reducers: {
    // 状態をクリア
    clearAttendanceData: (state) => {
      state.tableData = null;
      state.extractedData = null;
      state.parsedData = null;
      state.loading = false;
      state.error = null;
      state.metadata = {
        facility_id: null,
        date_str: null,
        extractedAt: null,
      };
    },

    // エラーをクリア
    clearError: (state) => {
      state.error = null;
    },

    // ローディング状態を設定
    setAttendanceLoading: (state, action) => {
      state.loading = Boolean(action.payload);
    },

    // エラーを設定
    setAttendanceError: (state, action) => {
      state.error = action.payload || null;
    },

    // テーブルデータを直接設定
    setTableData: (state, action) => {
      state.tableData = action.payload;
      state.error = null;

      if (action.payload) {
        state.metadata.facility_id =
          action.payload.facility_id ?? action.payload.facilityId ?? null;

        state.metadata.date_str =
          action.payload.date_str ?? action.payload.dateStr ?? null;
      }
    },

    // 抽出データを直接設定
    setExtractedData: (state, action) => {
      state.extractedData = action.payload;
      state.error = null;

      if (action.payload) {
        state.metadata.extractedAt = new Date().toISOString();
      }
    },

    // パース済みデータを直接設定
    setParsedData: (state, action) => {
      state.parsedData = action.payload;
      state.error = null;
    },

    // まとめて保存したい場合用
    setAttendanceData: (state, action) => {
      const payload = action.payload || {};

      state.tableData = payload.tableData ?? state.tableData;
      state.extractedData = payload.extractedData ?? state.extractedData;
      state.parsedData = payload.parsedData ?? state.parsedData;
      state.error = payload.error ?? null;

      state.metadata.facility_id =
        payload.facility_id ??
        payload.facilityId ??
        payload.tableData?.facility_id ??
        payload.tableData?.facilityId ??
        state.metadata.facility_id;

      state.metadata.date_str =
        payload.date_str ??
        payload.dateStr ??
        payload.tableData?.date_str ??
        payload.tableData?.dateStr ??
        state.metadata.date_str;

      state.metadata.extractedAt =
        payload.extractedAt ??
        payload.extractedData?.extractedAt ??
        state.metadata.extractedAt ??
        new Date().toISOString();
    },
  },
});

// アクションのエクスポート
export const {
  clearAttendanceData,
  clearError,
  setAttendanceLoading,
  setAttendanceError,
  setTableData,
  setExtractedData,
  setParsedData,
  setAttendanceData,
} = attendanceSlice.actions;

// セレクターのエクスポート
export const selectAttendanceTableData = (state) => state.attendance.tableData;
export const selectExtractedData = (state) => state.attendance.extractedData;
export const selectParsedData = (state) => state.attendance.parsedData;
export const selectAttendanceLoading = (state) => state.attendance.loading;
export const selectAttendanceError = (state) => state.attendance.error;
export const selectAttendanceMetadata = (state) => state.attendance.metadata;
export const selectAttendanceState = (state) => state.attendance;

// リデューサーのエクスポート
export default attendanceSlice.reducer;