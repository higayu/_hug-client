// main/parts/window/handleProfessionalSupportSearch/scripts/getDays.js

/**
 * 年月（YYYY-MM）から、その月の日数を返す
 * @param {string} yearMonth - 例: "2025-02"
 * @returns {number} 月の日数（28〜31）
 */
export function getDaysInMonth(yearMonth) {
  if (!yearMonth) return 0;

  const [year, month] = yearMonth.split("-").map(Number);

  // month は 1〜12 → Date では 0〜11
  return new Date(year, month, 0).getDate();
}


/**
 * 日付文字列（YYYY-MM-DD）から年月（YYYY-MM）を返す
 * @param {string} dateStr - 例: "2025-12-31"
 * @returns {string} 年月（例: "2025-12"）
 */
export function getYearMonthFromDate(dateStr) {
  if (!dateStr) return "";

  // "YYYY-MM-DD" → ["YYYY", "MM", "DD"]
  const parts = dateStr.split("-");
  if (parts.length < 2) return "";

  const [year, month] = parts;
  return `${year}-${month}`;
}
