// main/parts/handlers/sqliteHandler/initDatabase/helpers.js

function execSql(db, sql) {
    return new Promise((resolve, reject) => {
      db.exec(sql, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  }
  
  function runSql(db, sql, params = []) {
    return new Promise((resolve, reject) => {
      db.run(sql, params, function (err) {
        if (err) return reject(err);
        resolve(this);
      });
    });
  }
  
  function allSql(db, sql, params = []) {
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });
  }
  
  async function tryRunSql(db, sql, label) {
    try {
      await runSql(db, sql);
    } catch (err) {
      console.warn(`[initDatabase] ${label} skipped:`, err.message);
    }
  }
  
  function quoteIdent(name) {
    return `"${String(name).replace(/"/g, '""')}"`;
  }
  
  async function tableExists(db, tableName) {
    const rows = await allSql(
      db,
      `
        SELECT name
        FROM sqlite_master
        WHERE type = 'table'
          AND name = ?
        LIMIT 1
      `,
      [tableName]
    );
  
    return rows.length > 0;
  }
  
  async function getColumns(db, tableName) {
    const rows = await allSql(
      db,
      `PRAGMA table_info(${quoteIdent(tableName)})`
    );
  
    return rows.map((row) => row.name);
  }
  
  async function getTableInfo(db, tableName) {
    return allSql(db, `PRAGMA table_info(${quoteIdent(tableName)})`);
  }
  
  async function ensureColumn(db, tableName, columnName, columnDefinition) {
    const exists = await tableExists(db, tableName);
    if (!exists) return;
  
    const columns = await getColumns(db, tableName);
    if (columns.includes(columnName)) return;
  
    await runSql(
      db,
      `ALTER TABLE ${quoteIdent(tableName)} ADD COLUMN ${columnDefinition}`
    );
  }
  
  module.exports = {
    execSql,
    runSql,
    allSql,
    tryRunSql,
    quoteIdent,
    tableExists,
    getColumns,
    getTableInfo,
    ensureColumn,
  };