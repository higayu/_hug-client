import { getActiveAiPrompts as getFromLaravel } from "./parts/laravel";

const PROMPT_KEY_BY_ITEM_ID = {
  1: "personalRecord",
  2: "professional1",
  3: "professional2",
};

/**
 * DBの行を既存のappState.PROMPTS形式へ変換する。
 */
export function normalizeActiveAiPrompts(rows) {
  return rows.reduce((prompts, row) => {
    const key = PROMPT_KEY_BY_ITEM_ID[Number(row?.item_id)];

    if (!key) {
      console.warn("[usePrompt/get] 未対応のitem_idをスキップしました。", row);
      return prompts;
    }

    prompts[key] = {
      success: true,
      content: typeof row.content === "string" ? row.content : "",
      promptId: row.prompt_id,
      staffId: row.staff_id,
      itemId: row.item_id,
      isActive: Boolean(row.is_active),
      updatedBy: row.updated_by,
      updatedAt: row.updated_at,
    };

    return prompts;
  }, {});
}

/**
 * 使用中のDBに応じて有効なAIプロンプトを取得する。
 */
export async function getActiveAiPrompts({
  databaseType,
  staffId,
  itemId = null,
}) {
  const normalizedDatabaseType = String(databaseType ?? "").toLowerCase();

  if (normalizedDatabaseType !== "laravel") {
    return null;
  }

  const rows = await getFromLaravel({ staffId, itemId });

  return normalizeActiveAiPrompts(rows);
}
