import { SERVICE_RECORD_ITEM_ID } from "./postServiceRecordsToLocalApi";

const LOG_TAG = "selectPersonalRecordNote";

/**
 * served_date（DATE）から YYYY-MM-DD を取り出す
 * @param {string|Date} servedDate
 */
export function servedDateToDateStr(servedDate) {
  if (!servedDate) return null;
  const s = String(servedDate);
  const m = s.match(/^(\d{4}-\d{2}-\d{2})/);
  const result = m ? m[1] : null;
  console.log(`[${LOG_TAG}] servedDateToDateStr: ${servedDate} → ${result}`);
  return result;
}

/**
 * Redux の service_record から個人記録（note）を 1 件抽出
 *
 * @param {Array<object>} records
 * @param {{ childrenId: string|number, dateStr: string, itemId?: number }} opts
 * @returns {string}
 */
export function selectPersonalRecordNote(
  records,
  { childrenId, dateStr, itemId = SERVICE_RECORD_ITEM_ID }
) {
  console.log(`[${LOG_TAG}] 呼び出し`, {
    childrenId,
    dateStr,
    itemId,
    recordCount: records?.length ?? 0,
  });

  if (!childrenId || !dateStr || !Array.isArray(records)) {
    console.warn(`[${LOG_TAG}] 条件不足`, {
      hasChildrenId: !!childrenId,
      hasDateStr: !!dateStr,
      isArray: Array.isArray(records),
    });
    return "";
  }

  // 検索条件のログ出力
  const searchParams = {
    childrenId: String(childrenId),
    itemId: Number(itemId),
    isDeleted: 0,
    dateStr: dateStr,
  };
  console.log(`[${LOG_TAG}] 検索条件`, searchParams);

  // 各レコードの内容をログ出力（デバッグ用）
  records.forEach((r, index) => {
    const rDateStr = servedDateToDateStr(r.served_date);
    console.log(`[${LOG_TAG}] レコード${index}`, {
      children_id: r.children_id,
      item_id: r.item_id,
      is_deleted: r.is_deleted,
      served_date: r.served_date,
      dateStr: rDateStr,
      matches: 
        String(r.children_id) === String(childrenId) &&
        Number(r.item_id) === Number(itemId) &&
        Number(r.is_deleted) === 0 &&
        rDateStr === dateStr,
      hasNote: !!r.note,
    });
  });

  const row = records.find(
    (r) =>
      String(r.children_id) === String(childrenId) &&
      Number(r.item_id) === Number(itemId) &&
      Number(r.is_deleted) === 0 &&
      servedDateToDateStr(r.served_date) === dateStr
  );

  const result = row?.note ?? "";
  console.log(`[${LOG_TAG}] 検索結果`, {
    found: !!row,
    noteLength: result.length,
    result: result.substring(0, 100) + (result.length > 100 ? "..." : ""),
  });

  return result;
}