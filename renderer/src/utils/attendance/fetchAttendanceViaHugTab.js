import { ensureHugWebviewSession } from "@/utils/professionalSupport/ensureHugWebview.js";
import { fetchAttendanceTableInWebview } from "@/utils/fetchAttendanceTableInWebview.js";

/**
 * hugview の Cookie だけ使い、ページ遷移なしで勤怠テーブルを取得する
 * @param {{ facilityId: string|number, dateStr: string }} opts
 */
export async function fetchAttendanceViaHugTab({ facilityId, dateStr }) {
  const webview = await ensureHugWebviewSession();

  if (!facilityId || !dateStr) {
    return {
      ok: false,
      error: "施設IDまたは日付が設定されていません",
    };
  }

  return fetchAttendanceTableInWebview(webview, {
    facilityId: String(facilityId),
    dateStr: String(dateStr),
  });
}
