export async function getServiceRecordMonthly(payload) {
  const api = window.electronAPI?.laravel_procedure_getServiceRecordMonthly;

  if (typeof api !== "function") {
    throw new Error("Laravel月次サービス記録APIが利用できません。");
  }

  return api(payload);
}
