// preload/tableApis.js
const { sqliteTables, mariadbTables } = require("./tables");

function createTableApis(ipcRenderer) {
  const tableAPIs = {};

  // ---------- SQLite ----------
  for (const table of sqliteTables) {
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

    tableAPIs[`sqlite_${table}_upsert`] = (data) =>
      ipcRenderer.invoke(`sqlite:${table}:upsert`, data);
  }

  // ---------- MariaDB ----------
  for (const table of mariadbTables) {
    tableAPIs[`mariadb_${table}_getAll`] = () =>
      ipcRenderer.invoke(`mariadb:${table}:getAll`);

    /**
     * 単一PK用
     * 例: mariadb_children_getById(92)
     */
    tableAPIs[`mariadb_${table}_getById`] = (id, pk = "id") =>
      ipcRenderer.invoke(`mariadb:${table}:getByPk`, {
        pk,
        values: id,
      });

    /**
     * 複合PK用
     * 例:
     * mariadb_temp_notes_getByPk({
     *   pk: ["children_id", "staff_id", "day_of_week_id"],
     *   values: [92, 73, 6],
     * })
     */
    tableAPIs[`mariadb_${table}_getByPk`] = ({ pk, values }) =>
      ipcRenderer.invoke(`mariadb:${table}:getByPk`, {
        pk,
        values,
      });

    tableAPIs[`mariadb_${table}_insert`] = (data) =>
      ipcRenderer.invoke(`mariadb:${table}:insert`, data);

    tableAPIs[`mariadb_${table}_update`] = ({ pk, values, data }) =>
      ipcRenderer.invoke(`mariadb:${table}:update`, {
        pk,
        values,
        data,
      });

    tableAPIs[`mariadb_${table}_delete`] = ({ pk, values }) =>
      ipcRenderer.invoke(`mariadb:${table}:delete`, {
        pk,
        values,
      });

    tableAPIs[`mariadb_${table}_upsert`] = (data) =>
      ipcRenderer.invoke(`mariadb:${table}:upsert`, data);
  }

  return tableAPIs;
}

module.exports = {
  createTableApis,
};