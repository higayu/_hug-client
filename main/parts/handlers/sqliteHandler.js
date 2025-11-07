// main/parts/handlers/sqliteHandler.js
const {
  children,
  staffs,
  facilitys,
  managers,
  pc,
  pc_to_children,
  individual_support,
  temp_notes,
  pronunciation,     // ✅ ← 追加
  children_type,     // ✅ ← 追加
} = {
  children: require("./sqlite/children"),
  staffs: require("./sqlite/staffs"),
  facilitys: require("./sqlite/facilitys"),
  managers: require("./sqlite/managers"),
  pc: require("./sqlite/pc"),
  pc_to_children: require("./sqlite/pc_to_children"),
  individual_support: require("./sqlite/individual_support"),
  temp_notes: require("./sqlite/temp_notes"),
  pronunciation: require("./sqlite/pronunciation"),   // ✅ ← 追加
  children_type: require("./sqlite/children_type"),   // ✅ ← 追加
};

function registerSqliteHandlers(ipcMain) {
  const tables = {
    children,
    staffs,
    facilitys,
    managers,
    pc,
    pc_to_children,
    individual_support,
    temp_notes,
    pronunciation,   // ✅ ← 追加
    children_type,   // ✅ ← 追加
  };

  for (const [table, handler] of Object.entries(tables)) {
    if (handler.getAll)
      ipcMain.handle(`${table}:getAll`, async () => await handler.getAll());
    if (handler.getById)
      ipcMain.handle(`${table}:getById`, async (_, id) => await handler.getById(id));
    if (handler.insert)
      ipcMain.handle(`${table}:insert`, async (_, data) => await handler.insert(data));
    if (handler.update)
      ipcMain.handle(`${table}:update`, async (_, idOrData, maybeData) => {
        if (maybeData !== undefined) return await handler.update(idOrData, maybeData);
        else return await handler.update(idOrData);
      });
    if (handler.delete)
      ipcMain.handle(`${table}:delete`, async (_, ...args) => await handler.delete(...args));
  }

  console.log("✅ SQLite CRUD IPCハンドラ登録完了");
}

module.exports = { registerSqliteHandlers };
