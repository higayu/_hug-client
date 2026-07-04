// main/parts/handlers/sqliteHandler/sqlite/managers2.js
const { connect } = require("./base");

module.exports = {
  getAll() {
    return new Promise((resolve, reject) => {
      const db = connect();
      console.log("[managers2.getAll] SELECT * FROM managers2");

      db.all("SELECT * FROM managers2;", [], (err, rows) => {
        db.close();

        if (err) {
          console.error("[managers2.getAll] ERROR:", err);
          return reject(err);
        }

        console.log("[managers2.getAll] rows:", rows);
        resolve(rows);
      });
    });
  },

  insert(data) {
    const {
      children_id,
      staff_id,
      day_of_week_id,
      priority = 0,
      support_start_time = null,
      support_end_time = null,
    } = data;

    console.log("[managers2.insert] input:", data);

    return new Promise((resolve, reject) => {
      const db = connect();

      const sql = `
        INSERT INTO managers2 (
          children_id,
          staff_id,
          day_of_week_id,
          priority,
          support_start_time,
          support_end_time
        )
        VALUES (?, ?, ?, ?, ?, ?);
      `;

      const params = [
        children_id,
        staff_id,
        day_of_week_id,
        priority,
        support_start_time,
        support_end_time,
      ];

      console.log("[managers2.insert] SQL:", sql);
      console.log("[managers2.insert] params:", params);

      db.run(sql, params, function (err) {
        db.close();

        if (err) {
          console.error("[managers2.insert] ERROR:", err);
          return reject(err);
        }

        console.log("[managers2.insert] lastID:", this.lastID);
        resolve(this.lastID);
      });
    });
  },

  update(data) {
    const {
      children_id,
      staff_id,
      day_of_week_id,
      old_children_id = children_id,
      old_staff_id = staff_id,
      old_day_of_week_id = day_of_week_id,
      priority = 0,
      support_start_time = null,
      support_end_time = null,
    } = data;

    console.log("[managers2.update] input:", data);

    return new Promise((resolve, reject) => {
      const db = connect();

      const sql = `
        UPDATE managers2
        SET
          children_id = ?,
          staff_id = ?,
          day_of_week_id = ?,
          priority = ?,
          support_start_time = ?,
          support_end_time = ?
        WHERE
          children_id = ?
          AND staff_id = ?
          AND day_of_week_id = ?;
      `;

      const params = [
        children_id,
        staff_id,
        day_of_week_id,
        priority,
        support_start_time,
        support_end_time,
        old_children_id,
        old_staff_id,
        old_day_of_week_id,
      ];

      console.log("[managers2.update] SQL:", sql);
      console.log("[managers2.update] params:", params);

      db.run(sql, params, function (err) {
        db.close();

        if (err) {
          console.error("[managers2.update] ERROR:", err);
          return reject(err);
        }

        console.log("[managers2.update] changes:", this.changes);
        resolve(this.changes);
      });
    });
  },

  delete(data) {
    const { children_id, staff_id, day_of_week_id } = data;
    console.log("[managers2.delete] input:", data);

    return new Promise((resolve, reject) => {
      const db = connect();

      const sql = `
        DELETE FROM managers2
        WHERE children_id = ?
          AND staff_id = ?
          AND day_of_week_id = ?;
      `;

      const params = [children_id, staff_id, day_of_week_id];

      console.log("[managers2.delete] SQL:", sql);
      console.log("[managers2.delete] params:", params);

      db.run(sql, params, function (err) {
        db.close();

        if (err) {
          console.error("[managers2.delete] ERROR:", err);
          return reject(err);
        }

        console.log("[managers2.delete] changes:", this.changes);
        resolve(this.changes);
      });
    });
  },
};