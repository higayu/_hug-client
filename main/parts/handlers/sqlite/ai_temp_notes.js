const { connect } = require("./base");

module.exports = {
  getAiNote(childId) {
    return new Promise((resolve, reject) => {
      const db = connect();
      db.get(
        "SELECT memo FROM ai_temp_notes WHERE children_id = ?",
        [childId],
        (err, row) => {
          db.close();
          if (err) return reject(err);
          resolve(row ? row.memo : "");
        }
      );
    });
  },

  saveAiNote(childId, memo) {
    return new Promise((resolve, reject) => {
      const db = connect();
      db.run(
        `
        INSERT INTO ai_temp_notes (children_id, memo)
        VALUES (?, ?)
        ON CONFLICT(children_id)
        DO UPDATE SET 
          memo = excluded.memo,
          updated_at = CURRENT_TIMESTAMP;
        `,
        [childId, memo],
        function (err) {
          db.close();
          if (err) return reject(err);
          resolve(true);
        }
      );
    });
  }
};
