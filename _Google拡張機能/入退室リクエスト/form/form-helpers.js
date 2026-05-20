(() => {
  const HA = (window.HugAttendance = window.HugAttendance || {});
  const Form = (HA.Form = HA.Form || {});
  /*
    HTMLエスケープ
  */
  const escapeHtml = (value) => {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  };

  const HUG_TIME_RE = /^\d{1,2}:\d{2}$/;

  const WEEKDAY_JA = ["日", "月", "火", "水", "木", "金", "土"];

  /** 退室時刻が HH:MM なら退室済み */
  const isLeftRecord = (item) =>
    HUG_TIME_RE.test(String(item?.leaveTime || "").trim());

  /** 退室済み表示フラグ=0 のとき表から隠す行 */
  const isHiddenClosedRecord = (item) =>
    isLeftRecord(item) || Boolean(item?.isAbsenceStatus);

  const parseHmToMinutes = (hm) => {
    const m = String(hm ?? "").trim().match(/^(\d{1,2}):(\d{2})$/);
    if (!m) return null;
    const h = Number(m[1]);
    const mi = Number(m[2]);
    if (Number.isNaN(h) || Number.isNaN(mi)) return null;
    return h * 60 + mi;
  };

  const minutesSinceMidnight = (d) => d.getHours() * 60 + d.getMinutes();

  /** 現在時刻がハーフタイム境界以上なら true（分単位で比較） */
  const isNowAtOrAfterHalfTime = (nowDate, halfTimeHm) => {
    const boundary = parseHmToMinutes(halfTimeHm);
    if (boundary == null) return true;
    return minutesSinceMidnight(nowDate) >= boundary;
  };

  /** 午後フラグかつハーフタイム前は入室ボタンを抑止 */
  const isAfternoonEnterHeldUntilHalfTime = (pref, halfTimeHm, nowDate) => {
    const afternoon = Number(pref?.amPmFlag) >= 1;
    if (!afternoon) return false;
    return !isNowAtOrAfterHalfTime(nowDate, halfTimeHm);
  };

  const buildEnterChipText = (item) => {
    const ha = window.HugAttendance;
    if (!item.enterOnclick || !ha.dataListFromEnterButton) {
      return "（入室onclick なし）";
    }
    try {
      const parsed = ha.parseEnterOnclick
        ? ha.parseEnterOnclick(item.enterOnclick)
        : null;
      const isMail =
        typeof ha.isEnterMailEnabled === "function"
          ? ha.isEnterMailEnabled(item)
          : parsed?.is_mail === 1;
      const usesNative =
        typeof ha.shouldDelegateEnterToNative === "function" &&
        ha.shouldDelegateEnterToNative(item);
      const dl = ha.dataListFromEnterButton(item.enterOnclick, { mail_flg: 0 });
      return [
        "【送信プレビュー・入室】",
        `c_id: ${dl.c_id}`,
        `attendance_type: ${dl.attendance_type}`,
        `attend_flg: ${dl.attend_flg}`,
        `is_mail(設定): ${parsed?.is_mail ?? item.enterIsMail ?? "—"}`,
        usesNative
          ? "処理: 本番の入室ボタン（メール・算定は本番ダイアログ）"
          : isMail
            ? "処理: 本番入室ボタンが無いため拡張POST不可"
            : `mail_flg: ${dl.mail_flg}（拡張POST・通知なし）`,
        `r_id: ${dl.r_id}`,
        `f_id: ${dl.f_id}`,
        `date: ${dl.date}`
      ].join("\n");
    } catch (e) {
      return `解析エラー: ${e.message}`;
    }
  };

  const buildLeaveChipText = (item) => {
    const ha = window.HugAttendance;
    if (!item.leaveOnclick || !ha.argsFromLeaveButton) {
      return "（退室onclick なし）";
    }
    try {
      const a = ha.argsFromLeaveButton(item.leaveOnclick);
      const isMail =
        typeof ha.isLeaveMailEnabled === "function"
          ? ha.isLeaveMailEnabled(item)
          : a.is_mail === 1;
      const usesNative =
        typeof ha.shouldDelegateLeaveToNative === "function" &&
        ha.shouldDelegateLeaveToNative(item);
      const lines = [
        "【退室・onclick引数＋POST時の主キー】",
        `c_id: ${a.c_id}`,
        `attendance_type: 2（退室POST時）`,
        `attend_flg: ${a.attend_flg}`,
        `is_mail(設定): ${a.is_mail}`,
        usesNative
          ? "処理: 本番の退室ボタン（30分・算定・メールは本番）"
          : isMail
            ? "処理: 本番退室ボタンが無いため拡張POST不可"
            : "mail_flg: 0（拡張POST・通知なし）",
        `r_id: ${a.r_id}`,
        `f_id: ${a.f_id}`,
        `linkage: ${a.linkage}`
      ];
      if (item.detailPageDate) {
        lines.push(`date(一覧): ${item.detailPageDate}`);
      }
      lines.push("※完全な退室POSTは他フィールドが必要です。");
      return lines.join("\n");
    } catch (e) {
      return `解析エラー: ${e.message}`;
    }
  };

  const wrapBtnWithChip = (buttonHtml, chipText) => {
    const tip = escapeHtml(
      String(chipText).replace(/\s+/g, " ").trim().slice(0, 500)
    );
    const merged = /\stitle=/.test(buttonHtml)
      ? buttonHtml
      : buttonHtml.replace("<button ", `<button title="${tip}" `);
    return `<span class="hug-btn-chip-wrap">${merged}</span>`;
  };

  const MAIL_ICON_SVG = `<span class="hug-btn-mail-icon" aria-hidden="true" title="メール確認あり"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" focusable="false"><path fill="currentColor" d="M1 3.5A1.5 1.5 0 0 1 2.5 2h11A1.5 1.5 0 0 1 15 3.5v9a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 1 12.5v-9zm1.5-.5a.5.5 0 0 0-.5.5v.217l5.834 4.375a.5.5 0 0 0 .616 0L14 3.717V3.5a.5.5 0 0 0-.5-.5h-11zm12.29 1.625L8.5 8.876 1.71 4.625A.5.5 0 0 0 1 5v7.5a.5.5 0 0 0 .5.5h13a.5.5 0 0 0 .5-.5V5a.5.5 0 0 0-.21-.392z"/></svg></span>`;

  const itemHasEnterMail = (item) => {
    const ha = window.HugAttendance;
    if (typeof ha?.isEnterMailEnabled === "function") {
      return ha.isEnterMailEnabled(item);
    }
    return (
      item?.isEnterMailEnabled === true ||
      Number(item?.enterIsMailResolved) === 1
    );
  };

  const itemHasLeaveMail = (item) => {
    const ha = window.HugAttendance;
    if (typeof ha?.isLeaveMailEnabled === "function") {
      return ha.isLeaveMailEnabled(item);
    }
    return Number(item?.leaveIsMail) === 1;
  };

  /** @param {string} label ボタン文言（HTMLエスケープ前のプレーン文字列） */
  const buildPostButtonInnerHtml = (label, hasMail) => {
    const text = escapeHtml(label);
    if (!hasMail) return text;
    return `<span class="hug-btn-label-with-mail">${MAIL_ICON_SVG}<span class="hug-btn-label-text">${text}</span></span>`;
  };

  const buildLeavePatchFromRow = (item, { mail_flg = 0 } = {}) => {
    const date = String(item.detailPageDate || "").trim();
    const enter = String(item.enterTime || "").trim();
    if (!date) {
      throw new Error("日付(detailPageDate)がありません。出席一覧HTMLに name=date があるか確認してください。");
    }
    if (!HUG_TIME_RE.test(enter)) {
      throw new Error("入室時刻(HH:MM)が無いため退室PATCHを組めません。");
    }

    let leave = String(item.leaveTime || "").trim();
    if (!leave) {
      const n = new Date();
      leave = `${n.getHours()}:${String(n.getMinutes()).padStart(2, "0")}`;
    }
    if (!HUG_TIME_RE.test(leave)) {
      throw new Error("退室時刻が無効です。");
    }

    const [sh, sm] = enter.split(":").map((x) => Number(x));
    const [eh, em] = leave.split(":").map((x) => Number(x));
    let diff = eh * 60 + em - (sh * 60 + sm);
    if (diff < 0) {
      diff += 24 * 60;
    }
    const ih = Math.floor(diff / 60);
    const im = diff % 60;
    const interval_time = `${ih}時間${im}分`;

    return {
      date,
      enter_time_hi: enter,
      leave_time_hi: leave,
      diff_check_time: diff,
      interval_time,
      hidden_mail_only: "",
      mail_flg: Number(mail_flg)
    };
  };

  /** 種別列（alertType）のソート用。大きいほど先 */
  const getSortAlertType = (item) => {
    const n = Number(item?.hugAlertPref?.alertType);
    if (Number.isNaN(n)) return 0;
    return Math.max(0, Math.floor(n));
  };

  /** 入室時刻のソート用（分）。未入室・欠席などは末尾へ */
  const getSortEnterMinutes = (item) => {
    const mins = parseHmToMinutes(String(item?.enterTime || "").trim());
    return mins == null ? 24 * 60 : mins;
  };

  /**
   * 表示行をソート: ①種別降順 ②入室時刻昇順（同値は元の index）
   * @param {{ item: object, index: number }[]} entries
   */
  /** パネル折りたたみ時に退室アラート件数をヘッダーへ表示 */
  const updateCollapsedLeaveAlertBadge = (alertCount) => {
    const panel = document.querySelector("#hug-attendance-panel");
    if (!panel) return;

    const badge = panel.querySelector(".hug-leave-alert-collapsed-badge");
    if (!badge) return;

    const n = Number(alertCount) || 0;
    if (n > 0) {
      badge.textContent = `退室アラート ${n}件`;
      badge.hidden = false;
      panel.classList.add("hug-has-leave-alert");
    } else {
      badge.textContent = "";
      badge.hidden = true;
      panel.classList.remove("hug-has-leave-alert");
    }
  };

  const sortDisplayEntries = (entries) => {
    return [...entries].sort((a, b) => {
      const typeDiff = getSortAlertType(b.item) - getSortAlertType(a.item);
      if (typeDiff !== 0) return typeDiff;

      const enterDiff =
        getSortEnterMinutes(a.item) - getSortEnterMinutes(b.item);
      if (enterDiff !== 0) return enterDiff;

      return a.index - b.index;
    });
  };

  Object.assign(Form, {
    WEEKDAY_JA,
    HUG_TIME_RE,
    escapeHtml,
    isLeftRecord,
    isHiddenClosedRecord,
    parseHmToMinutes,
    minutesSinceMidnight,
    isNowAtOrAfterHalfTime,
    isAfternoonEnterHeldUntilHalfTime,
    buildEnterChipText,
    buildLeaveChipText,
    wrapBtnWithChip,
    itemHasEnterMail,
    itemHasLeaveMail,
    buildPostButtonInnerHtml,
    buildLeavePatchFromRow,
    updateCollapsedLeaveAlertBadge,
    sortDisplayEntries
  });
})();
