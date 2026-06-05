// main/parts/handlers/mariadbHandler.js
const apiClient = require("../../../src/apiClient");
const {
  upsertServiceRecord,
} = require("./mariadb/UpsertServiceRecord");

/**
 * pk / values を MariaDB API 用に正規化
 * - 配列 → CSV
 * - 文字列 → そのまま
 */
function normalizePkValues(pk, values) {
  const normalizedPk = Array.isArray(pk) ? pk.join(",") : pk;
  const normalizedValues = Array.isArray(values)
    ? values.join(",")
    : values;

  if (!normalizedPk || !normalizedValues) {
    throw new Error("pk / values が不正です");
  }

  return {
    pk: normalizedPk,
    values: normalizedValues,
  };
}

function registerMariadbHandlers(ipcMain) {
  console.log("🔥 registerMariadbHandlers (mariadb) CALLED");

  const tables = [
    "children",
    "staffs",
    "facilitys",
    "facility_children",
    "facility_staff",
    "managers2",
    "pc",
    "pc_to_children",
    "individual_support",
    "pronunciation",
    "children_type",
    "day_of_week",
    "service_record",
  ];

  for (const table of tables) {
    // --------------------
    // GET ALL
    // --------------------
    ipcMain.handle(`mariadb:${table}:getAll`, async () => {
      return apiClient.get(table);
    });

    // --------------------
    // GET BY PK（単一 / 複合対応）
    // --------------------
    ipcMain.handle(
      `mariadb:${table}:getByPk`,
      async (_, { pk, values }) => {
        const params = normalizePkValues(pk, values);

        return apiClient.get(`${table}/search`, {
          params,
        });
      }
    );

    // --------------------
    // INSERT
    // --------------------
    ipcMain.handle(`mariadb:${table}:insert`, async (_, data) => {
      return apiClient.post(table, data);
    });

    // --------------------
    // UPDATE（単一 / 複合対応）
    // --------------------
    ipcMain.handle(
      `mariadb:${table}:update`,
      async (_, { pk, values, data }) => {
        const params = normalizePkValues(pk, values);

        return apiClient.put(table, data, {
          params,
        });
      }
    );

    // --------------------
    // DELETE（単一 / 複合対応）
    // --------------------
    ipcMain.handle(
      `mariadb:${table}:delete`,
      async (_, { pk, values }) => {
        const params = normalizePkValues(pk, values);

        return apiClient.delete(table, {
          params,
        });
      }
    );
  }

  ipcMain.handle("mariadb:service_record:upsert", async (_, data) => {
    return upsertServiceRecord(data);
  });
}

module.exports = { registerMariadbHandlers };
