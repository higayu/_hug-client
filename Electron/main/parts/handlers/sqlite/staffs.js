// main/parts/handlers/sqlite/staffs.js
const { connect } = require("./base");

module.exports = {
  getAll() {
    return new Promise((resolve, reject) => {
      const db = connect();
      db.all("SELECT * FROM staffs;", [], (err, rows) => {
        db.close();
        if (err) return reject(err);
        resolve(rows);
      });
    });
  },

  insert(data) {
    const { id, name, notes, is_delete } = data;
    return new Promise((resolve, reject) => {
      const db = connect();
      db.run(
        "INSERT INTO staffs (id, name, notes, is_delete) VALUES (?, ?, ?, ?);",
        [id, name, notes, is_delete],
        function (err) {
          db.close();
          if (err) return reject(err);
          resolve(this.lastID);
        }
      );
    });
  },

  update(id, data) {
    const { name, notes, is_delete } = data;
    return new Promise((resolve, reject) => {
      const db = connect();
      db.run(
        "UPDATE staffs SET name=?, notes=?, is_delete=? WHERE id=?;",
        [name, notes, is_delete, id],
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
      db.run("DELETE FROM staffs WHERE id=?;", [id], function (err) {
        db.close();
        if (err) return reject(err);
        resolve(this.changes);
      });
    });
  },
};
