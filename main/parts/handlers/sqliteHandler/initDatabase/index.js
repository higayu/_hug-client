// main/parts/handlers/sqliteHandler/initDatabase/index.js

const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const { getDbPath } = require("../../../utils/pathResolver");

const { execSql } = require("./helpers");
const { INIT_SQL } = require("./schema");
const {
  migrateLegacyDayOfWeekIfNeeded,
} = require("./migrations/migrateLegacyDayOfWeek");
const {
  migrateExistingDatabase,
} = require("./migrations/migrateExistingDatabase");
const {
  migrateManagers2ToFacilitySchema,
} = require("./migrations/migrateManagers2ToFacilitySchema");
const { createIndexes } = require("./indexes");
const { seedDayOfWeek } = require("./seeds/seedDayOfWeek");

/**
 * SQLite データベース初期化
 */
function initializeDatabase() {
  const dbPath = getDbPath();
  const dir = path.dirname(dbPath);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const db = new sqlite3.Database(dbPath);

  db.serialize(() => {
    (async () => {
      try {
        await execSql(
          db,
          `
            PRAGMA journal_mode = WAL;
            PRAGMA foreign_keys = OFF;
          `
        );

        await migrateLegacyDayOfWeekIfNeeded(db);
        await execSql(db, INIT_SQL);
        await migrateExistingDatabase(db);
        await migrateManagers2ToFacilitySchema(db);
        await createIndexes(db);
        await seedDayOfWeek(db);

        console.log("[initDatabase] database initialized:", dbPath);
      } catch (err) {
        console.error("[initDatabase] error:", err);
      } finally {
        db.close((closeErr) => {
          if (closeErr) {
            console.error("[initDatabase] DB close error:", closeErr);
          }
        });
      }
    })();
  });
}

module.exports = { initializeDatabase };