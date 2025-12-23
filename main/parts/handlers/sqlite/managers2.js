// main/parts/handlers/sqlite/managers2.js
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
    const { children_id, staff_id, day_of_week_id } = data;
    console.log("[managers2.insert] input:", data);

    return new Promise((resolve, reject) => {
      const db = connect();
      db.run(
        "INSERT INTO managers2 (children_id, staff_id, day_of_week_id) VALUES (?, ?, ?);",
        [children_id, staff_id, day_of_week_id],
        function (err) {
          db.close();
          if (err) {
            console.error("[managers2.insert] ERROR:", err);
            return reject(err);
          }
          console.log("[managers2.insert] lastID:", this.lastID);
          resolve(this.lastID);
        }
      );
    });
  },

  update(data) {
    const { children_id, staff_id, day_of_week_id } = data;
    console.log("[managers2.update] input:", data);

    return new Promise((resolve, reject) => {
      const db = connect();
      const sql =
        "UPDATE managers2 SET day_of_week_id=? WHERE children_id=? AND staff_id=? AND day_of_week_id=?;";
      const params = [day_of_week_id, children_id, staff_id, day_of_week_id];

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
      const sql =
        "DELETE FROM managers2 WHERE children_id=? AND staff_id=? AND day_of_week_id=?;";
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
