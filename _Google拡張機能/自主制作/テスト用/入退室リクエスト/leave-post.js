/**
 * 退室: sendLeaveMail の onclick から取り出せる引数の処理と、退室用 data_list の POST
 *
 * sendLeaveMail(r_id, is_mail, c_id, f_id, attend_flg, linkage) だけでは
 * attendance.js の setAttendanceSaveData 相当のフィールドが足りないため、
 * 実際の退室 POST は日付・入退室時刻・利用分数などを patch で足してから taishitsu を呼ぶ想定。
 *
 * 依存: attendance-post-common.js
 */
(() => {
  window.HugAttendance = window.HugAttendance || {};

  const postAttendanceDataList = () => {
    const fn = window.HugAttendance.postAttendanceDataList;
    if (typeof fn !== "function") {
      throw new Error(
        "postAttendanceDataList がありません。attendance-post-common.js を先に読み込んでください."
      );
    }
    return fn;
  };

  const RE_SEND_LEAVE =
    /sendLeaveMail\s*\(\s*['"]?([^'",)]+)['"]?\s*,\s*([^,]+)\s*,\s*([^,]+)\s*,\s*([^,]+)\s*,\s*([^,]+)\s*,\s*([^)]+)\s*\)/;

  /**
   * @param {string|{getAttribute?: (s: string) => string|null}} source
   * @returns {{ r_id: string, is_mail: number, c_id: number, f_id: number, attend_flg: number, linkage: number }}
   */
  const argsFromLeaveButton = (source) => {
    const onclickAttr =
      typeof source === "string"
        ? source
        : source?.getAttribute?.("onclick") ?? "";

    const m = onclickAttr.match(RE_SEND_LEAVE);
    if (!m) {
      throw new Error("sendLeaveMail の onclick を解析できません");
    }

    const [, r_id, is_mail, c_id, f_id, attend_flg, linkage] = m;

    return {
      r_id: String(r_id).trim(),
      is_mail: Number(String(is_mail).trim()),
      c_id: Number(String(c_id).trim()),
      f_id: Number(String(f_id).trim()),
      attend_flg: Number(String(attend_flg).trim()),
      linkage: Number(String(linkage).trim())
    };
  };

  /**
   * onclick から得た引数 + patch をマージした退室用 data_list のたたき台（attendance_type: 2）
   * patch には少なくとも date, enter_time_hi, leave_time_hi, diff_check_time 等が必要（サーバ仕様に合わせて拡張）
   *
   * @param {object} patch AttendanceSave に載せる残りのキー。mail_flg 未指定時は 0
   */
  const leaveDataListFromOnclick = (source, patch = {}) => {
    const args = argsFromLeaveButton(source);
    const { mail_flg = 0, hidden_mail_only = "", ...rest } = patch;

    return {
      ...rest,
      attendance_type: 2,
      r_id: args.r_id,
      c_id: args.c_id,
      f_id: args.f_id,
      attend_flg: args.attend_flg,
      linkage: args.linkage,
      mail_flg: Number(mail_flg),
      hidden_mail_only: hidden_mail_only
    };
  };

  /**
   * 組み立て済みの退室 data_list を POST（attendance_type が 2 であることを確認）
   * @returns {Promise<{ dataList: object, json: object }>}
   */
  const taishitsu = async (dataList) => {
    if (Number(dataList.attendance_type) !== 2) {
      throw new Error("退室 POST には data_list.attendance_type === 2 が必要です");
    }
    const json = await postAttendanceDataList()(dataList);
    return { dataList, json };
  };

  /**
   * onclick 由来のベース + patch で data_list を組み立てて POST
   */
  const taishitsuFromOnclick = async (source, patch) => {
    const dataList = leaveDataListFromOnclick(source, patch);
    return taishitsu(dataList);
  };

  const postLeaveAttendance = (dataList) => postAttendanceDataList()(dataList);

  /** sendLeaveMail の第2引数 is_mail が 1 か */
  const isMailFromLeaveOnclick = (source) => {
    try {
      return argsFromLeaveButton(source).is_mail === 1;
    } catch {
      return false;
    }
  };

  window.HugAttendance.isMailFromLeaveOnclick = isMailFromLeaveOnclick;
  window.HugAttendance.argsFromLeaveButton = argsFromLeaveButton;
  window.HugAttendance.leaveDataListFromOnclick = leaveDataListFromOnclick;
  window.HugAttendance.taishitsu = taishitsu;
  window.HugAttendance.taishitsuFromOnclick = taishitsuFromOnclick;
  window.HugAttendance.postLeaveAttendance = postLeaveAttendance;
})();
