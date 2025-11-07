// main/parts/handlers/sqlite/getExperienceChildrenV.js
/**
 * 体験児童ビュー（experience_children_v）取得
 * 対応: MariaDB VIEW experience_children_v
 * @param {object} db - SQLite データベース接続
 * @returns {Promise<object[]>}
 */
async function getExperienceChildrenV(db) {
  console.log("🚀 [getExperienceChildrenV] 開始");

  return new Promise((resolve, reject) => {
    const sql = `
      SELECT
        c.id AS children_id,
        c.name AS children_name,
        c.notes AS notes,
        c.is_delete AS is_delete,
        c.pronunciation_id AS pronunciation_id,
        c.children_type_id AS children_type_id,
        p.id AS pc_id,
        p.name AS pc_name,
        p.explanation AS explanation,
        p.memo AS memo,
        p.facility_id AS facility_id,
        ptc.id AS ptc_id
      FROM Children c
      LEFT JOIN pc_to_children ptc ON c.id = ptc.children_id
      LEFT JOIN pc p ON ptc.pc_id = p.id
      WHERE c.children_type_id = -1
    `;

    db.all(sql, (err, rows) => {
      if (err) {
        console.error("❌ [getExperienceChildrenV] SQLエラー:", err);
        return reject(err);
      }
      console.log(`✅ [getExperienceChildrenV] 該当件数: ${rows.length}`);
      resolve(rows);
    });
  });
}

module.exports = { getExperienceChildrenV };
