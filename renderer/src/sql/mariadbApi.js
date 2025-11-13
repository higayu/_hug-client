// src/sql/mariadbApi.js
export const mariadbApi = {
  async getChildrenByStaffAndDay({ staffId, date, facility_id }) {
    return await window.electronAPI.GetChildrenByStaffAndDay({
      staffId,
      date,
      facility_id
    });
  },



  async getAllTables() {
    return await window.electronAPI.fetchTableAll();
  },
};
