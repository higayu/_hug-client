// main/parts/handlers/sqlite/children.js
const { connect } = require("./base");

module.exports = {
  getAll() {
    return new Promise((resolve, reject) => {
      const db = connect();
      db.all("SELECT * FROM children;", [], (err, rows) => {
        db.close();
        if (err) return reject(err);
        resolve(rows);
      });
    });
  },

  getById(id) {
    return new Promise((resolve, reject) => {
      const db = connect();
      db.get("SELECT * FROM children WHERE id = ?;", [id], (err, row) => {
        db.close();
        if (err) return reject(err);
        resolve(row);
      });
    });
  },

  insert(data) {
    const { id, name, notes, pronunciation_id, children_type_id, is_delete } = data;
    return new Promise((resolve, reject) => {
      const db = connect();
      db.run(
        "INSERT INTO children (id, name, notes, pronunciation_id, children_type_id, is_delete) VALUES (?, ?, ?, ?, ?, ?);",
        [id, name, notes, pronunciation_id, children_type_id, is_delete],
        function (err) {
          db.close();
          if (err) return reject(err);
          resolve(this.lastID);
        }
      );
    });
  },

  update(id, data) {
    const { name, notes, pronunciation_id, children_type_id, is_delete } = data;
    return new Promise((resolve, reject) => {
      const db = connect();
      db.run(
        "UPDATE children SET name=?, notes=?, pronunciation_id=?, children_type_id=?, is_delete=? WHERE id=?;",
        [name, notes, pronunciation_id, children_type_id, is_delete, id],
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
      db.run("DELETE FROM children WHERE id = ?;", [id], function (err) {
        db.close();
        if (err) return reject(err);
        resolve(this.changes);
      });
    });
  },
};
