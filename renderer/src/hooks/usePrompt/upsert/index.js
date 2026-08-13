import { upsertAiPrompt as upsertToLaravel } from "./parts/laravel";
import { upsertAiPrompt as upsertToMariadb } from "./parts/mariadb";

/**
 * 使用中のDBに応じてAIプロンプトを登録・更新する。
 */
export async function upsertAiPrompt({ databaseType, ...params }) {
  const normalizedDatabaseType = String(databaseType ?? "").toLowerCase();

  const upsert = {
    laravel: upsertToLaravel,
    mariadb: upsertToMariadb,
  }[normalizedDatabaseType];

  return upsert ? upsert(params) : null;
}
