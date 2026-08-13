export async function upsertAiPrompt(params) {
  const api = window.electronAPI?.mariadb_procedure_upsertAiPrompt;

  if (typeof api !== "function") {
    throw new Error("MariaDBプロシージャAPIが利用できません。");
  }

  const result = await api({
    prompt_id: params.promptId ?? null,
    staff_id: params.staffId,
    item_id: params.itemId,
    content: params.content,
    is_active: params.isActive,
    updated_by: params.updatedBy,
  });

  if (result?.success === false) {
    throw new Error(result.message || "AIプロンプトの保存に失敗しました。");
  }

  return result?.data ?? result;
}
