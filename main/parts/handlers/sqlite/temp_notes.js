// main/parts/handlers/sqlite/temp_notes.js
const { connect } = require("./base");

module.exports = {
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

  upsert(data) {
    const { children_id, staff_id, date_str, week_day, enter_time, exit_time, memo } = data;
    return new Promise((resolve, reject) => {
      const db = connect();
      const sql = `
        INSERT INTO temp_notes (children_id, staff_id, date_str, week_day, enter_time, exit_time, memo)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(children_id, week_day) DO UPDATE SET
          enter_time = excluded.enter_time,
          exit_time = excluded.exit_time,
          memo = excluded.memo,
          updated_at = CURRENT_TIMESTAMP;
      `;
      db.run(sql, [children_id, staff_id, date_str, week_day, enter_time, exit_time, memo], function (err) {
        db.close();
        if (err) return reject(err);
        resolve(this.changes);
      });
    });
  },
};
