import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  activePage: 'chat',
  sidebarOpen: false,
  sidePanelTab: 'attendance',
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setActivePage: (state, action) => {
      state.activePage = action.payload
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload
    },
    setSidePanelTab: (state, action) => {
      state.sidePanelTab = action.payload
    },
  },
})

export const { setActivePage, setSidebarOpen, setSidePanelTab } = uiSlice.actions
export default uiSlice.reducer
