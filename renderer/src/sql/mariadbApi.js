// src/api/mariadbApi.js
export const mariadbApi = {
    async getChildrenByStaffAndDay({ staffId, date, facility_id }) {
      return await window.electronAPI.GetChildrenByStaffAndDay({
        staffId,
        date,
        facility_id
      });
    },
  
    async getStaffAndFacility() {
      return await window.electronAPI.getStaffAndFacility();
    }
  };
  