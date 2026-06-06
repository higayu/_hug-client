import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  facilities: [],
  childrenByFacility: {},
  selectedFacilityId: '',
  selectedChildId: '',
}

const facilitySlice = createSlice({
  name: 'facility',
  initialState,
  reducers: {
    setFacilities: (state, action) => {
      state.facilities = action.payload
    },
    setChildrenByFacility: (state, action) => {
      state.childrenByFacility = action.payload
    },
    setSelectedFacilityId: (state, action) => {
      state.selectedFacilityId = action.payload
    },
    setSelectedChildId: (state, action) => {
      state.selectedChildId = action.payload
    },
  },
})

export const {
  setFacilities,
  setChildrenByFacility,
  setSelectedFacilityId,
  setSelectedChildId,
} = facilitySlice.actions
export default facilitySlice.reducer
