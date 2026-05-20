(() => {
  const HA = (window.HugAttendance = window.HugAttendance || {});
  const Form = (HA.Form = HA.Form || {});
  /*
    フォームを表示
    attendanceList の各要素に isOverTwoHours がある前提
  */
  const renderAttendanceForm = (attendanceList) => {
    const panel = Form.createPanelIfNeeded();

    Form.setLastSnapshot(attendanceList);

    const count = panel.querySelector(".hug-attendance-count");
    const status = panel.querySelector(".hug-attendance-status");
    const body = panel.querySelector(".hug-attendance-body");

    const now = new Date();
    const nowText = now.toLocaleString();
    const timeText = now.toLocaleTimeString();

    const showLeftRecords =
      typeof window.HugAttendance.getShowLeftRecords === "function"
        ? window.HugAttendance.getShowLeftRecords()
        : 1;
    const showLeftFlag = Number(showLeftRecords) >= 1 ? 1 : 0;
    const hiddenClosedCount = attendanceList.filter((item) =>
      Form.isHiddenClosedRecord(item)
    ).length;

    const displayEntries = Form.sortDisplayEntries(
      attendanceList
        .map((item, index) => ({ item, index }))
        .filter(
          ({ item }) => showLeftFlag === 1 || !Form.isHiddenClosedRecord(item)
        )
    );

    const alertCount = displayEntries.filter(
      ({ item }) => item.isOverTwoHours
    ).length;

    Form.updateCollapsedLeaveAlertBadge(alertCount);

    const absenceCount = displayEntries.filter(
      ({ item }) => item.isAbsenceStatus
    ).length;

    const hiddenClosedNote =
      showLeftFlag === 0 && hiddenClosedCount > 0
        ? ` / 退室済み・欠席 非表示 ${hiddenClosedCount}件`
        : "";

    count.textContent = `${displayEntries.length}件表示${hiddenClosedNote} / 経過アラート ${alertCount}件 / 欠席 ${absenceCount}件 / ${timeText}`;
    status.textContent = `最終取得: ${nowText} / 表示: ${displayEntries.length}件（全${attendanceList.length}件）${hiddenClosedNote} / 経過アラート: ${alertCount} / 欠席: ${absenceCount}`;

    if (!attendanceList.length) {
      Form.updateCollapsedLeaveAlertBadge(0);
      body.innerHTML = `
        <p>入退室データが見つかりませんでした。</p>
      `;
      return;
    }

    const halfTimeVal =
      typeof window.HugAttendance.getHalfTime === "function"
        ? window.HugAttendance.getHalfTime()
        : "12:00";

    const summaryClass = alertCount > 0
      ? "hug-alert-summary"
      : "hug-no-alert-summary";

    const summaryText = alertCount > 0
      ? `注意：設定した経過時間を満たして未退室の児童が ${alertCount}件あります。`
      : "経過アラート条件を満たす未退室の児童はいません。";

    const rowsHtml = displayEntries
      .map(({ item, index }) => {
      const pref = item.hugAlertPref || {
        alertType: 1,
        alertAfterMinutes: 120,
        amPmFlag: 0
      };
      const amPmSel = Number(pref.amPmFlag) >= 1 ? "1" : "0";
      const isType2Alert =
        item.isOverTwoHours && Number(pref.alertType) === 2;
      const rowClass = [
        item.isOverTwoHours ? "hug-over-two-hours" : "",
        isType2Alert ? "hug-alert-type2" : ""
      ]
        .filter(Boolean)
        .join(" ");
      const wday =
        item.hugWeekdayIndex ??
        (typeof window.HugAttendance.getWeekdayIndexFromDetailDate === "function"
          ? window.HugAttendance.getWeekdayIndexFromDetailDate(
              item.detailPageDate
            )
          : new Date().getDay());
      const wdayLabel = Form.WEEKDAY_JA[wday] ?? String(wday);

      let statusHtml;
      if (item.isAbsenceStatus) {
        const title = Form.escapeHtml(item.absenceLabel || "欠席");
        statusHtml = `<span class="hug-absence-badge" title="${title}">欠席</span>`;
      } else if (item.isOverTwoHours) {
        const mLabel = Form.escapeHtml(String(pref.alertAfterMinutes));
        if (Number(pref.alertType) === 2) {
          statusHtml = `<span class="hug-alert-badge-type2">${mLabel}分超過・種別2</span>`;
        } else {
          statusHtml = `<span class="hug-alert-badge">${mLabel}分超過</span>`;
        }
      } else {
        statusHtml = `<span class="hug-normal-badge">通常</span>`;
      }

      const enterCellContent = item.isAbsenceStatus
        ? `<span class="hug-enter-absence-note">${Form.escapeHtml(item.absenceLabel || "欠席")}</span>`
        : `<input type="text" value="${Form.escapeHtml(item.enterTime)}" readonly>`;

      const canPostEnter =
        !item.isAbsenceStatus &&
        item.enterOnclick &&
        String(item.enterOnclick).includes("sendEnterMail");

      const afternoonEnterHeld = Form.isAfternoonEnterHeldUntilHalfTime(
        pref,
        halfTimeVal,
        now
      );

      const canPostLeave =
        !item.isAbsenceStatus &&
        item.leaveOnclick &&
        String(item.leaveOnclick).includes("sendLeaveMail") &&
        Form.HUG_TIME_RE.test(String(item.enterTime || "").trim());

      const enterChip = Form.buildEnterChipText(item);
      const leaveChip = Form.buildLeaveChipText(item);

      const ha = window.HugAttendance;
      const enterUsesNative =
        typeof ha.shouldDelegateEnterToNative === "function" &&
        ha.shouldDelegateEnterToNative(item);
      const leaveUsesNative =
        typeof ha.shouldDelegateLeaveToNative === "function" &&
        ha.shouldDelegateLeaveToNative(item);

      const enterHasMail = Form.itemHasEnterMail(item);
      const leaveHasMail = Form.itemHasLeaveMail(item);

      const enterBtnLabel = enterUsesNative ? "入室" : "入室";
      const enterNativeClass = enterUsesNative ? " hug-btn-native" : "";
      const enterMailClass = enterHasMail ? " hug-btn-has-mail" : "";
      const enterTitleParts = [];
      if (afternoonEnterHeld) enterTitleParts.push(`午後枠：ハーフタイム（${halfTimeVal}）になるまで入室できません`);
      if (enterUsesNative) enterTitleParts.push("本番の入室・メール・算定フローを使用");
      else if (enterHasMail) enterTitleParts.push("メール確認あり（is_mail=1）");
      const enterTitleAttr = enterTitleParts.length
        ? ` title="${Form.escapeHtml(enterTitleParts.join(" / "))}"`
        : "";
      const enterBtnInner = Form.buildPostButtonInnerHtml(
        enterBtnLabel,
        enterHasMail
      );
      const enterBtnRaw = canPostEnter
        ? `<button type="button" class="hug-btn-post-enter${enterNativeClass}${enterMailClass}${afternoonEnterHeld ? " hug-afternoon-enter-wait" : ""}" data-hug-action="enter" data-hug-row-index="${index}"${afternoonEnterHeld ? " disabled" : ""}${enterTitleAttr}${enterHasMail ? ' aria-label="メール確認あり、入室"' : ""}>${enterBtnInner}</button>`
        : "";

      const leaveAlertClass =
        item.isOverTwoHours && canPostLeave ? " hug-leave-alert" : "";
      const leaveBtnLabel = leaveUsesNative ? "退室" : "退室";
      const leaveNativeClass = leaveUsesNative ? " hug-btn-native" : "";
      const leaveMailClass = leaveHasMail ? " hug-btn-has-mail" : "";
      const leaveTitleParts = [];
      if (leaveUsesNative) leaveTitleParts.push("本番の退室・メール・算定フローを使用");
      else if (leaveHasMail) leaveTitleParts.push("メール確認あり（is_mail=1）");
      const leaveTitleAttr = leaveTitleParts.length
        ? ` title="${Form.escapeHtml(leaveTitleParts.join(" / "))}"`
        : "";
      const leaveBtnInner = Form.buildPostButtonInnerHtml(
        leaveBtnLabel,
        leaveHasMail
      );
      const leaveBtnRaw = canPostLeave
        ? `<button type="button" class="hug-btn-post-leave${leaveNativeClass}${leaveMailClass}${leaveAlertClass}" data-hug-action="leave" data-hug-row-index="${index}"${leaveTitleAttr}${leaveHasMail ? ' aria-label="メール確認あり、退室"' : ""}>${leaveBtnInner}</button>`
        : "";

      let postCellInner = "";
      if (item.isAbsenceStatus) {
        postCellInner = `<span class="hug-enter-cell-dash" title="欠席のためPOSTなし">—</span>`;
      } else if (enterBtnRaw || leaveBtnRaw) {
        const parts = [];
        if (enterBtnRaw) {
          parts.push(Form.wrapBtnWithChip(enterBtnRaw, enterChip));
        }
        if (leaveBtnRaw) {
          parts.push(Form.wrapBtnWithChip(leaveBtnRaw, leaveChip));
        }
        postCellInner = `<div class="hug-post-actions">${parts.join("")}</div>`;
      } else {
        postCellInner = `<span class="hug-enter-cell-dash">—</span>`;
      }

      const recordMoveBtn = item.c_id
        ? `<button type="button" class="hug-btn-record-move" data-hug-cid="${Form.escapeHtml(String(item.c_id))}" title="専門的支援加算記録へ移動">移動</button>`
        : `<span class="hug-enter-cell-dash">—</span>`;

      return `
        <tr class="${rowClass}">
          <td>
            <input type="text" value="${Form.escapeHtml(item.c_id)}" readonly>
          </td>
          <td class="hug-name-text"><button type="button" class="hug-btn-personal-record" data-hug-cid="${Form.escapeHtml(String(item.c_id))}" data-hug-cal-date="${Form.escapeHtml(String(item.detailPageDate || ""))}" title="個人記録を新しいタブで開く">${Form.escapeHtml(item.name)}</button></td>
          <td>
            <input type="number" class="hug-alert-pref-input" title="アラート種別（0=オフ、1=パネル、2=パネル+別ウィンドウ）" data-hug-pref-field="alertType" data-hug-weekday="${wday}" data-hug-cid="${Form.escapeHtml(item.c_id)}" value="${Form.escapeHtml(pref.alertType)}" min="0" max="99">
          </td>
          <td>
            <input type="number" class="hug-alert-pref-input hug-alert-pref-input-minutes" title="アラートまでの経過時間（分）" data-hug-pref-field="alertAfterMinutes" data-hug-weekday="${wday}" data-hug-cid="${Form.escapeHtml(item.c_id)}" value="${Form.escapeHtml(pref.alertAfterMinutes)}" min="0" step="1">
          </td>
          <td class="hug-alert-pref-note">${Form.escapeHtml(wdayLabel)}曜</td>
          <td>
            <select class="hug-alert-pref-input hug-am-pm-select" title="午前・午後の別（保存されます）" data-hug-pref-field="amPmFlag" data-hug-weekday="${wday}" data-hug-cid="${Form.escapeHtml(item.c_id)}">
              <option value="0"${amPmSel === "0" ? " selected" : ""}>午前</option>
              <option value="1"${amPmSel === "1" ? " selected" : ""}>午後</option>
            </select>
          </td>
          <td>
            ${enterCellContent}
          </td>
          <td>
            <input type="text" value="${Form.escapeHtml(item.leaveTime)}" readonly>
          </td>
          <td>
            ${statusHtml}
          </td>
          <td>
            ${postCellInner}
          </td>
          <td class="hug-kasan-copy">
            ${recordMoveBtn}
          </td>
        </tr>
      `;
    })
      .join("");

    const showLeftSel = showLeftFlag === 1 ? "1" : "0";

    const tableBodyHtml =
      rowsHtml ||
      `<tr><td colspan="11">表示対象の児童がいません（退室済み・欠席 ${hiddenClosedCount}件を非表示中）。</td></tr>`;

    body.innerHTML = `
      <div class="hug-panel-settings-bar">
        <div class="hug-settings-group">
          <span class="hug-settings-label hug-settings-label-half">ハーフタイム</span>
          <input type="time" class="hug-half-time-input" value="${Form.escapeHtml(halfTimeVal)}" step="60" title="午後枠の入室解禁時刻（既定 12:00）。キー hugAttendanceHalfTime">
        </div>
        <span class="hug-settings-sep" aria-hidden="true">|</span>
        <div class="hug-settings-group">
          <span class="hug-settings-label hug-settings-label-left">退室済み</span>
          <select class="hug-show-left-select" title="1=表示、0=非表示（退室済み・欠席の行を隠す）。キー hugAttendanceShowLeftRecords。全${attendanceList.length}件・対象${hiddenClosedCount}件">
            <option value="1"${showLeftSel === "1" ? " selected" : ""}>表示</option>
            <option value="0"${showLeftSel === "0" ? " selected" : ""}>非表示</option>
          </select>
        </div>
      </div>

      <div class="${summaryClass}">
        ${Form.escapeHtml(summaryText)}
      </div>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>氏名</th>
            <th title="0=オフ、1=パネル強調、2=別ウィンドウも表示">種別</th>
            <th title="入室からこの分数経過でアラート">経過(分)</th>
            <th>曜日</th>
            <th title="0=午前、1=午後（行ごとに保存）">午前/午後</th>
            <th>入室</th>
            <th>退室</th>
            <th>状態</th>
            <th>入退室POST</th>
            <th class="hug-kasan-copy">加算記録</th>
          </tr>
        </thead>
        <tbody>
          ${tableBodyHtml}
        </tbody>
      </table>
    `;

    const type2Items = attendanceList.filter(
      (item) =>
        item.isOverTwoHours &&
        Number((item.hugAlertPref || {}).alertType) === 2
    );
    if (
      type2Items.length &&
      typeof window.HugAttendance.openAlertType2Popup === "function"
    ) {
      const pageDate = String(
        attendanceList[0]?.detailPageDate || ""
      ).trim();
      window.HugAttendance.openAlertType2Popup({
        items: type2Items,
        detailPageDate: pageDate
      });
    }
  };

  Form.renderAttendanceForm = renderAttendanceForm;
})();
