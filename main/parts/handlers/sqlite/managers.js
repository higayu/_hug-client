// main/parts/handlers/sqlite/managers.js
const { connect } = require("./base");

module.exports = {
  getAll() {
    return new Promise((resolve, reject) => {
      const db = connect();
      db.all("SELECT * FROM managers;", [], (err, rows) => {
        db.close();
        if (err) return reject(err);
        resolve(rows);
      });
    });
  },

  insert(data) {
    const { children_id, staff_id, day_of_week } = data;
    return new Promise((resolve, reject) => {
      const db = connect();
      db.run(
        "INSERT INTO managers (children_id, staff_id, day_of_week) VALUES (?, ?, ?);",
        [children_id, staff_id, day_of_week],
        function (err) {
          db.close();
          if (err) return reject(err);
          resolve(this.lastID);
        }
      );
    });
  },

  update(data) {
    const { children_id, staff_id, day_of_week } = data;
    return new Promise((resolve, reject) => {
      const db = connect();
      db.run(
        "UPDATE managers SET day_of_week=? WHERE children_id=? AND staff_id=?;",
        [day_of_week, children_id, staff_id],
        function (err) {
          db.close();
          if (err) return reject(err);
          resolve(this.changes);
        }
      );
    });
  },

  delete(children_id, staff_id) {
    return new Promise((resolve, reject) => {
      const db = connect();
      db.run(
        "DELETE FROM managers WHERE children_id=? AND staff_id=?;",
        [children_id, staff_id],
        function (err) {
          db.close();
          if (err) return reject(err);
          resolve(this.changes);
        }
      );
    });
  },
};
