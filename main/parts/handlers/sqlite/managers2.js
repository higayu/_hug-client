// main/parts/handlers/sqlite/managers2.js
const { connect } = require("./base");

module.exports = {
  getAll() {
    return new Promise((resolve, reject) => {
      const db = connect();
      db.all("SELECT * FROM managers2;", [], (err, rows) => {
        db.close();
        if (err) return reject(err);
        resolve(rows);
      });
    });
  },

  insert(data) {
    const { children_id, staff_id, day_of_week_id } = data;
    return new Promise((resolve, reject) => {
      const db = connect();
      db.run(
        "INSERT INTO managers2 (children_id, staff_id, day_of_week_id) VALUES (?, ?, ?);",
        [children_id, staff_id, day_of_week_id],
        function (err) {
          db.close();
          if (err) return reject(err);
          resolve(this.lastID);
        }
      );
    });
  },

  update(data) {
    const { children_id, staff_id, day_of_week_id } = data;
    return new Promise((resolve, reject) => {
      const db = connect();
      db.run(
        "UPDATE managers2 SET day_of_week=? WHERE children_id=? AND staff_id=? AND day_of_week_id=?;",
        [day_of_week_id, children_id, staff_id, day_of_week_id],
        function (err) {
          db.close();
          if (err) return reject(err);
          resolve(this.changes);
        }
      );
    });
  },

  delete(children_id, staff_id,day_of_week_id) {
    return new Promise((resolve, reject) => {
      const db = connect();
      db.run(
        "DELETE FROM managers2 WHERE children_id=? AND staff_id=? AND day_of_week_id=?;",
        [children_id, staff_id,day_of_week_id],
        function (err) {
          db.close();
          if (err) return reject(err);
          resolve(this.changes);
        }
      );
    });
  },
};
