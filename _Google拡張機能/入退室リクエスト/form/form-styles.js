(() => {
  const HA = (window.HugAttendance = window.HugAttendance || {});
  const Form = (HA.Form = HA.Form || {});
  const addFormStyle = () => {
    if (document.querySelector("#hug-attendance-form-style")) return;

    const style = document.createElement("style");
    style.id = "hug-attendance-form-style";
    style.textContent = `
      @keyframes hugAlertPulse {
        0% {
          opacity: 1;
          transform: scale(1);
          box-shadow: 0 0 0 rgba(230, 0, 0, 0);
        }

        50% {
          opacity: 0.72;
          transform: scale(1.01);
          box-shadow: 0 0 12px rgba(230, 0, 0, 0.65);
        }

        100% {
          opacity: 1;
          transform: scale(1);
          box-shadow: 0 0 0 rgba(230, 0, 0, 0);
        }
      }

      @keyframes hugBadgeBlink {
        0% {
          opacity: 1;
        }

        50% {
          opacity: 0.35;
        }

        100% {
          opacity: 1;
        }
      }

      #hug-attendance-panel {
        --hug-panel-width-open: min(820px, calc(100vw - 16px));
        --hug-panel-width-collapsed: min(360px, calc(100vw - 16px));
        position: fixed;
        right: 20px;
        top: 50%;
        z-index: 999999;
        width: var(--hug-panel-width-open);
        transform: translateY(-50%);
        background: #ffffff;
        border: 2px solid #333;
        border-radius: 10px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
        font-size: 13px;
        color: #222;
        overflow: hidden;
      }

      #hug-attendance-panel.hug-panel-positioned {
        right: auto !important;
        bottom: auto !important;
        transform: none !important;
      }

      #hug-attendance-panel.hug-collapsed {
        width: var(--hug-panel-width-collapsed);
        border-radius: 6px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
      }

      #hug-attendance-panel.hug-collapsed.hug-has-leave-alert {
        box-shadow: 0 2px 12px rgba(183, 28, 28, 0.35);
      }

      #hug-attendance-panel.hug-collapsed .hug-attendance-header {
        padding: 10px 12px;
        gap: 10px;
        align-items: stretch;
        min-height: 56px;
      }

      #hug-attendance-panel.hug-collapsed .hug-attendance-header > div:first-child {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: flex-start;
        gap: 3px;
        min-width: 0;
        flex: 1 1 auto;
      }

      #hug-attendance-panel.hug-collapsed .hug-attendance-title {
        font-size: 12px;
        white-space: nowrap;
      }

      #hug-attendance-panel.hug-collapsed .hug-attendance-count {
        display: none;
      }

      #hug-attendance-panel.hug-collapsed .hug-refresh-button {
        display: none !important;
      }

      #hug-attendance-panel.hug-collapsed .hug-enter-mail-badge {
        margin-top: 0;
        font-size: 11px;
        line-height: 1.2;
        white-space: nowrap;
      }

      #hug-attendance-panel .hug-leave-alert-collapsed-badge {
        display: none;
        margin-top: 2px;
        font-size: 11px;
        font-weight: bold;
        color: #ffab91;
        line-height: 1.2;
        white-space: nowrap;
      }

      #hug-attendance-panel.hug-collapsed .hug-leave-alert-collapsed-badge:not([hidden]) {
        display: block;
        animation: hugBadgeBlink 1s infinite;
      }

      #hug-attendance-panel:not(.hug-collapsed) .hug-leave-alert-collapsed-badge {
        display: none !important;
      }

      #hug-attendance-panel.hug-collapsed .hug-header-actions {
        gap: 0;
        flex-shrink: 0;
        display: flex;
        align-items: stretch;
      }

      #hug-attendance-panel.hug-collapsed .hug-toggle-button {
        padding: 10px 20px;
        min-width: 60px;
        min-height: 44px;
        font-size: 15px;
        font-weight: bold;
        line-height: 1.3;
        align-self: center;
        box-sizing: border-box;
      }

      #hug-attendance-panel .hug-attendance-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 8px;
        padding: 8px 10px;
        background: #333;
        color: #fff;
        cursor: grab;
        user-select: none;
        touch-action: none;
      }

      #hug-attendance-panel .hug-attendance-header.hug-dragging {
        cursor: grabbing;
      }

      #hug-attendance-panel .hug-header-actions button {
        cursor: pointer;
      }

      #hug-attendance-panel .hug-attendance-title {
        font-size: 14px;
        font-weight: bold;
      }

      #hug-attendance-panel .hug-attendance-count {
        font-size: 12px;
        opacity: 0.9;
        margin-top: 2px;
      }

      #hug-attendance-panel .hug-header-actions {
        display: flex;
        align-items: center;
        gap: 6px;
        flex-shrink: 0;
      }

      #hug-attendance-panel .hug-enter-mail-badge {
        margin-top: 2px;
        font-size: 11px;
        font-weight: normal;
        color: #ffe082;
        line-height: 1.2;
      }

      #hug-attendance-panel .hug-refresh-button,
      #hug-attendance-panel .hug-toggle-button {
        cursor: pointer;
        padding: 2px 8px;
        border: 1px solid #fff;
        border-radius: 4px;
        background: transparent;
        color: #fff;
        font-size: 12px;
        white-space: nowrap;
      }

      #hug-attendance-panel .hug-refresh-button:hover:not(:disabled),
      #hug-attendance-panel .hug-toggle-button:hover {
        background: rgba(255, 255, 255, 0.15);
      }

      #hug-attendance-panel .hug-refresh-button:disabled {
        opacity: 0.65;
        cursor: not-allowed;
      }

      #hug-attendance-panel .hug-attendance-content {
        max-height: 70vh;
        overflow: auto;
        padding: 10px;
        transition: max-height 0.25s ease, padding 0.25s ease;
      }

      #hug-attendance-panel.hug-collapsed .hug-attendance-content {
        max-height: 0;
        padding: 0;
        margin: 0;
        overflow: hidden;
        border: none;
      }

      #hug-attendance-panel .hug-attendance-status {
        font-size: 12px;
        color: #555;
        margin-bottom: 8px;
      }

      #hug-attendance-panel table {
        width: 100%;
        border-collapse: collapse;
      }

      #hug-attendance-panel th,
      #hug-attendance-panel td {
        border: 1px solid #ccc;
        padding: 4px;
        text-align: left;
        vertical-align: middle;
      }

      #hug-attendance-panel th {
        background: #f0f0f0;
        white-space: nowrap;
      }

      #hug-attendance-panel input {
        width: 70px;
        box-sizing: border-box;
        padding: 3px;
      }

      #hug-attendance-panel input[readonly] {
        background: #f7f7f7;
      }

      #hug-attendance-panel .hug-name-input {
        width: 128px;
      }

      #hug-attendance-panel .hug-alert-pref-input {
        width: 52px;
      }

      #hug-attendance-panel .hug-alert-pref-input-minutes {
        width: 58px;
      }

      #hug-attendance-panel select.hug-am-pm-select {
        width: 72px;
        box-sizing: border-box;
        padding: 2px;
        font-size: 12px;
      }

      #hug-attendance-panel td.hug-alert-pref-note {
        font-size: 11px;
        color: #666;
        white-space: nowrap;
      }

      #hug-attendance-panel tr.hug-over-two-hours {
        background: #ffe5e5;
      }

      #hug-attendance-panel tr.hug-alert-type2 {
        animation: hugAlertType2Row 1.3s ease-in-out infinite;
        box-shadow: inset 0 0 0 2px #b71c1c;
      }

      @keyframes hugAlertType2Row {
        0%, 100% {
          background: #ffdede;
        }
        50% {
          background: #ffc9c9;
        }
      }

      #hug-attendance-panel tr.hug-over-two-hours td {
        border-color: #e60000;
      }

      #hug-attendance-panel tr.hug-over-two-hours input {
        background: #fff0f0;
        border: 2px solid #e60000;
        color: #b00000;
        font-weight: bold;
      }

      #hug-attendance-panel .hug-alert-badge {
        display: inline-block;
        padding: 2px 6px;
        border-radius: 999px;
        background: #e60000;
        color: #fff;
        font-size: 11px;
        font-weight: bold;
        white-space: nowrap;
        animation: hugBadgeBlink 1s infinite;
      }

      #hug-attendance-panel .hug-alert-badge-type2 {
        display: inline-block;
        padding: 2px 8px;
        border-radius: 999px;
        background: #6a0000;
        color: #fff;
        font-size: 11px;
        font-weight: bold;
        white-space: nowrap;
        border: 2px solid #ffcdd2;
        animation: hugBadgeBlink 0.85s infinite;
      }

      #hug-attendance-panel .hug-normal-badge {
        display: inline-block;
        padding: 2px 6px;
        border-radius: 999px;
        background: #e5e5e5;
        color: #333;
        font-size: 11px;
        white-space: nowrap;
      }

      #hug-attendance-panel .hug-alert-summary {
        margin-bottom: 8px;
        padding: 6px 8px;
        border-radius: 6px;
        background: #fff0f0;
        border: 1px solid #e60000;
        color: #b00000;
        font-weight: bold;
      }

      #hug-attendance-panel .hug-no-alert-summary {
        margin-bottom: 8px;
        padding: 6px 8px;
        border-radius: 6px;
        background: #f5f5f5;
        border: 1px solid #ccc;
        color: #333;
      }

      #hug-attendance-panel .hug-btn-label-with-mail {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        vertical-align: middle;
      }

      #hug-attendance-panel .hug-btn-mail-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        width: 14px;
        height: 14px;
        border-radius: 4px;
        background: #0d47a1;
        color: #fff;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.35);
        line-height: 0;
      }

      #hug-attendance-panel .hug-btn-mail-icon svg {
        width: 13px;
        height: 13px;
        display: block;
      }

      #hug-attendance-panel .hug-btn-post-enter.hug-btn-has-mail,
      #hug-attendance-panel .hug-btn-post-leave.hug-btn-has-mail {
        border-color: #0d47a1;
        border-width: 2px;
        box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.85) inset,
          0 1px 3px rgba(13, 71, 161, 0.35);
      }

      #hug-attendance-panel .hug-btn-post-leave.hug-btn-has-mail .hug-btn-mail-icon {
        background: #fff;
        color: #0d47a1;
        box-shadow: 0 0 0 1px #0d47a1, 0 1px 2px rgba(0, 0, 0, 0.25);
      }

      #hug-attendance-panel .hug-btn-post-leave.hug-leave-alert.hug-btn-has-mail .hug-btn-mail-icon {
        background: #fff;
        color: #b71c1c;
        box-shadow: 0 0 0 2px #fff, 0 0 0 3px #b71c1c;
      }

      #hug-attendance-panel .hug-btn-post-enter,
      #hug-attendance-panel .hug-btn-post-leave:not(.hug-leave-alert) {
        transition: none;
        transform: none;
      }

      #hug-attendance-panel .hug-btn-post-enter:hover:not(:disabled),
      #hug-attendance-panel .hug-btn-post-leave:not(.hug-leave-alert):hover:not(:disabled) {
        transform: none;
      }

      #hug-attendance-panel .hug-btn-post-enter {
        padding: 4px 8px;
        font-size: 12px;
        cursor: pointer;
        border: 1px solid #1a6;
        border-radius: 4px;
        background: #e8fff4;
        color: #063;
        white-space: nowrap;
      }

      #hug-attendance-panel .hug-btn-post-enter.hug-btn-native,
      #hug-attendance-panel .hug-btn-post-leave.hug-btn-native {
        border-color: #5a6268;
        background: #eef1f3;
        color: #333;
      }

      #hug-attendance-panel .hug-btn-post-leave {
        padding: 4px 8px;
        font-size: 12px;
        font-weight: bold;
        cursor: pointer;
        border: 2px solid #d84315;
        border-radius: 4px;
        background: #ffab40;
        color: #3e2723;
        white-space: nowrap;
        box-shadow: 0 1px 3px rgba(216, 67, 21, 0.35);
      }

      #hug-attendance-panel .hug-btn-post-leave.hug-leave-alert {
        animation: hugAlertPulse 1.2s infinite;
        border-color: #b71c1c;
        background: #ff7043;
        box-shadow: 0 0 10px rgba(183, 28, 28, 0.45);
      }

      #hug-attendance-panel .hug-btn-post-enter:disabled,
      #hug-attendance-panel .hug-btn-post-leave:disabled {
        opacity: 0.55;
        cursor: not-allowed;
      }

      #hug-attendance-panel .hug-btn-post-enter.hug-afternoon-enter-wait:disabled {
        filter: grayscale(1);
        opacity: 0.62;
        border-color: #999;
        background: #e8e8e8;
        color: #555;
      }

      #hug-attendance-panel .hug-post-actions {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 6px;
      }

      #hug-attendance-panel .hug-btn-chip-wrap {
        display: inline-block;
      }

      #hug-attendance-panel .hug-absence-badge {
        display: inline-block;
        padding: 2px 6px;
        border-radius: 999px;
        background: #6b5b95;
        color: #fff;
        font-size: 11px;
        font-weight: bold;
        white-space: nowrap;
        max-width: 12em;
        overflow: hidden;
        text-overflow: ellipsis;
        vertical-align: middle;
      }

      #hug-attendance-panel .hug-enter-absence-note {
        font-size: 12px;
        color: #6b5b95;
        font-weight: bold;
      }

      #hug-attendance-panel .hug-enter-cell-dash {
        color: #999;
        font-size: 12px;
      }

      #hug-attendance-panel .hug-panel-settings-bar {
        display: flex;
        flex-wrap: nowrap;
        align-items: center;
        gap: 10px;
        margin-bottom: 10px;
        padding: 6px 10px;
        border-radius: 6px;
        background: #f5f7fa;
        border: 1px solid #b0bec5;
        font-size: 12px;
        overflow-x: auto;
      }

      #hug-attendance-panel .hug-settings-group {
        display: flex;
        flex-wrap: nowrap;
        align-items: center;
        gap: 6px;
        flex-shrink: 0;
        white-space: nowrap;
      }

      #hug-attendance-panel .hug-settings-sep {
        flex-shrink: 0;
        color: #cfd8dc;
        user-select: none;
        font-weight: normal;
      }

      #hug-attendance-panel .hug-settings-label {
        font-weight: bold;
        color: #37474f;
        white-space: nowrap;
      }

      #hug-attendance-panel .hug-settings-label.hug-settings-label-half {
        color: #1565c0;
      }

      #hug-attendance-panel .hug-settings-label.hug-settings-label-left {
        color: #827717;
      }

      #hug-attendance-panel input.hug-half-time-input {
        width: auto;
        min-width: 6.5em;
        flex-shrink: 0;
      }

      #hug-attendance-panel select.hug-show-left-select {
        width: auto;
        min-width: 5.5em;
        box-sizing: border-box;
        padding: 2px 4px;
        font-size: 12px;
        flex-shrink: 0;
      }
    `;

    document.head.appendChild(style);
  };

  Form.addFormStyle = addFormStyle;
})();
