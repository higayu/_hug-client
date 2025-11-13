// src/sql/mariadbApi.js
export const mariadbApi = {
  async getAllTables() {
    return await window.electronAPI.fetchTableAll();
  },
};
