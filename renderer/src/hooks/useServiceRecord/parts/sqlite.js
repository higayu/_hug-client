export async function getServiceRecordMonthly(payload) {
  const api = window.electronAPI?.sqlite_getServiceRecordMonthly;

  if (typeof api !== "function") {
    throw new Error("SQLite月次サービス記録APIが利用できません。");
  }

  return api(payload);
}
