(() => {
  window.HugAttendance = window.HugAttendance || {};

  /*
    フォーム用CSSを追加
  */
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
        position: fixed;
        right: 20px;
        bottom: 20px;
        z-index: 999999;
        width: 560px;
        background: #ffffff;
        border: 2px solid #333;
        border-radius: 10px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
        font-size: 13px;
        color: #222;
        overflow: hidden;
      }

      #hug-attendance-panel.hug-collapsed {
        width: 300px;
      }

      #hug-attendance-panel .hug-attendance-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 8px;
        padding: 8px 10px;
        background: #333;
        color: #fff;
        cursor: pointer;
        user-select: none;
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

      #hug-attendance-panel .hug-toggle-button {
        cursor: pointer;
        padding: 2px 8px;
        border: 1px solid #fff;
        border-radius: 4px;
        background: transparent;
        color: #fff;
        font-size: 12px;
      }

      #hug-attendance-panel .hug-attendance-content {
        max-height: 70vh;
        overflow: auto;
        padding: 10px;
        transition: max-height 0.25s ease, padding 0.25s ease;
      }

      #hug-attendance-panel.hug-collapsed .hug-attendance-content {
        max-height: 0;
        padding-top: 0;
        padding-bottom: 0;
        overflow: hidden;
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
        width: 140px;
      }

      #hug-attendance-panel tr.hug-over-two-hours {
        background: #ffe5e5;
        animation: hugAlertPulse 1.2s infinite;
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
        animation: hugAlertPulse 1.2s infinite;
      }

      #hug-attendance-panel .hug-no-alert-summary {
        margin-bottom: 8px;
        padding: 6px 8px;
        border-radius: 6px;
        background: #f5f5f5;
        border: 1px solid #ccc;
        color: #333;
      }
    `;

    document.head.appendChild(style);
  };

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

  /*
    パネル開閉状態を取得
  */
  const getCollapsedState = () => {
    return localStorage.getItem("hugAttendanceCollapsed") === "1";
  };

  /*
    パネル開閉状態を保存
  */
  const setCollapsedState = (isCollapsed) => {
    localStorage.setItem("hugAttendanceCollapsed", isCollapsed ? "1" : "0");
  };

  /*
    パネルを開閉
  */
  const togglePanel = () => {
    const panel = document.querySelector("#hug-attendance-panel");
    if (!panel) return;

    const isCollapsed = panel.classList.toggle("hug-collapsed");
    setCollapsedState(isCollapsed);

    const button = panel.querySelector(".hug-toggle-button");
    if (button) {
      button.textContent = isCollapsed ? "開く" : "閉じる";
    }
  };

  /*
    フォーム枠を作成
  */
  const createPanelIfNeeded = () => {
    addFormStyle();

    let panel = document.querySelector("#hug-attendance-panel");

    if (panel) return panel;

    panel = document.createElement("div");
    panel.id = "hug-attendance-panel";

    const isCollapsed = getCollapsedState();

    if (isCollapsed) {
      panel.classList.add("hug-collapsed");
    }

    panel.innerHTML = `
      <div class="hug-attendance-header">
        <div>
          <div class="hug-attendance-title">入退室データ</div>
          <div class="hug-attendance-count">未取得</div>
        </div>
        <button type="button" class="hug-toggle-button">
          ${isCollapsed ? "開く" : "閉じる"}
        </button>
      </div>

      <div class="hug-attendance-content">
        <div class="hug-attendance-status">未取得</div>
        <div class="hug-attendance-body"></div>
      </div>
    `;

    document.body.appendChild(panel);

    const header = panel.querySelector(".hug-attendance-header");
    const toggleButton = panel.querySelector(".hug-toggle-button");

    header.addEventListener("click", () => {
      togglePanel();
    });

    toggleButton.addEventListener("click", (event) => {
      event.stopPropagation();
      togglePanel();
    });

    return panel;
  };

  /*
    フォームを表示
    attendanceList の各要素に isOverTwoHours がある前提
  */
  const renderAttendanceForm = (attendanceList) => {
    const panel = createPanelIfNeeded();

    const count = panel.querySelector(".hug-attendance-count");
    const status = panel.querySelector(".hug-attendance-status");
    const body = panel.querySelector(".hug-attendance-body");

    const now = new Date();
    const nowText = now.toLocaleString();
    const timeText = now.toLocaleTimeString();

    const alertCount = attendanceList.filter((item) => item.isOverTwoHours).length;

    count.textContent = `${attendanceList.length}件 / 超過 ${alertCount}件 / ${timeText}`;
    status.textContent = `最終取得: ${nowText} / 件数: ${attendanceList.length} / 2時間超過: ${alertCount}`;

    if (!attendanceList.length) {
      body.innerHTML = `
        <p>入退室データが見つかりませんでした。</p>
      `;
      return;
    }

    const summaryClass = alertCount > 0
      ? "hug-alert-summary"
      : "hug-no-alert-summary";

    const summaryText = alertCount > 0
      ? `注意：入室から2時間以上経過し、退室時間がない児童が ${alertCount}件あります。`
      : "2時間超過で未退室の児童はいません。";

    const rowsHtml = attendanceList.map((item) => {
      const rowClass = item.isOverTwoHours ? "hug-over-two-hours" : "";

      const statusHtml = item.isOverTwoHours
        ? `<span class="hug-alert-badge">2時間超過</span>`
        : `<span class="hug-normal-badge">通常</span>`;

      return `
        <tr class="${rowClass}">
          <td>
            <input type="text" value="${escapeHtml(item.c_id)}" readonly>
          </td>
          <td>
            <input type="text" class="hug-name-input" value="${escapeHtml(item.name)}" readonly>
          </td>
          <td>
            <input type="text" value="${escapeHtml(item.enterTime)}" readonly>
          </td>
          <td>
            <input type="text" value="${escapeHtml(item.leaveTime)}" readonly>
          </td>
          <td>
            ${statusHtml}
          </td>
        </tr>
      `;
    }).join("");

    body.innerHTML = `
      <div class="${summaryClass}">
        ${escapeHtml(summaryText)}
      </div>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>氏名</th>
            <th>入室</th>
            <th>退室</th>
            <th>状態</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
    `;
  };

  /*
    外部ファイルから使えるように登録
  */
  window.HugAttendance.renderAttendanceForm = renderAttendanceForm;
  window.HugAttendance.createPanelIfNeeded = createPanelIfNeeded;
  window.HugAttendance.togglePanel = togglePanel;
})();