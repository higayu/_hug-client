// renderer/src/sql/getChildren/Experience_children_v.js
import { sqliteApi } from "../sqliteApi.js";
import { mariadbApi } from "../mariadbApi.js";

/**
 * DBの種類に応じて「体験児童（children_type_id = -1）」データを取得
 * @param {Object} params
 * @param {Object} params.tables - SQLiteモード時の全テーブル
 * @returns {Promise<Array>}
 */
export async function Experience_children_v({ tables }) {
  try {
      if (!tables) {
        console.error("❌ Experience_children_v: テーブルデータが未定義です");
        return [];
      }

      const { children, pc, pc_to_children } = tables;

      const experienceChildren = children
        .filter((c) => Number(c.children_type_id) === -1 && Number(c.is_delete) === 0)
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

      console.log(`✅ [Experience_children_v] 体験児童: ${experienceChildren.length}件`);
      return experienceChildren;

  } catch (error) {
    console.error("❌ Experience_children_v エラー:", error);
    return [];
  }
}
