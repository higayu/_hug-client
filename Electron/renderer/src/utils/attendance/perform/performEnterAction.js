/**
 * 拡張 enter-post.js performEnterAction + form-events.js 入室分岐
 */

import { getHugWebviewForCache } from "@/hooks/useHugCache/getHugCache.js";
import {
  getHalfTime,
  isAfternoonEnterHeldUntilHalfTime,
} from "../helpers/formHelpers.js";
import {
  isEnterMailEnabled,
  resolveMailFlgForPost,
  MailDialogCancelledError,
} from "../helpers/mailDialog.js";
import { nyushituInWebview } from "../post/postAttendanceInWebview.js";
import {
  tryNativeEnter,
  NATIVE_STATUS_ENTER,
} from "../update/nativeDelegateInWebview.js";
import { loadAttendanceDetailInWebview } from "../_shared/webview.js";

/**
 * @param {object} item 拡張 attendanceList の1行相当
 * @param {{ facilityId: string, dateStr: string, webview?: Electron.WebviewTag }} ctx
 */
export async function performEnterAction(item, ctx) {
  const { facilityId, dateStr } = ctx || {};

  if (!item?.enterOnclick) {
    throw new Error("入室 onclick がありません");
  }

  if (
    isAfternoonEnterHeldUntilHalfTime(
      item.hugAlertPref || { amPmFlag: 0 },
      getHalfTime(),
      new Date()
    )
  ) {
    throw new Error(
      `午後枠のためハーフタイム（${getHalfTime()}）まで入室できません`
    );
  }

  const webview = ctx?.webview || (await getHugWebviewForCache());

  if (isEnterMailEnabled(item)) {
    await loadAttendanceDetailInWebview(webview, facilityId, dateStr);
    try {
      const nativeResult = await tryNativeEnter(webview, item, {
        facilityId,
        dateStr,
      });
      return {
        ...nativeResult,
        success: true,
      };
    } catch (nativeErr) {
      console.warn(
        "[ATTENDANCE] 本番委譲失敗、拡張POSTへフォールバック:",
        nativeErr.message
      );
    }

    const mail_flg = await resolveMailFlgForPost(item, "enter");
    const postResult = await nyushituInWebview(webview, item.enterOnclick, {
      mail_flg,
    });

    if (!postResult?.success) {
      throw new Error(postResult?.error || "入室 POST に失敗しました");
    }

    return {
      mode: "extension-mail",
      mail_flg,
      success: true,
      dataList: postResult.dataList,
      json: postResult.json,
      statusMessage: `入室を記録しました（r_id=${postResult.dataList.r_id} / mail_flg=${mail_flg}）`,
    };
  }

  const postResult = await nyushituInWebview(webview, item.enterOnclick, {
    mail_flg: 0,
  });

  if (!postResult?.success) {
    throw new Error(postResult?.error || "入室 POST に失敗しました");
  }

  return {
    mode: "extension",
    mail_flg: 0,
    success: true,
    dataList: postResult.dataList,
    json: postResult.json,
    statusMessage: `入室を記録しました（r_id=${postResult.dataList.r_id}）`,
  };
}

export { MailDialogCancelledError, NATIVE_STATUS_ENTER };
