import { getWeekdayIdFromDate } from "@/utils/date/dateUtils.js";

/** 個人記録（活動内容）の item_id は固定 1 */
export const SERVICE_RECORD_ITEM_ID = 1;

const HUG_WM_ORIGIN = "https://www.hug-ayumu.link/hug/wm/";

/**
 * 編集ページ URL から cal_date（YYYY-MM-DD）を取得
 */
export function parseCalDateFromEditPath(editPath) {
  if (!editPath) return null;
  try {
    var url = new URL(editPath, HUG_WM_ORIGIN);
    var cal = url.searchParams.get("cal_date");
    return cal && /^\d{4}-\d{2}-\d{2}$/.test(cal) ? cal : null;
  } catch (e) {
    return null;
  }
}

/**
 * 一覧行の日付表示 or cal_date から YYYY-MM-DD
 */
export function resolveRecordDate(dateText, editPath) {
  var fromPath = parseCalDateFromEditPath(editPath);
  if (fromPath) return fromPath;

  var m = String(dateText || "").match(/(\d{4})[/-](\d{1,2})[/-](\d{1,2})/);
  if (!m) return null;

  var y = m[1];
  var mo = String(m[2]).padStart(2, "0");
  var d = String(m[3]).padStart(2, "0");
  return y + "-" + mo + "-" + d;
}

/**
 * HUG 取得レコード 1 件 → service_record POST 用 payload
 * ★ 権限エラー（permissionError: true）の場合は空のnoteでも保存を許可 ★
 */
export function buildServiceRecordPayload(record, ctx) {
  var childrenId = ctx.childrenId;
  var facilityId = ctx.facilityId;
  var staffId = ctx.staffId;

  var dateStr = resolveRecordDate(record ? record.date : null, record ? record.editPath : null);
  if (!dateStr) {
    throw new Error("日付を解釈できません: " + (record && record.date ? record.date : ""));
  }

  var dayOfWeekId = getWeekdayIdFromDate(dateStr);
  if (!dayOfWeekId) {
    throw new Error("曜日IDを取得できません: " + dateStr);
  }

  // ★ 権限エラーフラグをチェック ★
  var isPermissionError = record && record.permissionError === true;

  var note = (record && record.note ? record.note : "").trim();

  // ★ 権限エラーでない場合のみ空チェック ★
  if (!isPermissionError && !note) {
    throw new Error("活動内容（note）が空です");
  }

  // ★ 権限エラーでnoteが空の場合、警告ログを出力 ★
  if (isPermissionError && !note) {
    console.warn("[buildServiceRecordPayload] ⚠️ 権限エラーのため空のnoteで保存します:", {
      date: dateStr,
      childId: childrenId,
      facilityId: facilityId
    });
  }

  // ★ 権限エラーでない場合のみ noteError をチェック ★
  if (record && record.noteError && !isPermissionError) {
    throw new Error(record.noteError);
  }

  var recordedStaffId = (record && record.recordStaff && record.recordStaff.value)
    ? Number(record.recordStaff.value)
    : staffId
      ? Number(staffId)
      : -1;
  var updatedStaffId = staffId ? Number(staffId) : recordedStaffId;

  return {
    children_id: Number(childrenId),
    item_id: SERVICE_RECORD_ITEM_ID,
    facility_id: Number(facilityId),
    served_date: dateStr,
    day_of_week_id: dayOfWeekId,
    note: note || "",  // 空の場合は空文字を保存
    is_copy: 0,
    is_deleted: 0,
    recorded_staff_id: recordedStaffId,
    updated_staff_id: updatedStaffId
  };
}

/** ローカル API が重複（HTTP 409）で拒否したか */
export function isServiceRecordDuplicateError(message) {
  var text = String(message || "");
  return /\b409\b/.test(text) || /status code 409/i.test(text);
}

/**
 * 取得した個人記録を UpsertServiceRecord プロシージャ経由でローカル DB へ保存
 * ★ 権限エラーのレコードは空のnoteで保存を試みる ★
 */
export async function postServiceRecordsToLocalApi(records, ctx) {
  var childrenId = ctx ? ctx.childrenId : null;
  var facilityId = ctx ? ctx.facilityId : null;
  var staffId = ctx ? ctx.staffId : null;
  var databaseType = ctx ? ctx.databaseType : null;

  console.log("[postServiceRecordsToLocalApi] 開始", {
    childrenId: childrenId,
    facilityId: facilityId,
    staffId: staffId,
    databaseType: databaseType,
    recordsCount: records ? records.length : 0
  });

  if (!childrenId || !facilityId) {
    return {
      ok: false,
      posted: 0,
      skipped: 0,
      failed: 0,
      permissionErrors: [],
      results: [{ ok: false, error: "childrenId / facilityId が指定されていません" }]
    };
  }

  var serviceRecordUpsert = databaseType === "laravel"
    ? window.electronAPI && window.electronAPI.laravel_procedure_upsertServiceRecord
    : window.electronAPI && window.electronAPI.mariadb_service_record_upsert;
  var serviceRecordUpsertApiName = databaseType === "laravel"
    ? "laravel_procedure_upsertServiceRecord"
    : "mariadb_service_record_upsert";

  console.log("[postServiceRecordsToLocalApi] API確認", {
    apiName: serviceRecordUpsertApiName,
    isFunction: typeof serviceRecordUpsert === "function"
  });

  if (typeof serviceRecordUpsert !== "function") {
    return {
      ok: false,
      posted: 0,
      skipped: 0,
      failed: 0,
      permissionErrors: [],
      results: [
        { ok: false, error: serviceRecordUpsertApiName + " が利用できません" }
      ]
    };
  }

  var list = Array.isArray(records) ? records : [];
  var results = [];
  var posted = 0;
  var skipped = 0;
  var failed = 0;
  var permissionErrors = [];

  for (var i = 0; i < list.length; i++) {
    var record = list[i];
    var dateLabel = record && record.date ? record.date : parseCalDateFromEditPath(record ? record.editPath : null);
    
    // ★ 権限エラーフラグをチェック ★
    var isPermissionError = record && record.permissionError === true;

    console.log("[postServiceRecordsToLocalApi] 処理中", {
      date: dateLabel,
      hasNote: !!(record && record.note),
      isPermissionError: isPermissionError,
      noteError: record ? record.noteError : null
    });

    try {
      var payload = buildServiceRecordPayload(record, {
        childrenId: childrenId,
        facilityId: facilityId,
        staffId: staffId
      });

      var data = await serviceRecordUpsert(payload);

      posted += 1;
      
      var resultItem = {
        date: dateLabel,
        ok: true,
        payload: payload,
        data: data
      };

      // ★ 権限エラーの場合はフラグとメッセージを追加 ★
      if (isPermissionError) {
        resultItem.permissionError = true;
        resultItem.message = (record && record.noteError) || "編集権限がありません（空のnoteで保存しました）";
        permissionErrors.push({
          date: dateLabel,
          message: (record && record.noteError) || "編集権限がありません"
        });
        console.warn("[postServiceRecordsToLocalApi] ⚠️ 権限エラーあり但し保存成功:", dateLabel);
      }

      results.push(resultItem);

    } catch (e) {
      var message = e && e.message ? String(e.message) : String(e);
      
      // ★ 権限エラーは特別なエラーとして扱う ★
      if (isPermissionError || message.includes("権限") || message.includes("編集権限")) {
        failed += 1;
        permissionErrors.push({
          date: dateLabel,
          message: message
        });
        results.push({
          date: dateLabel,
          ok: false,
          error: message,
          permissionError: true,
          isPermissionError: true
        });
        console.error("[postServiceRecordsToLocalApi] ❌ 権限エラー保存失敗:", dateLabel, message);
        continue;
      }

      var isSkip = message.includes("活動内容（note）が空") || message.includes("日付を解釈");

      if (isSkip) {
        skipped += 1;
        results.push({ date: dateLabel, ok: false, error: message, skipped: true });
      } else {
        failed += 1;
        results.push({ date: dateLabel, ok: false, error: message });
      }
    }
  }

  var result = {
    ok: failed === 0,
    posted: posted,
    skipped: skipped,
    failed: failed,
    permissionErrors: permissionErrors,
    hasPermissionError: permissionErrors.length > 0,
    results: results
  };

  if (permissionErrors.length > 0) {
    console.warn("[postServiceRecordsToLocalApi] ⚠️ 権限エラー件数:", permissionErrors.length);
  }

  console.log("[postServiceRecordsToLocalApi] 完了", {
    posted: posted,
    skipped: skipped,
    failed: failed,
    permissionErrors: permissionErrors.length
  });

  return result;
}