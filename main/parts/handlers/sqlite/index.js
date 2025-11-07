// main/parts/handlers/sqlite/index.js
const { prepareDatabasePath } = require('./database/dbInitializer');
const { connectDatabase, closeDatabase } = require('./database/connectionManager');
const { initAllTables } = require('./database/schemaManager');
const TempNoteService = require('./tempNoteService');

async function initSQLiteHandler() {
  console.log('🚀 [initSQLiteHandler] 初期化開始');

  try {
    // データベースファイルを準備
    const dbPath = prepareDatabasePath();

    // 接続
    const db = await connectDatabase(dbPath);

    // 全テーブルを初期化
    await initAllTables(db);

    // サービス層を準備
    const service = new TempNoteService(db);

    console.log('✅ [initSQLiteHandler] 初期化完了');
    return {
      success: true,
      db,
      service,
      close: () => closeDatabase(db),
    };

  } catch (error) {
    console.error('❌ [initSQLiteHandler] 初期化エラー:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

module.exports = { initSQLiteHandler };
