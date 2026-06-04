/**
 * is_mail === 1 の入退室は本番ボタン（sendEnterMail / sendLeaveMail）をクリックして
 * メール・算定・30分未満など本番フロー全体に委譲する
 */
(() => {
  window.HugAttendance = window.HugAttendance || {};
  const HA = window.HugAttendance;

  const findNativeEnterButton = (r_id) => {
    const cell = document.querySelector(`#enter${r_id}`);
    return cell?.querySelector?.("button[onclick*='sendEnterMail']") ?? null;
  };

  const findNativeLeaveButton = (r_id) => {
    const cell = document.querySelector(`#leave${r_id}`);
    return cell?.querySelector?.("button[onclick*='sendLeaveMail']") ?? null;
  };

  const hasNativeEnterButton = (r_id) => Boolean(findNativeEnterButton(r_id));

  const hasNativeLeaveButton = (r_id) => Boolean(findNativeLeaveButton(r_id));

  const isNativeEnterMailUiReady = () => {
    if (typeof window.sendEnterMail !== "function") return false;
    const jq = window.jQuery || window.$;
    if (typeof jq !== "function") return false;
    return jq("#addtend_dialog_mail").length > 0;
  };

  /** メール設定ありかつ本番入室ボタンが DOM にある */
  const shouldDelegateEnterToNative = (item) => {
    if (!item?.r_id) return false;
    if (typeof HA.isEnterMailEnabled !== "function") return false;
    if (!HA.isEnterMailEnabled(item)) return false;
    return hasNativeEnterButton(item.r_id);
  };

  /** メール設定ありかつ本番退室ボタンが DOM にある */
  const shouldDelegateLeaveToNative = (item) => {
    if (!item?.r_id) return false;
    if (typeof HA.isLeaveMailEnabled !== "function") return false;
    if (!HA.isLeaveMailEnabled(item)) return false;
    return hasNativeLeaveButton(item.r_id);
  };

  const triggerNativeEnter = (item) => {
    const btn = findNativeEnterButton(item.r_id);
    if (!btn) {
      throw new Error(
        `本番の入室ボタンが見つかりません（#enter${item.r_id}）。出席表を再読み込みしてください。`
      );
    }
    if (!isNativeEnterMailUiReady()) {
      throw new Error(
        "本番の sendEnterMail またはメールダイアログ（#addtend_dialog_mail）がありません。HUG 出席表詳細ページで実行してください。"
      );
    }
    btn.click();
  };

  const triggerNativeLeave = (item) => {
    const btn = findNativeLeaveButton(item.r_id);
    if (!btn) {
      throw new Error(
        `本番の退室ボタンが見つかりません（#leave${item.r_id}）。出席表を再読み込みしてください。`
      );
    }
    btn.click();
  };

  const NATIVE_STATUS_ENTER =
    "本番の入室処理を開始しました。画面のダイアログで操作後、パネルの「更新」で一覧を反映してください。";

  const NATIVE_STATUS_LEAVE =
    "本番の退室処理を開始しました。画面のダイアログで操作後、パネルの「更新」で一覧を反映してください。";

  HA.isNativeEnterMailUiReady = isNativeEnterMailUiReady;
  HA.findNativeEnterButton = findNativeEnterButton;
  HA.findNativeLeaveButton = findNativeLeaveButton;
  HA.hasNativeEnterButton = hasNativeEnterButton;
  HA.hasNativeLeaveButton = hasNativeLeaveButton;
  HA.shouldDelegateEnterToNative = shouldDelegateEnterToNative;
  HA.shouldDelegateLeaveToNative = shouldDelegateLeaveToNative;
  HA.triggerNativeEnter = triggerNativeEnter;
  HA.triggerNativeLeave = triggerNativeLeave;
  HA.NATIVE_STATUS_ENTER = NATIVE_STATUS_ENTER;
  HA.NATIVE_STATUS_LEAVE = NATIVE_STATUS_LEAVE;
})();
