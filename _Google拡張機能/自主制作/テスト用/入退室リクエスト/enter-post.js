/**
 * 入室: sendEnterMail の onclick から data_list を組み立て、ajax_attendance.php へ POST
 * 依存: attendance-post-common.js（postAttendanceDataList）、content.js（WM_BASE_URL 推奨）
 */
(() => {
  window.HugAttendance = window.HugAttendance || {};

  const postAttendanceDataList = () => {
    const fn = window.HugAttendance.postAttendanceDataList;
    if (typeof fn !== "function") {
      throw new Error(
        "postAttendanceDataList がありません。attendance-post-common.js を先に読み込んでください。"
      );
    }
    return fn;
  };

  const RE_SEND_ENTER_10 =
    /sendEnterMail\s*\(\s*['"]?([^'",)]+)['"]?\s*,\s*([^,]+)\s*,\s*([^,]+)\s*,\s*([^,]+)\s*,\s*([^,]+)\s*,\s*([^,]+)\s*,\s*['"]?([^'",)]+)['"]?\s*,\s*([^,]+)\s*,\s*([^,]+)\s*,\s*([^)]+)\s*\)/;

  const RE_SEND_ENTER_8 =
    /sendEnterMail\s*\(\s*['"]?([^'",)]+)['"]?\s*,\s*([^,]+)\s*,\s*([^,]+)\s*,\s*([^,]+)\s*,\s*([^,]+)\s*,\s*([^,]+)\s*,\s*['"]?([^'",)]+)['"]?\s*,\s*([^)]+)\s*\)/;

  const getOnclickAttr = (source) =>
    typeof source === "string"
      ? source
      : source?.getAttribute?.("onclick") ?? "";

  /**
   * @param {string|{getAttribute?: (s: string) => string|null}} source
   * @returns {{ is_mail: number, r_id: string, c_id: string, f_id: string, attend_flg: string, linkage: string, date: string, strength_action: string, special_support: string, meal_add: string }}
   */
  const parseEnterOnclick = (source) => {
    const onclickAttr = getOnclickAttr(source);

    let is_mail;
    let r_id;
    let c_id;
    let f_id;
    let attend_flg;
    let linkage;
    let date;
    let strength_action;
    let special_support;
    let meal_add;

    const m10 = onclickAttr.match(RE_SEND_ENTER_10);

    if (m10) {
      [, r_id, is_mail, c_id, f_id, attend_flg, linkage, date, strength_action, special_support, meal_add] =
        m10;
    } else {
      const m8 = onclickAttr.match(RE_SEND_ENTER_8);
      if (!m8) {
        throw new Error("sendEnterMail の onclick を解析できません");
      }
      [, r_id, is_mail, c_id, f_id, attend_flg, linkage, date, strength_action] = m8;
      special_support = "0";
      meal_add = "0";
    }

    return {
      is_mail: Number(String(is_mail).trim()),
      r_id: String(r_id).trim(),
      c_id: String(c_id).trim(),
      f_id: String(f_id).trim(),
      attend_flg: String(attend_flg).trim(),
      linkage: String(linkage).trim(),
      date: String(date).trim(),
      strength_action: String(strength_action).trim(),
      special_support: String(special_support).trim(),
      meal_add: String(meal_add).trim()
    };
  };

  /** sendEnterMail の第2引数 is_mail が 1 か */
  const isMailFromEnterOnclick = (source) => {
    try {
      return parseEnterOnclick(source).is_mail === 1;
    } catch {
      return false;
    }
  };

  /**
   * @param {string|{getAttribute?: (s: string) => string|null}} source onclick 文字列、または button 要素
   */
  const dataListFromEnterButton = (source, { mail_flg = 0 } = {}) => {
    const parsed = parseEnterOnclick(source);
    const {
      r_id,
      c_id,
      f_id,
      attend_flg,
      linkage,
      date,
      strength_action,
      special_support,
      meal_add
    } = parsed;

    return {
      attendance_type: 1,
      r_id: String(r_id).trim(),
      mail_flg: Number(mail_flg),
      c_id: Number(String(c_id).trim()),
      f_id: Number(String(f_id).trim()),
      attend_flg: Number(String(attend_flg).trim()),
      linkage: Number(String(linkage).trim()),
      date: String(date).trim(),
      strength_action: Number(String(strength_action).trim()),
      special_support: Number(String(special_support).trim()),
      meal_add: Number(String(meal_add).trim())
    };
  };

  /**
   * 入室: onclick または要素 → dataList → POST
   * @returns {Promise<{ dataList: object, json: object }>}
   */
  const nyushitu = async (source, { mail_flg = 0 } = {}) => {
    const dataList = dataListFromEnterButton(source, { mail_flg });
    const json = await postAttendanceDataList()(dataList);
    return { dataList, json };
  };

  /**
   * 入室の統合処理（本番委譲 → 拡張メール確認+POST → 通常POST）
   * @param {object} item 出席一覧の1行
   * @returns {Promise<{ mode: string, statusMessage: string, dataList?: object, json?: object, mail_flg?: number }>}
   */
  const performEnterAction = async (item) => {
    const ha = window.HugAttendance;

    if (!item?.enterOnclick) {
      throw new Error("入室 onclick がありません");
    }

    if (
      typeof ha.shouldDelegateEnterToNative === "function" &&
      ha.shouldDelegateEnterToNative(item)
    ) {
      if (typeof ha.triggerNativeEnter !== "function") {
        throw new Error(
          "triggerNativeEnter がありません。native-delegate.js を読み込んでください。"
        );
      }
      ha.triggerNativeEnter(item);
      return {
        mode: "native",
        statusMessage:
          ha.NATIVE_STATUS_ENTER ||
          "本番の入室処理を開始しました。画面のダイアログで操作後、パネルの「更新」で一覧を反映してください。"
      };
    }

    if (typeof ha.isEnterMailEnabled === "function" && ha.isEnterMailEnabled(item)) {
      if (typeof ha.resolveMailFlgForPost !== "function") {
        throw new Error(
          "is_mail=1 ですが本番入室ボタンが見つかりません。出席表を再読み込みしてください。"
        );
      }
      const mail_flg = await ha.resolveMailFlgForPost(item, "enter");
      const { dataList, json } = await nyushitu(item.enterOnclick, { mail_flg });
      return {
        mode: "extension-mail",
        mail_flg,
        dataList,
        json,
        statusMessage: `入室を記録しました（r_id=${dataList.r_id} / mail_flg=${mail_flg}）`
      };
    }

    const { dataList, json } = await nyushitu(item.enterOnclick, { mail_flg: 0 });
    return {
      mode: "extension",
      mail_flg: 0,
      dataList,
      json,
      statusMessage: `入室を記録しました（r_id=${dataList.r_id}）`
    };
  };

  const postEnterAttendance = (dataList) => postAttendanceDataList()(dataList);

  window.HugAttendance.parseEnterOnclick = parseEnterOnclick;
  window.HugAttendance.isMailFromEnterOnclick = isMailFromEnterOnclick;
  window.HugAttendance.dataListFromEnterButton = dataListFromEnterButton;
  window.HugAttendance.nyushitu = nyushitu;
  window.HugAttendance.performEnterAction = performEnterAction;
  window.HugAttendance.postEnterAttendance = postEnterAttendance;
})();
