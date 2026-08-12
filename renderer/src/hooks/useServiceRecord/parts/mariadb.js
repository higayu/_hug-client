export async function getServiceRecordMonthly(payload) {
  const api = window.electronAPI?.mariadb_procedure_getServiceRecordMonthly;

  if (typeof api !== "function") {
    throw new Error("MariaDB月次サービス記録APIが利用できません。");
  }

  return api(payload);
}
