// main/parts/handlers/sqlite/temp_notes.js
const { connect } = require("./base");

module.exports = {
  // =====================================
  // 全件取得（既存）
  // =====================================
  getAll() {
    return new Promise((resolve, reject) => {
      const db = connect();
      db.all("SELECT * FROM temp_notes;", [], (err, rows) => {
        db.close();
        if (err) return reject(err);
        resolve(rows);
      });
    });
  },

  // =====================================
  // 一時メモを取得
  // =====================================
  getTempNote(children_id, staff_id, week_day) {
    return new Promise((resolve, reject) => {
      const db = connect();
      const sql = `
        SELECT * FROM temp_notes 
        WHERE children_id = ? AND staff_id = ? AND week_day = ?
        LIMIT 1
      `;
      db.get(sql, [children_id, staff_id, week_day], (err, row) => {
        db.close();
        if (err) return reject(err);
        resolve(row || null);
      });
    });
  },

  // =====================================
  // 出勤データ向け upsert（修正）
  // =====================================
  upsert(data) {
    const { children_id, staff_id, week_day, memo } = data;

    return new Promise((resolve, reject) => {
      const db = connect();

      const sql = `
          INSERT INTO temp_notes (children_id, staff_id, week_day, memo)
          VALUES (?, ?, ?, ?)
          ON CONFLICT(children_id, week_day) DO UPDATE SET
            staff_id = excluded.staff_id,
            memo = excluded.memo,
            updated_at = CURRENT_TIMESTAMP
      `;

      db.run(
        sql,
        [children_id, staff_id, week_day, memo || ""],
        function (err) {
          db.close();
          if (err) return reject(err);
          resolve({ success: true, changes: this.changes });
        }
      );
    });
  }
};

