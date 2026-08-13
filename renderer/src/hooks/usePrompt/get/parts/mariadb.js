export async function getActiveAiPrompts({ staffId, itemId = null }) {
  const api = window.electronAPI?.mariadb_procedure_getActiveAiPrompt;

  if (typeof api !== "function") {
    throw new Error("MariaDBプロシージャAPIが利用できません。");
  }

  const result = await api({ staff_id: staffId, item_id: itemId });

  if (result?.success === false) {
    throw new Error(result.message || "有効なAIプロンプトの取得に失敗しました。");
  }

  const rows = result?.data ?? result;
  if (!Array.isArray(rows)) {
    throw new Error("AIプロンプトのレスポンス形式が不正です。");
  }

  return rows;
}
