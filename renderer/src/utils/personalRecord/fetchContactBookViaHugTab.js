import { getHugWebviewForCache } from "@/hooks/useHugCache/getHugCache.js";
import { fetchContactBookRecordsInWebview } from "@/utils/personalRecord/fetchContactBookRecordsInWebview.js";

/**
 * hugview の Cookie だけ使い、ページ遷移なしで
 * 個人記録（活動内容 note）を指定日のみ取得する
 *
 * @param {{
 *   childId: string|number,
 *   facilityId?: string|number,
 *   dateStart?: string,
 *   dateEnd?: string,
 *   currentYmd?: string,
 *   onlyPresent?: boolean,
 * }} opts
 *   dateStart / dateEnd 未指定時は currentYmd を開始・終了の両方に使う
 */
export async function fetchContactBookViaHugTab({
  childId,
  facilityId = "3",
  dateStart,
  dateEnd,
  currentYmd,
  onlyPresent = true,
}) {
  const webview = await getHugWebviewForCache();

  const resolvedStart = dateStart || currentYmd;
  const resolvedEnd = dateEnd || dateStart || currentYmd;

  if (!childId) {
    return { ok: false, error: "児童IDが指定されていません" };
  }
  if (!resolvedStart || !resolvedEnd) {
    return {
      ok: false,
      error: "期間（dateStart / dateEnd または currentYmd）が指定されていません",
    };
  }

  return fetchContactBookRecordsInWebview(webview, {
    childId: String(childId),
    facilityId: String(facilityId),
    dateStart: String(resolvedStart),
    dateEnd: String(resolvedEnd),
    onlyPresent,
  });
}
