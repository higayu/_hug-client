// main/parts/handlers/sqlite/getWaitingChildrenPc.js
/**
 * 待機児童＋PC情報を取得
 * 対応: MariaDB PROCEDURE Get_waiting_children_pc
 * @param {object} db - SQLite データベース接続
 * @param {number} facilityId - 施設ID
 * @returns {Promise<object[]>}
 */
async function getWaitingChildrenPc(db, facilityId) {
  console.log(`🚀 [getWaitingChildrenPc] facilityId=${facilityId}`);

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
        p.facility_id AS pc_facility_id,
        ptc.id AS ptc_id,
        f.id AS facility_id,
        f.name AS facility_name
      FROM facility_children fc
      INNER JOIN facilitys f ON fc.facility_id = f.id
      INNER JOIN Children c ON fc.children_id = c.id
      LEFT JOIN pc_to_children ptc ON c.id = ptc.children_id
      LEFT JOIN pc p ON ptc.pc_id = p.id
      WHERE
        c.children_type_id = 2
        AND fc.facility_id = ?
        AND c.is_delete = 0
    `;

    db.all(sql, [facilityId], (err, rows) => {
      if (err) {
        console.error("❌ [getWaitingChildrenPc] SQLエラー:", err);
        return reject(err);
      }
      console.log(`✅ [getWaitingChildrenPc] 該当件数: ${rows.length}`);
      resolve(rows);
    });
  });
}

module.exports = { getWaitingChildrenPc };
