// main/parts/handlers/sqlite/day_of_week.js
const { connect } = require("./base");

module.exports = {
  // =======================================================
  // day_of_week 全件取得
  // =======================================================
  getAll() {
    return new Promise((resolve, reject) => {
      const db = connect();
      db.all("SELECT * FROM day_of_week;", [], (err, rows) => {
        db.close();
        if (err) return reject(err);

        // JSON をパースして返す
        const parsed = rows.map(r => ({
          ...r,
          days: JSON.parse(r.days)
        }));

        resolve(parsed);
      });
    });
  },

  // =======================================================
  // 1件取得（children_id & staff_id）
  // =======================================================
  getOne(children_id, staff_id) {
    return new Promise((resolve, reject) => {
      const db = connect();
      const sql = `
        SELECT * FROM day_of_week
        WHERE children_id = ? AND staff_id = ?
        LIMIT 1
      `;

      db.get(sql, [children_id, staff_id], (err, row) => {
        db.close();
        if (err) return reject(err);

        if (!row) return resolve(null);

        row.days = JSON.parse(row.days);
        resolve(row);
      });
    });
  },

  // =======================================================
  // upsert（INSERT or UPDATE）
  // =======================================================
  upsert(data) {
    const { children_id, staff_id, days } = data;

    if (!Array.isArray(days)) {
      return Promise.reject(new Error("days must be an array"));
    }

    const jsonDays = JSON.stringify(days);

    return new Promise((resolve, reject) => {
      const db = connect();

      const sql = `
        INSERT INTO day_of_week (children_id, staff_id, days)
        VALUES (?, ?, ?)
        ON CONFLICT(children_id, staff_id) DO UPDATE SET
          days = excluded.days
      `;

      db.run(sql, [children_id, staff_id, jsonDays], function (err) {
        db.close();
        if (err) return reject(err);

        resolve({ success: true, changes: this.changes });
      });
    });
  },

  // =======================================================
  // 削除（任意）
  // =======================================================
  delete(children_id, staff_id) {
    return new Promise((resolve, reject) => {
      const db = connect();

      const sql = `
        DELETE FROM day_of_week
        WHERE children_id = ? AND staff_id = ?
      `;

      db.run(sql, [children_id, staff_id], function (err) {
        db.close();
        if (err) return reject(err);

        resolve({ success: true, changes: this.changes });
      });
    });
  },
};
