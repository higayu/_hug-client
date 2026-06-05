/**
 * CURRENT_YMD (YYYY-MM-DD) → HUG 面談日 (YYYY年M月D日)
 */
export function formatYmdToHugInterviewDate(ymd) {
  if (!ymd) return "";

  const parts = String(ymd).split("-");
  if (parts.length < 3) return "";

  const year = parts[0];
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);

  if (!year || Number.isNaN(month) || Number.isNaN(day)) return "";

  return `${year}年${month}月${day}日`;
}
