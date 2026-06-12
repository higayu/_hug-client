// preload/tableApis.js
const { tables } = require("./tables");

function createTableApis(ipcRenderer) {
  const tableAPIs = {};

  for (const table of tables) {
    // ---------- SQLite ----------
    tableAPIs[`sqlite_${table}_getAll`] = () =>
      ipcRenderer.invoke(`sqlite:${table}:getAll`);

    tableAPIs[`sqlite_${table}_getById`] = (id) =>
      ipcRenderer.invoke(`sqlite:${table}:getById`, id);

    tableAPIs[`sqlite_${table}_insert`] = (data) =>
      ipcRenderer.invoke(`sqlite:${table}:insert`, data);

    tableAPIs[`sqlite_${table}_update`] = (dataOrId, maybeData) =>
      ipcRenderer.invoke(`sqlite:${table}:update`, dataOrId, maybeData);

    tableAPIs[`sqlite_${table}_delete`] = (...args) =>
      ipcRenderer.invoke(`sqlite:${table}:delete`, ...args);

    // ---------- MariaDB ----------
    tableAPIs[`mariadb_${table}_getAll`] = () =>
      ipcRenderer.invoke(`mariadb:${table}:getAll`);

    tableAPIs[`mariadb_${table}_getById`] = (id) =>
      ipcRenderer.invoke(`mariadb:${table}:getById`, id);

    tableAPIs[`mariadb_${table}_insert`] = (data) =>
      ipcRenderer.invoke(`mariadb:${table}:insert`, data);

    tableAPIs[`mariadb_${table}_update`] = (dataOrId, maybeData) =>
      ipcRenderer.invoke(`mariadb:${table}:update`, dataOrId, maybeData);

    tableAPIs[`mariadb_${table}_delete`] = (...args) =>
      ipcRenderer.invoke(`mariadb:${table}:delete`, ...args);
  }

  return tableAPIs;
}

module.exports = {
  createTableApis,
};