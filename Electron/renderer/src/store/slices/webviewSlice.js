import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currentUrl: "",
};

const webviewSlice = createSlice({
  name: "webview",
  initialState,
  reducers: {
    setCurrentUrl(state, action) {
      state.currentUrl = action.payload || "";
    },
    clearCurrentUrl(state) {
      state.currentUrl = "";
    },
  },
});

export const {
  setCurrentUrl,
  clearCurrentUrl,
} = webviewSlice.actions;

export default webviewSlice.reducer;
