/**
 * LaravelでAIプロンプトを登録・更新する。
 */
export async function upsertAiPrompt({
  promptId = null,
  staffId,
  itemId,
  content,
  isActive,
  updatedBy,
}) {
  const api = window.electronAPI?.laravel_procedure_upsertAiPrompt;

  if (typeof api !== "function") {
    throw new Error("LaravelプロシージャAPIが利用できません。");
  }

  const normalizedPromptId =
    promptId == null || promptId === "" ? null : Number(promptId);
  const normalizedStaffId = Number(staffId);
  const normalizedItemId = Number(itemId);
  const normalizedUpdatedBy = Number(updatedBy);
  const validIsActiveValues = [true, false, 1, 0, "1", "0"];
  const normalizedIsActive =
    isActive === true || isActive === 1 || isActive === "1" ? 1 : 0;

  if (
    normalizedPromptId !== null &&
    (!Number.isInteger(normalizedPromptId) || normalizedPromptId <= 0)
  ) {
    throw new Error("prompt_idが不正です。");
  }

  if (!Number.isInteger(normalizedStaffId) || normalizedStaffId <= 0) {
    throw new Error("staff_idが不正です。");
  }

  if (!Number.isInteger(normalizedItemId) || normalizedItemId <= 0) {
    throw new Error("item_idが不正です。");
  }

  if (typeof content !== "string" || content.length === 0) {
    throw new Error("contentが不正です。");
  }

  if (!validIsActiveValues.includes(isActive)) {
    throw new Error("is_activeが不正です。");
  }

  if (!Number.isInteger(normalizedUpdatedBy) || normalizedUpdatedBy <= 0) {
    throw new Error("updated_byが不正です。");
  }

  const result = await api({
    prompt_id: normalizedPromptId,
    staff_id: normalizedStaffId,
    item_id: normalizedItemId,
    content,
    is_active: normalizedIsActive,
    updated_by: normalizedUpdatedBy,
  });

  if (result?.success === false) {
    throw new Error(result.message || "AIプロンプトの保存に失敗しました。");
  }

  return result?.data ?? result;
}
