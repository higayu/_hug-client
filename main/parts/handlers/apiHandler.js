// main/parts/handlers/apiHandler.js
const fs = require("fs");
const path = require("path");
const apiClient = require("../../../src/apiClient");
const { getWaitingChildrenPc } = require("./sqlite/getWaitingChildrenPc");
const { getExperienceChildrenV } = require("./sqlite/getExperienceChildrenV");
// === ここを追加 ===
const { initSQLiteHandler } = require("./sqlite/index");
const { getChildrenByStaffAndDay } = require("./sqlite/getChildrenByStaffAndDay");


// ✅ 設定ファイルからDB種別を取得
function getDatabaseType() {
  try {
    const iniPath = path.join(__dirname, "../../data/ini.json");
    const iniData = JSON.parse(fs.readFileSync(iniPath, "utf8"));
    const dbType = iniData?.apiSettings?.databaseType || "sqlite";
    return dbType.toLowerCase();
  } catch (err) {
    console.error("⚠️ ini.jsonの読み込みに失敗:", err.message);
    return "sqlite";
  }
}

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
      const { success, db, close, service } = await initSQLiteHandler();
      if (!success) throw new Error("SQLite初期化に失敗しました");

      const staffs = await service.getStaffs();
      const facilitys = await new Promise((resolve, reject) => {
        db.all("SELECT * FROM facilitys", (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });

      const staffAndFacility = await new Promise((resolve, reject) => {
        db.all(
          `SELECT f.name AS facility_name, s.name AS staff_name
           FROM facility_staff fs
           INNER JOIN facilitys f ON fs.facility_id = f.id
           INNER JOIN staffs s ON fs.staff_id = s.id`,
          (err, rows) => (err ? reject(err) : resolve(rows))
        );
      });

      close();
      return { staffAndFacility, staffs: staffs.data, facilitys };
    } catch (err) {
      console.error("❌ getStaffAndFacility失敗:", err.message);
      throw err;
    }
  });

  // === GetChildrenByStaffAndDay ハンドラー ===
  ipcMain.handle("GetChildrenByStaffAndDay", async (event, args) => {
    try {
      // ✅ 第一引数は event、第二引数はオブジェクトで渡ってくる
      const { staffId, date, facility_id } = args || {};
      console.log("📡 [MAIN] GetChildrenByStaffAndDay:", { staffId, date, facility_id });

      // ✅ SQLiteを初期化
      const { success, db, error } = await initSQLiteHandler();
      if (!success || !db) {
        console.error("❌ SQLite初期化失敗:", error);
        return { success: false, error: "データベース初期化に失敗しました" };
      }

      // ✅ ここは staffId, date のみを渡す
      const result = await getChildrenByStaffAndDay(db, staffId, date);

      return { success: true, week_children: result };
    } catch (err) {
      console.error("❌ GetChildrenByStaffAndDay エラー:", err);
      return { success: false, error: err.message };
    }
  });

}

module.exports = { handleApiCalls };
