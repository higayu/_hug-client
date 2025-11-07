// main/parts/handlers/apiHandler.js
const fs = require("fs");
const path = require("path");
const { app } = require("electron");
const apiClient = require("../../../src/apiClient");
const { registerSqliteHandlers } = require("./sqliteHandler");
const sqlite3 = require("sqlite3").verbose(); // ← ここで一括読み込み

function resolveIniPath() {
  if (app.isPackaged) {
    return path.join(app.getPath("userData"), "data", "ini.json");
  } else {
    return path.join(__dirname, "../../data/ini.json");
  }
}

function getDatabaseType() {
  try {
    const iniPath = resolveIniPath();
    if (!fs.existsSync(iniPath)) {
      console.log("⚠️ ini.jsonが見つかりません。デフォルト（SQLite）を使用します");
      return "sqlite";
    }
    const iniData = JSON.parse(fs.readFileSync(iniPath, "utf8"));
    const dbType = iniData?.apiSettings?.databaseType || "sqlite";
    return dbType.toLowerCase();
  } catch (err) {
    console.error("⚠️ ini.jsonの読み込みに失敗:", err.message);
    return "sqlite";
  }
}

// ============================================================
// 🧩 メイン関数
// ============================================================
async function handleApiCalls(ipcMain) {
  const DB_TYPE = getDatabaseType();
  console.log(`⚙️ 現在のDBモード: ${DB_TYPE}`);

  // ============================================================
  // 📘 getStaffAndFacility
  // ============================================================
  ipcMain.handle("getStaffAndFacility", async () => {
    try {
      if (DB_TYPE === "mariadb") {
        const staffAndFacility = await apiClient.getStaffAndFacility();
        const staffs = await apiClient.fetchStaff();
        const facilitys = await apiClient.getFacilitys();
        return { staffAndFacility, staffs, facilitys };
      }

      // ----- SQLite -----
      const dbPath = path.join(__dirname, "../../data/houday.db");
      const db = new sqlite3.Database(dbPath);

      return await new Promise((resolve, reject) => {
        const result = {};
        db.serialize(() => {
          db.all("SELECT * FROM staffs", (err, staffs) => {
            if (err) return reject(err);
            result.staffs = staffs;

            db.all("SELECT * FROM facilitys", (err, facilitys) => {
              if (err) return reject(err);
              result.facilitys = facilitys;

              const sql = `
                SELECT f.name AS facility_name, s.name AS staff_name
                FROM facility_staff fs
                INNER JOIN facilitys f ON fs.facility_id = f.id
                INNER JOIN staffs s ON fs.staff_id = s.id
              `;
              db.all(sql, (err, staffAndFacility) => {
                if (err) return reject(err);
                result.staffAndFacility = staffAndFacility;
                db.close();
                resolve(result);
              });
            });
          });
        });
      });
    } catch (err) {
      console.error("❌ getStaffAndFacility失敗:", err.message);
      throw err;
    }
  });

  // ============================================================
  // 🔹 getDatabaseType IPCハンドラー
  // ============================================================
  ipcMain.handle("get-database-type", async () => {
    try {
      const dbType = getDatabaseType();
      return dbType;
    } catch (err) {
      console.error("❌ getDatabaseType失敗:", err.message);
      return "sqlite";
    }
  });


  // ============================================================
  // 📗 SQLite CRUD IPC登録
  // ============================================================
  if (DB_TYPE === "sqlite") {
    registerSqliteHandlers(ipcMain);
  }

  console.log("✅ APIハンドラ登録完了");
}

module.exports = { handleApiCalls };
