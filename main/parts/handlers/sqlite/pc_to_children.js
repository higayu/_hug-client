// main/parts/handlers/sqlite/pc_to_children.js
const { connect } = require("./base");

module.exports = {
  getAll() {
    return new Promise((resolve, reject) => {
      const db = connect();
      db.all("SELECT * FROM pc_to_children;", [], (err, rows) => {
        db.close();
        if (err) return reject(err);
        resolve(rows);
      });
    });
  },

  insert(data) {
    const { id, pc_id, children_id, day_of_week, start_time, end_time } = data;
    return new Promise((resolve, reject) => {
      const db = connect();
      db.run(
        "INSERT INTO pc_to_children (id, pc_id, children_id, day_of_week, start_time, end_time) VALUES (?, ?, ?, ?, ?, ?);",
        [id, pc_id, children_id, day_of_week, start_time, end_time],
        function (err) {
          db.close();
          if (err) return reject(err);
          resolve(this.lastID);
        }
      );
    });
  },

  update(id, data) {
    const { pc_id, children_id, day_of_week, start_time, end_time } = data;
    return new Promise((resolve, reject) => {
      const db = connect();
      db.run(
        "UPDATE pc_to_children SET pc_id=?, children_id=?, day_of_week=?, start_time=?, end_time=? WHERE id=?;",
        [pc_id, children_id, day_of_week, start_time, end_time, id],
        function (err) {
          db.close();
          if (err) return reject(err);
          resolve(this.changes);
        }
      );
    });
  },

  delete(id) {
    return new Promise((resolve, reject) => {
      const db = connect();
      db.run("DELETE FROM pc_to_children WHERE id=?;", [id], function (err) {
        db.close();
        if (err) return reject(err);
        resolve(this.changes);
      });
    });
  },
};
