const path = require('path');
const fs = require('fs');
const os = require('os');

function prepareDatabasePath() {
  console.log('🚀 [dbInitializer] データベースパス初期化');

  const isDev = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
  let dataDir;

  if (isDev) {
    dataDir = path.join(__dirname, '../../../data');
  } else {
    const possiblePaths = [
      path.join(process.resourcesPath, 'data'),
      path.join(process.env.APPDATA || process.env.HOME || process.env.USERPROFILE || process.cwd(), 'HugClient', 'data'),
      path.join(process.cwd(), 'data'),
      path.join(os.tmpdir(), 'hug-client', 'data')
    ];
    dataDir = possiblePaths.find(fs.existsSync) || possiblePaths[0];
  }

  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const dbPath = path.join(dataDir, 'houday.db');
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, '');
  }

  return dbPath;
}

module.exports = { prepareDatabasePath };
