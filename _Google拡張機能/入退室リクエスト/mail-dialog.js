/**
 * 拡張用メール確認（本番 #addtend_dialog_mail の代替）
 * is_mail === 1 かつ本番ボタンが無い場合に resolveMailFlgForPost から利用
 */
(() => {
  window.HugAttendance = window.HugAttendance || {};

  const STYLE_ID = "hug-mail-dialog-style";
  const OVERLAY_CLASS = "hug-mail-dialog-overlay";

  /** @returns {boolean} */
  const normalizeIsMail = (value) => Number(String(value ?? "").trim()) === 1;

  class MailDialogCancelledError extends Error {
    constructor() {
      super("メール送信の選択がキャンセルされました");
      this.name = "MailDialogCancelledError";
    }
  }

  const ensureStyles = () => {
    if (document.querySelector(`#${STYLE_ID}`)) return;

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      .${OVERLAY_CLASS} {
        position: fixed;
        inset: 0;
        z-index: 10000000;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(0, 0, 0, 0.45);
      }

      .hug-mail-dialog-box {
        min-width: 320px;
        max-width: 90vw;
        padding: 20px 24px 18px;
        background: #fff;
        border-radius: 8px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.28);
        font-size: 14px;
        color: #222;
        text-align: center;
      }

      .hug-mail-dialog-title {
        margin: 0 0 8px;
        font-size: 16px;
        font-weight: bold;
      }

      .hug-mail-dialog-sub {
        margin: 0 0 18px;
        font-size: 13px;
        color: #555;
        line-height: 1.5;
      }

      .hug-mail-dialog-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        justify-content: center;
      }

      .hug-mail-dialog-actions button {
        min-width: 120px;
        padding: 8px 16px;
        border: 1px solid #888;
        border-radius: 4px;
        background: #f5f5f5;
        font-size: 14px;
        cursor: pointer;
      }

      .hug-mail-dialog-actions button.hug-mail-send-yes {
        background: #337ab7;
        border-color: #2e6da4;
        color: #fff;
      }

      .hug-mail-dialog-actions button.hug-mail-send-no {
        background: #fff;
      }

      .hug-mail-dialog-actions button.hug-mail-cancel {
        background: #fff;
        color: #666;
      }
    `;
    document.head.appendChild(style);
  };

  let activeCleanup = null;

  const closeActive = () => {
    if (typeof activeCleanup === "function") {
      activeCleanup();
      activeCleanup = null;
    }
  };

  /**
   * @param {{ childName?: string, actionLabel?: string }} [options]
   * @returns {Promise<0|1>} mail_flg（通知する=1 / 通知しない=0）
   */
  const promptMailSend = (options = {}) => {
    closeActive();
    ensureStyles();

    const childName = String(options.childName || "")
      .replace(/\s+/g, " ")
      .trim();
    const actionLabel = String(options.actionLabel || "").trim();
    const subParts = [];
    if (childName) subParts.push(childName);
    if (actionLabel) subParts.push(`${actionLabel}の記録`);
    const subText = subParts.length
      ? subParts.join(" — ")
      : "保護者への通知の有無を選んでください";

    return new Promise((resolve, reject) => {
      const overlay = document.createElement("div");
      overlay.className = OVERLAY_CLASS;
      overlay.setAttribute("role", "dialog");
      overlay.setAttribute("aria-modal", "true");
      overlay.setAttribute("aria-labelledby", "hug-mail-dialog-title");

      const box = document.createElement("div");
      box.className = "hug-mail-dialog-box";

      const title = document.createElement("p");
      title.id = "hug-mail-dialog-title";
      title.className = "hug-mail-dialog-title";
      title.textContent = "保護者様に通知をしてもよろしいですか？";

      const sub = document.createElement("p");
      sub.className = "hug-mail-dialog-sub";
      sub.textContent = subText;

      const actions = document.createElement("div");
      actions.className = "hug-mail-dialog-actions";

      const btnYes = document.createElement("button");
      btnYes.type = "button";
      btnYes.className = "hug-mail-send-yes";
      btnYes.textContent = "通知する";

      const btnNo = document.createElement("button");
      btnNo.type = "button";
      btnNo.className = "hug-mail-send-no";
      btnNo.textContent = "通知しない";

      const btnCancel = document.createElement("button");
      btnCancel.type = "button";
      btnCancel.className = "hug-mail-cancel";
      btnCancel.textContent = "キャンセル";

      actions.append(btnYes, btnNo, btnCancel);
      box.append(title, sub, actions);
      overlay.append(box);
      document.body.appendChild(overlay);

      const finish = (fn) => {
        document.removeEventListener("keydown", onKeyDown);
        overlay.remove();
        activeCleanup = null;
        fn();
      };

      const onKeyDown = (e) => {
        if (e.key === "Escape") {
          finish(() => reject(new MailDialogCancelledError()));
        }
      };

      document.addEventListener("keydown", onKeyDown);

      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) {
          finish(() => reject(new MailDialogCancelledError()));
        }
      });

      btnYes.addEventListener("click", () => finish(() => resolve(1)));
      btnNo.addEventListener("click", () => finish(() => resolve(0)));
      btnCancel.addEventListener("click", () =>
        finish(() => reject(new MailDialogCancelledError()))
      );

      activeCleanup = () => {
        document.removeEventListener("keydown", onKeyDown);
        overlay.remove();
      };

      btnYes.focus();
    });
  };

  /** 入室: enterIsMailResolved / onclick / data-cidsetting */
  const isEnterMailEnabled = (item) => {
    if (item?.isEnterMailEnabled === true) return true;
    if (Number(item?.enterIsMailResolved) === 1) return true;
    if (
      typeof window.HugAttendance.isMailFromEnterOnclick === "function" &&
      item?.enterOnclick
    ) {
      if (window.HugAttendance.isMailFromEnterOnclick(item.enterOnclick)) {
        return true;
      }
    }
    if (item?.enterIsMail != null && item.enterIsMail !== "") {
      return normalizeIsMail(item.enterIsMail);
    }
    return false;
  };

  /** 退室: onclick / leaveIsMail */
  const isLeaveMailEnabled = (item) => {
    if (
      typeof window.HugAttendance.isMailFromLeaveOnclick === "function" &&
      item?.leaveOnclick
    ) {
      if (window.HugAttendance.isMailFromLeaveOnclick(item.leaveOnclick)) {
        return true;
      }
    }
    if (item?.leaveIsMail != null && item.leaveIsMail !== "") {
      return normalizeIsMail(item.leaveIsMail);
    }
    return false;
  };

  /**
   * @param {object} item 出席一覧の1行
   * @param {"enter"|"leave"} kind
   * @returns {Promise<0|1>}
   */
  const resolveMailFlgForPost = async (item, kind) => {
    const needs =
      kind === "enter" ? isEnterMailEnabled(item) : isLeaveMailEnabled(item);
    if (!needs) return 0;

    const actionLabel = kind === "enter" ? "入室" : "退室";
    const childName = String(item?.name || "")
      .replace(/\s+/g, " ")
      .trim();

    return promptMailSend({ childName, actionLabel });
  };

  window.HugAttendance.normalizeIsMail = normalizeIsMail;
  window.HugAttendance.MailDialogCancelledError = MailDialogCancelledError;
  window.HugAttendance.promptMailSend = promptMailSend;
  window.HugAttendance.isEnterMailEnabled = isEnterMailEnabled;
  window.HugAttendance.isLeaveMailEnabled = isLeaveMailEnabled;
  window.HugAttendance.resolveMailFlgForPost = resolveMailFlgForPost;
})();
