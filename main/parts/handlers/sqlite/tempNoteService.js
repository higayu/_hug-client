// main/parts/handlers/sqlite/tempNoteService.js

class TempNoteService {
  constructor(db) {
    this.db = db;
  }

  // 一時メモを保存
  async saveTempNote({ childId, staffId, dateStr, weekDay, enterTime, exitTime, memo }) {
    return new Promise((resolve, reject) => {
      const sql = `
        INSERT OR REPLACE INTO temp_notes 
        (children_id, staff_id, date_str, week_day, enter_time, exit_time, memo, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `;
      this.db.run(sql, [childId, staffId, dateStr, weekDay, enterTime, exitTime, memo], function (err) {
        if (err) {
          console.error('❌ [TempNoteService] saveTempNote エラー:', err);
          reject({ success: false, error: err.message });
        } else {
          console.log(`✅ [TempNoteService] 保存成功: child=${childId}, day=${weekDay}`);
          resolve({ success: true, id: this.lastID });
        }
      });
    });
  }

  // 一時メモを取得
  async getTempNote({ childId, weekDay }) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM temp_notes WHERE children_id = ? AND week_day = ?`;
      this.db.get(sql, [childId, weekDay], (err, row) => {
        if (err) {
          console.error('❌ [TempNoteService] getTempNote エラー:', err);
          reject({ success: false, error: err.message });
        } else {
          resolve({ success: true, data: row || null });
        }
      });
    });
  }

  // 児童一覧を取得
  async getChildren() {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM Children WHERE is_delete = 0 ORDER BY id`;
      this.db.all(sql, (err, rows) => {
        if (err) {
          console.error('❌ [TempNoteService] getChildren エラー:', err);
          reject({ success: false, error: err.message });
        } else {
          resolve({ success: true, data: rows });
        }
      });
    });
  }

  // スタッフ一覧を取得
  async getStaffs() {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM staffs WHERE is_delete = 0 ORDER BY id`;
      this.db.all(sql, (err, rows) => {
        if (err) {
          console.error('❌ [TempNoteService] getStaffs エラー:', err);
          reject({ success: false, error: err.message });
        } else {
          resolve({ success: true, data: rows });
        }
      });
    });
  }
}

module.exports = TempNoteService;
