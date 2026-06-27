// main/parts/handlers/mariadbHandler/index.js

const apiClient = require("../../../../src/apiClient");

const {
  upsertServiceRecord,
} = require("./mariadb/UpsertServiceRecord");

const {
  syncHugStaffs,
} = require("./mariadb/SyncHugStaffs");

const {
  upsertTempNote,
  upsertTempNote1,
  upsertTempNote2,
  getTempNote,
} = require("./mariadb/UpsertTempNote");

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

    // SQLite 側に任せていた一時メモを MariaDB 側でも使う
    "temp_notes",
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

        return apiClient.get(`${table}/_search`, {
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

  // ============================================================
  // service_record 専用 upsert
  // ============================================================
  ipcMain.handle("mariadb:service_record:upsert", async (_, data) => {
    return upsertServiceRecord(data);
  });

  // ============================================================
  // temp_notes 専用 handler
  // SQLite 側の saveTempNote / saveTempNote1 / saveTempNote2 / getTempNote と対応
  // ============================================================

  ipcMain.handle("mariadb:temp_notes:upsert", async (_, data) => {
    return upsertTempNote(data);
  });

  ipcMain.handle("mariadb:saveTempNote", async (_, data) => {
    return upsertTempNote(data);
  });

  ipcMain.handle("mariadb:saveTempNote1", async (_, data) => {
    return upsertTempNote1(data);
  });

  ipcMain.handle("mariadb:saveTempNote2", async (_, data) => {
    return upsertTempNote2(data);
  });

  ipcMain.handle("mariadb:getTempNote", async (_, data) => {
    const result = await getTempNote(data);
    return { success: true, data: result };
  });

  // ============================================================
  // HUG staffs sync
  // ============================================================
  ipcMain.handle("mariadb:hug_staffs:sync", async (_, data) => {
    return syncHugStaffs(data);
  });
}

module.exports = { registerMariadbHandlers };