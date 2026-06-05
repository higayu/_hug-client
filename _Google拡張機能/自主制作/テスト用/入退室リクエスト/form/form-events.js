(() => {
  const HA = (window.HugAttendance = window.HugAttendance || {});
  const Form = (HA.Form = HA.Form || {});
  const onHugPostClick = async (event) => {
    const btn = event.target.closest(
      ".hug-btn-post-enter, .hug-btn-post-leave"
    );
    if (!btn || btn.disabled) return;

    const action = btn.getAttribute("data-hug-action");
    const rawIdx = btn.getAttribute("data-hug-row-index");
    const idx = rawIdx == null ? NaN : Number(rawIdx);
    const item = Form.getLastSnapshot()[idx];

    const panel = document.querySelector("#hug-attendance-panel");
    const status = panel?.querySelector(".hug-attendance-status");

    if (action === "enter") {
      if (
        typeof window.HugAttendance.performEnterAction !== "function" &&
        typeof window.HugAttendance.nyushitu !== "function"
      ) {
        console.error(
          "[HUG WM] performEnterAction / nyushitu がありません。enter-post.js を読み込んでください。"
        );
        return;
      }
      if (!item?.enterOnclick) {
        console.warn("[HUG WM] 入室onclickなし index=", idx);
        return;
      }

      const halfTimeHm =
        typeof window.HugAttendance.getHalfTime === "function"
          ? window.HugAttendance.getHalfTime()
          : "12:00";
      const prefEnter = item.hugAlertPref || { amPmFlag: 0 };
      if (Form.isAfternoonEnterHeldUntilHalfTime(prefEnter, halfTimeHm, new Date())) {
        console.warn(
          "[HUG WM] 午後枠のためハーフタイム前は入室できません:",
          halfTimeHm
        );
        return;
      }

      btn.disabled = true;
      const prevText = btn.textContent;
      btn.textContent = "処理中…";

      try {
        const perform =
          window.HugAttendance.performEnterAction ||
          (async (row) => {
            const { dataList } = await window.HugAttendance.nyushitu(
              row.enterOnclick,
              { mail_flg: 0 }
            );
            return {
              mode: "extension",
              statusMessage: `入室を記録しました（r_id=${dataList.r_id}）`
            };
          });

        const result = await perform(item);
        if (status) {
          status.textContent = result.statusMessage;
        }
        if (
          result.mode !== "native" &&
          typeof window.HugAttendance.runAttendanceUpdate === "function"
        ) {
          await window.HugAttendance.runAttendanceUpdate();
        }
      } catch (e) {
        console.error("[HUG WM] 入室エラー:", e);
        if (status) {
          status.textContent = `入室エラー: ${Form.escapeHtml(e.message)}`;
        }
      } finally {
        btn.disabled = false;
        btn.textContent = prevText;
      }
      return;
    }

    if (action === "leave") {
      if (typeof window.HugAttendance.taishitsuFromOnclick !== "function") {
        console.error(
          "[HUG WM] taishitsuFromOnclick がありません。leave-post.js を読み込んでください。"
        );
        return;
      }
      if (!item?.leaveOnclick) {
        console.warn("[HUG WM] 退室onclickなし index=", idx);
        return;
      }

      btn.disabled = true;
      const prevText = btn.textContent;
      btn.textContent = "処理中…";

      try {
        if (
          typeof window.HugAttendance.shouldDelegateLeaveToNative === "function" &&
          window.HugAttendance.shouldDelegateLeaveToNative(item)
        ) {
          if (typeof window.HugAttendance.triggerNativeLeave !== "function") {
            throw new Error(
              "triggerNativeLeave がありません。native-delegate.js を読み込んでください。"
            );
          }
          window.HugAttendance.triggerNativeLeave(item);
          if (status) {
            status.textContent =
              window.HugAttendance.NATIVE_STATUS_LEAVE ||
              "本番の退室ダイアログで続けてください。";
          }
          return;
        }

        const patch = Form.buildLeavePatchFromRow(item, { mail_flg: 0 });
        const { dataList } = await window.HugAttendance.taishitsuFromOnclick(
          item.leaveOnclick,
          patch
        );
        if (status) {
          status.textContent = `退室を送信しました（r_id=${Form.escapeHtml(String(dataList.r_id))}）`;
        }
        if (typeof window.HugAttendance.runAttendanceUpdate === "function") {
          await window.HugAttendance.runAttendanceUpdate();
        }
      } catch (e) {
        console.error("[HUG WM] 退室エラー:", e);
        if (status) {
          status.textContent = `退室エラー: ${Form.escapeHtml(e.message)}`;
        }
      } finally {
        btn.disabled = false;
        btn.textContent = prevText;
      }
    }
  };

  const onAlertPrefChange = async (event) => {
    const t = event.target;
    if (!t.classList.contains("hug-alert-pref-input")) return;

    const weekdayRaw = t.getAttribute("data-hug-weekday");
    const cId = t.getAttribute("data-hug-cid");
    const field = t.getAttribute("data-hug-pref-field");
    if (weekdayRaw == null || cId == null || !field) return;

    const weekdayIndex = Number(weekdayRaw);
    if (Number.isNaN(weekdayIndex)) return;

    if (typeof window.HugAttendance.setAlertPref !== "function") return;

    if (field === "alertType") {
      const n = Number(t.value);
      if (Number.isNaN(n)) return;
      window.HugAttendance.setAlertPref(weekdayIndex, cId, { alertType: n });
    } else if (field === "alertAfterMinutes") {
      const n = Number(t.value);
      if (Number.isNaN(n)) return;
      window.HugAttendance.setAlertPref(weekdayIndex, cId, {
        alertAfterMinutes: Math.max(0, Math.floor(n))
      });
    } else if (field === "amPmFlag") {
      const n = Number(t.value);
      if (Number.isNaN(n)) return;
      window.HugAttendance.setAlertPref(weekdayIndex, cId, {
        amPmFlag: n >= 1 ? 1 : 0
      });
    } else {
      return;
    }

    if (typeof window.HugAttendance.runAttendanceUpdate === "function") {
      await window.HugAttendance.runAttendanceUpdate();
    }
  };

  const onHalfTimePersist = (event) => {
    const t = event.target;
    if (!t?.classList?.contains("hug-half-time-input")) return;

    if (
      typeof window.HugAttendance.setHalfTime !== "function" ||
      typeof window.HugAttendance.getHalfTime !== "function"
    ) {
      return;
    }

    const v = String(t.value || "").trim();
    window.HugAttendance.setHalfTime(v);
    t.value = window.HugAttendance.getHalfTime();
  };

  const onRefreshClick = async (event) => {
    event.stopPropagation();

    const btn = event.currentTarget;
    if (btn.disabled) return;

    const panel = document.querySelector("#hug-attendance-panel");
    const status = panel?.querySelector(".hug-attendance-status");

    if (typeof window.HugAttendance.runAttendanceUpdate !== "function") {
      console.error(
        "[HUG WM] runAttendanceUpdate がありません。timer.js を読み込んでください。"
      );
      if (status) {
        status.textContent = "更新機能が読み込まれていません（timer.js）";
      }
      return;
    }

    btn.disabled = true;
    const prevText = btn.textContent;
    btn.textContent = "取得中…";
    if (status) {
      status.textContent = "データを取得しています…";
    }

    try {
      await window.HugAttendance.runAttendanceUpdate();
    } finally {
      btn.disabled = false;
      btn.textContent = prevText;
    }
  };

  const onShowLeftRecordsChange = (event) => {
    const t = event.target;
    if (!t?.classList?.contains("hug-show-left-select")) return;

    if (typeof window.HugAttendance.setShowLeftRecords !== "function") return;

    window.HugAttendance.setShowLeftRecords(t.value);

    if (
      Form.getLastSnapshot().length &&
      typeof window.HugAttendance.renderAttendanceForm === "function"
    ) {
      Form.renderAttendanceForm(Form.getLastSnapshot());
    } else if (typeof window.HugAttendance.runAttendanceUpdate === "function") {
      void window.HugAttendance.runAttendanceUpdate();
    }
  };

  Object.assign(Form, {
    onHugPostClick,
    onRefreshClick,
    onAlertPrefChange,
    onHalfTimePersist,
    onShowLeftRecordsChange
  });
})();
