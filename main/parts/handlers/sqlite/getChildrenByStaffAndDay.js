// main/parts/handlers/sqlite/getChildrenByStaffAndDay.js
const getChildrenByStaffAndDay = async (db, staffId, day) => {
  console.log(`🚀 [getChildrenByStaffAndDay] staffId=${staffId}, day=${day}`);

  // 念のためエンコード確認とトリム
  if (Buffer.isBuffer(day)) day = day.toString("utf8");
  day = (day || "").trim();

  const sql = `
    SELECT
      c.id AS children_id,
      c.name AS children_name,
      c.notes AS children_notes,
      c.pronunciation_id AS children_pronunciation_id,
      p.pronunciation AS children_pronunciation,
      c.children_type_id AS children_type_id,
      ct.name AS children_type_name,
      pc.id AS pc_id,
      pc.name AS pc_name,
      pc.explanation AS pc_explanation,
      pc.memo AS pc_memo,
      ptc.day_of_week AS pc_day_of_week,
      ptc.id AS ptc_id,
      ptc.start_time AS start_time,
      ptc.end_time AS end_time,
      m.day_of_week AS manager_days
    FROM Children c
      INNER JOIN managers m ON c.id = m.children_id
      INNER JOIN staffs s ON m.staff_id = s.id
      LEFT JOIN pc_to_children ptc 
        ON c.id = ptc.children_id
        AND (ptc.day_of_week = ? OR ptc.day_of_week = '')
      LEFT JOIN pc ON ptc.pc_id = pc.id
      LEFT JOIN pronunciation p ON c.pronunciation_id = p.id
      LEFT JOIN children_type ct ON c.children_type_id = ct.id
    WHERE s.id = ?
    ORDER BY c.name;
  `;

  return new Promise((resolve, reject) => {
    db.all(sql, [day, staffId], (err, rows) => {
      if (err) {
        console.error("❌ SQL実行エラー:", err);
        return reject(err);
      }

      // SQLiteではJSON_CONTAINSが使えないため、JavaScript側で代替
      const filtered = rows.filter(row => {
        if (!row.manager_days) return false;
        try {
          const json = JSON.parse(row.manager_days);
          if (Array.isArray(json.days)) {
            return json.days.includes(day);
          }
          if (Array.isArray(json)) {
            return json.includes(day);
          }
          if (typeof json === "string") {
            return json.includes(day);
          }
        } catch (e) {
          return typeof row.manager_days === "string" && row.manager_days.includes(day);
        }
        return false;
      });

      console.log(`✅ [getChildrenByStaffAndDay] 該当児童: ${filtered.length}件`);
      resolve(filtered);
    });
  });
};

module.exports = { getChildrenByStaffAndDay };
