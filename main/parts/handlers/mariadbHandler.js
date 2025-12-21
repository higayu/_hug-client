// main/parts/handlers/mariadbHandler.js

const apiClient = require("../../../src/apiClient");

/**
 * MariaDB 用 IPC ハンドラ登録
 * SQLite と同一インターフェースを提供する（mariadb: プレフィックス）
 */
function registerMariadbHandlers(ipcMain) {
  console.log("🔥 registerMariadbHandlers (mariadb) CALLED");

  const tables = {
    children: createCrudHandlers("children"),
    staffs: createCrudHandlers("staffs"),
    facilitys: createCrudHandlers("facilitys"),
    facility_children: createCrudHandlers("facility_children"),
    facility_staff: createCrudHandlers("facility_staff"),
    managers2: createCrudHandlers("managers2"),
    pc: createCrudHandlers("pc"),
    pc_to_children: createCrudHandlers("pc_to_children"),
    individual_support: createCrudHandlers("individual_support"),
    pronunciation: createCrudHandlers("pronunciation"),
    children_type: createCrudHandlers("children_type"),
  };

  for (const [table, handler] of Object.entries(tables)) {
    if (handler.getAll) {
      ipcMain.handle(`mariadb:${table}:getAll`, async () =>
        handler.getAll()
      );
    }

    if (handler.getById) {
      ipcMain.handle(`mariadb:${table}:getById`, async (_, id) =>
        handler.getById(id)
      );
    }

    if (handler.insert) {
      ipcMain.handle(`mariadb:${table}:insert`, async (_, data) =>
        handler.insert(data)
      );
    }

    if (handler.update) {
      ipcMain.handle(
        `mariadb:${table}:update`,
        async (_, idOrData, maybeData) => {
          if (maybeData !== undefined) {
            return handler.update(idOrData, maybeData);
          } else {
            return handler.update(idOrData);
          }
        }
      );
    }

    if (handler.delete) {
      ipcMain.handle(`mariadb:${table}:delete`, async (_, ...args) =>
        handler.delete(...args)
      );
    }
  }
}

/**
 * MariaDB CRUD ハンドラ生成
 * SQLite の module API に合わせる
 */
function createCrudHandlers(table) {
  return {
    // 全件取得
    async getAll() {
      return apiClient.get(table);
    },

    // ID指定取得
    async getById(id) {
      return apiClient.get(`${table}/search`, {
        params: {
          pk: "id",
          values: id,
        },
      });
    },

    // INSERT
    async insert(data) {
      return apiClient.post(table, data);
    },

    // UPDATE
    async update(idOrData, maybeData) {
      let data;
      let pk;
      let values;

      if (maybeData !== undefined) {
        data = maybeData;
        pk = "id";
        values = idOrData;
      } else {
        data = idOrData;
        if (!data.id) {
          throw new Error(`update(${table}): id が必要です`);
        }
        pk = "id";
        values = data.id;
      }

      return apiClient.put(table, data, {
        params: { pk, values },
      });
    },

    // DELETE
    async delete(...args) {
      if (args.length === 1) {
        return apiClient.delete(table, {
          params: { pk: "id", values: args[0] },
        });
      }

      if (args.length === 2) {
        const [pk, values] = args;
        return apiClient.delete(table, {
          params: { pk, values },
        });
      }

      throw new Error(`delete(${table}): 引数が不正です`);
    },
  };
}

module.exports = { registerMariadbHandlers };
