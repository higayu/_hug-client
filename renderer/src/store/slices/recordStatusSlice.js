import { createSlice } from "@reduxjs/toolkit";

const createEmptyPersonalRecordStatus = () => ({
  registered: null,
  recordCount: null,
  checkedAt: null,
  error: null,
});

const createEmptyProfessionalSupportStatus = () => ({
  registered: null,
  recordCount: null,
  useDays: null,
  useDaysDisplayKind: null,
  lastUseDaysResult: null,
  checkedAt: null,
  error: null,
});

const initialState = {
  byDate: {},
};

const ensureChildStatus = (state, ymd, childId) => {
  const dateKey = String(ymd || "");
  const childKey = String(childId || "");

  if (!dateKey || !childKey) return null;

  if (!state.byDate[dateKey]) {
    state.byDate[dateKey] = {};
  }

  if (!state.byDate[dateKey][childKey]) {
    state.byDate[dateKey][childKey] = {
      personalRecord: createEmptyPersonalRecordStatus(),
      professionalSupport: createEmptyProfessionalSupportStatus(),
    };
  }

  if (!state.byDate[dateKey][childKey].personalRecord) {
    state.byDate[dateKey][childKey].personalRecord =
      createEmptyPersonalRecordStatus();
  }

  if (!state.byDate[dateKey][childKey].professionalSupport) {
    state.byDate[dateKey][childKey].professionalSupport =
      createEmptyProfessionalSupportStatus();
  }

  return state.byDate[dateKey][childKey];
};

const recordStatusSlice = createSlice({
  name: "recordStatus",
  initialState,
  reducers: {
    setPersonalRecordStatus: (state, action) => {
      const {
        ymd,
        childId,
        registered,
        recordCount = null,
        checkedAt = new Date().toISOString(),
        error = null,
      } = action.payload || {};

      const childStatus = ensureChildStatus(state, ymd, childId);
      if (!childStatus) return;

      childStatus.personalRecord = {
        registered,
        recordCount,
        checkedAt,
        error,
      };
    },

    setProfessionalSupportStatus: (state, action) => {
      const {
        ymd,
        childId,
        registered,
        recordCount = null,
        useDays = null,
        useDaysDisplayKind = null,
        lastUseDaysResult = null,
        checkedAt = new Date().toISOString(),
        error = null,
      } = action.payload || {};

      const childStatus = ensureChildStatus(state, ymd, childId);
      if (!childStatus) return;

      childStatus.professionalSupport = {
        registered,
        recordCount,
        useDays,
        useDaysDisplayKind,
        lastUseDaysResult,
        checkedAt,
        error,
      };
    },

    setRecordStatusError: (state, action) => {
      const {
        ymd,
        childId,
        kind,
        error,
        checkedAt = new Date().toISOString(),
      } = action.payload || {};

      const childStatus = ensureChildStatus(state, ymd, childId);
      if (!childStatus) return;

      if (kind !== "personalRecord" && kind !== "professionalSupport") {
        return;
      }

      childStatus[kind] = {
        ...childStatus[kind],
        checkedAt,
        error: error || "取得に失敗しました",
      };
    },

    clearChildRecordStatus: (state, action) => {
      const { ymd, childId } = action.payload || {};
      const dateKey = String(ymd || "");
      const childKey = String(childId || "");

      if (!dateKey || !childKey) return;
      if (!state.byDate[dateKey]) return;

      delete state.byDate[dateKey][childKey];
    },

    clearDateRecordStatus: (state, action) => {
      const { ymd } = action.payload || {};
      const dateKey = String(ymd || "");

      if (!dateKey) return;

      delete state.byDate[dateKey];
    },

    clearAllRecordStatus: () => initialState,
  },
});

export const {
  setPersonalRecordStatus,
  setProfessionalSupportStatus,
  setRecordStatusError,
  clearChildRecordStatus,
  clearDateRecordStatus,
  clearAllRecordStatus,
} = recordStatusSlice.actions;

export const selectRecordStatusState = (state) => state.recordStatus;

export const selectRecordStatusByDate = (state, ymd) => {
  return state.recordStatus.byDate?.[ymd] ?? {};
};

export const selectChildRecordStatus = (state, ymd, childId) => {
  if (!ymd || !childId) return null;

  return state.recordStatus.byDate?.[ymd]?.[String(childId)] ?? null;
};

export const selectPersonalRecordStatus = (state, ymd, childId) => {
  return (
    selectChildRecordStatus(state, ymd, childId)?.personalRecord ??
    createEmptyPersonalRecordStatus()
  );
};

export const selectProfessionalSupportStatus = (state, ymd, childId) => {
  return (
    selectChildRecordStatus(state, ymd, childId)?.professionalSupport ??
    createEmptyProfessionalSupportStatus()
  );
};

export default recordStatusSlice.reducer;