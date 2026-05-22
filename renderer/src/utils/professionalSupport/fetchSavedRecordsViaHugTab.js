import { getHugWebviewForCache } from "@/hooks/useHugCache/getHugCache.js";
import { formatYmdToHugInterviewDate } from "./formatInterviewDate.js";
import { fetchProfessionalSupportSavedRecordsInWebview } from "@/utils/professionalSupport/fetchProfessionalSupportSavedRecordsInWebview.js";

/**
 * hugview の Cookie で指定日の専門的支援実施加算が登録済みか検索する
 *
 * @param {{
 *   childId: string|number,
 *   facilityId?: string|number,
 *   currentYmd?: string,
 *   interviewDate?: string,
 *   interviewDateEnd?: string,
 * }} opts
 */
export async function fetchProfessionalSupportSavedRecordsViaHugTab({
  childId,
  facilityId = "3",
  currentYmd,
  interviewDate,
  interviewDateEnd,
}) {
  const webview = await getHugWebviewForCache();

  const resolvedDate =
    interviewDate || formatYmdToHugInterviewDate(currentYmd);

  if (!resolvedDate) {
    return {
      ok: false,
      error: "実施日（interview_date）が指定されていません",
    };
  }

  return fetchProfessionalSupportSavedRecordsInWebview(webview, {
    childId: String(childId),
    facilityId: String(facilityId),
    interviewDate: resolvedDate,
    interviewDateEnd: interviewDateEnd || resolvedDate,
  });
}
