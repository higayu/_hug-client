import type { SupportRecord } from './mockData';

export function getFormattedDate(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getDefaultPeriod() {
  const end = new Date();
  const start = new Date();
  start.setMonth(start.getMonth() - 1);
  return { startDate: getFormattedDate(start), endDate: getFormattedDate(end) };
}

export function formatRecordDate(targetDate?: string) {
  if (!targetDate) return '—';
  return String(targetDate).split('T')[0];
}

export function filterRecordsByDateRange(
  records: SupportRecord[],
  startDate: string,
  endDate: string,
) {
  return records.filter((r) => {
    const d = formatRecordDate(r.target_date);
    return d >= startDate && d <= endDate;
  });
}

export function sortRecordsByDateDesc(records: SupportRecord[]) {
  return [...records].sort((a, b) => {
    const da = formatRecordDate(a.target_date);
    const db = formatRecordDate(b.target_date);
    return db.localeCompare(da);
  });
}
