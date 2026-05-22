import { getWeekdayIdFromDate } from "@/utils/date/dateUtils.js";

/** 個人記録（活動内容）の item_id は固定 1（個人記録テーブル.md） */
export const SERVICE_RECORD_ITEM_ID = 1;

const HUG_WM_ORIGIN = "https://www.hug-ayumu.link/hug/wm/";

/**
 * 編集ページ URL から cal_date（YYYY-MM-DD）を取得
 * @param {string} editPath
 */
export function parseCalDateFromEditPath(editPath) {
  if (!editPath) return null;
  try {
    const url = new URL(editPath, HUG_WM_ORIGIN);
    const cal = url.searchParams.get("cal_date");
    return cal && /^\d{4}-\d{2}-\d{2}$/.test(cal) ? cal : null;
  } catch {
    return null;
  }
}

/**
 * 一覧行の日付表示 or cal_date から YYYY-MM-DD
 * @param {string} dateText
 * @param {string} [editPath]
 */
export function resolveRecordDate(dateText, editPath) {
  const fromPath = parseCalDateFromEditPath(editPath);
  if (fromPath) return fromPath;

  const m = String(dateText || "").match(/(\d{4})[/-](\d{1,2})[/-](\d{1,2})/);
  if (!m) return null;

  const y = m[1];
  const mo = String(m[2]).padStart(2, "0");
  const d = String(m[3]).padStart(2, "0");
  return `${y}-${mo}-${d}`;
}

/**
 * HUG 取得レコード 1 件 → service_record POST 用 payload
 *
 * @param {object} record fetchContactBookRecordsInWebview の records 要素
 * @param {{ childrenId: string|number, facilityId: string|number }} ctx
 */
export function buildServiceRecordPayload(record, { childrenId, facilityId }) {
  const dateStr = resolveRecordDate(record?.date, record?.editPath);
  if (!dateStr) {
    throw new Error(`日付を解釈できません: ${record?.date ?? ""}`);
  }

  const dayOfWeekId = getWeekdayIdFromDate(dateStr);
  if (!dayOfWeekId) {
    throw new Error(`曜日IDを取得できません: ${dateStr}`);
  }

  const note = (record?.note ?? "").trim();
  if (!note) {
    throw new Error("活動内容（note）が空です");
  }
  if (record?.noteError) {
    throw new Error(record.noteError);
  }

  return {
    children_id: Number(childrenId),
    item_id: SERVICE_RECORD_ITEM_ID,
    facility_id: Number(facilityId),
    served_time: `${dateStr} 00:00:00`,
    day_of_week_id: dayOfWeekId,
    note,
    is_copy: 0,
    is_deleted: 0,
  };
}

/**
 * 取得した個人記録をローカル API（…/api/sql/houday/service_record）へ POST
 *
 * @param {Array<object>} records
 * @param {{ childrenId: string|number, facilityId: string|number }} ctx
 * @returns {Promise<{
 *   ok: boolean;
 *   posted: number;
 *   skipped: number;
 *   failed: number;
 *   results: Array<{
 *     date?: string;
 *     ok: boolean;
 *     payload?: object;
 *     data?: unknown;
 *     error?: string;
 *   }>;
 * }>}
 */
export async function postServiceRecordsToLocalApi(records, ctx) {
  const { childrenId, facilityId } = ctx || {};

  if (!childrenId || !facilityId) {
    return {
      ok: false,
      posted: 0,
      skipped: 0,
      failed: 0,
      results: [{ ok: false, error: "childrenId / facilityId が指定されていません" }],
    };
  }

  if (!window.electronAPI?.mariadb_service_record_insert) {
    return {
      ok: false,
      posted: 0,
      skipped: 0,
      failed: 0,
      results: [
        { ok: false, error: "mariadb_service_record_insert が利用できません" },
      ],
    };
  }

  const list = Array.isArray(records) ? records : [];
  const results = [];
  let posted = 0;
  let skipped = 0;
  let failed = 0;

  for (const record of list) {
    const dateLabel = record?.date ?? parseCalDateFromEditPath(record?.editPath);

    try {
      const payload = buildServiceRecordPayload(record, {
        childrenId,
        facilityId,
      });

      const data = await window.electronAPI.mariadb_service_record_insert(
        payload
      );

      posted += 1;
      results.push({ date: dateLabel, ok: true, payload, data });
    } catch (e) {
      const message = e?.message ? String(e.message) : String(e);
      const isSkip =
        message.includes("活動内容（note）が空") ||
        message.includes("日付を解釈");

      if (isSkip) {
        skipped += 1;
        results.push({ date: dateLabel, ok: false, error: message, skipped: true });
      } else {
        failed += 1;
        results.push({ date: dateLabel, ok: false, error: message });
      }
    }
  }

  return {
    ok: failed === 0,
    posted,
    skipped,
    failed,
    results,
  };
}
