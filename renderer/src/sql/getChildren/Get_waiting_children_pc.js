// renderer/src/sql/getChildren/Get_waiting_children_pc.js

/**
 * DBの種類に応じて「待機児童」データを取得
 * @param {Object} params
 * @param {Object} params.tables - SQLiteモード時の全テーブル
 * @param {number|string} [params.facility_id] - 施設ID（MariaDBモード用）
 * @returns {Promise<Array>}
 */
export async function Get_waiting_children_pc({ tables, facility_id = null }) {
  try {

      if (!tables) {
        console.error("❌ Get_waiting_children_pc: テーブルデータが未定義です");
        return [];
      }

      const { children, pc, pc_to_children } = tables;

      // children_type_id = 2 が「待機児童」
      const waitingChildren = children
        .filter((c) => Number(c.children_type_id) === 2 && Number(c.is_delete) === 0)
        .map((c) => {
          const ptc = pc_to_children.find((p) => p.children_id === c.id);
          const pcItem = ptc ? pc.find((p) => p.id === ptc.pc_id) : null;
          return {
            children_id: c.id,
            children_name: c.name,
            notes: c.notes || "",
            is_delete: c.is_delete,
            pronunciation_id: c.pronunciation_id,
            children_type_id: c.children_type_id,
            pc_id: pcItem?.id || null,
            pc_name: pcItem?.name || "",
            explanation: pcItem?.explanation || "",
            memo: pcItem?.memo || "",
            facility_id: pcItem?.facility_id || null,
          };
        })
        .sort((a, b) => a.children_name.localeCompare(b.children_name, "ja"));

      console.log(`✅ [Get_waiting_children_pc] 待機児童: ${waitingChildren.length}件`);
      return waitingChildren;

  } catch (error) {
    console.error("❌ Get_waiting_children_pc エラー:", error);
    return [];
  }
}
