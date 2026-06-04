(() => {
  const HA = (window.HugAttendance = window.HugAttendance || {});
  const Form = (HA.Form = HA.Form || {});

  const PANEL_POS_KEY = "hugAttendancePanelPosition";

  const loadPanelPosition = () => {
    try {
      const raw = localStorage.getItem(PANEL_POS_KEY);
      if (!raw) return null;
      const pos = JSON.parse(raw);
      const left = Number(pos?.left);
      const top = Number(pos?.top);
      if (!Number.isFinite(left) || !Number.isFinite(top)) return null;
      return { left, top };
    } catch {
      return null;
    }
  };

  const savePanelPosition = (left, top) => {
    localStorage.setItem(
      PANEL_POS_KEY,
      JSON.stringify({ left: Math.round(left), top: Math.round(top) })
    );
  };

  const clampPanelPosition = (panel, left, top) => {
    const rect = panel.getBoundingClientRect();
    const w = rect.width || panel.offsetWidth || 320;
    const h = rect.height || panel.offsetHeight || 80;
    const maxLeft = Math.max(8, window.innerWidth - w - 8);
    const maxTop = Math.max(8, window.innerHeight - h - 8);
    return {
      left: Math.min(Math.max(8, left), maxLeft),
      top: Math.min(Math.max(8, top), maxTop)
    };
  };

  const applyPanelPosition = (panel) => {
    const pos = loadPanelPosition();
    if (!pos) return;

    const { left, top } = clampPanelPosition(panel, pos.left, pos.top);
    panel.classList.add("hug-panel-positioned");
    panel.style.left = `${left}px`;
    panel.style.top = `${top}px`;
    panel.style.right = "auto";
    panel.style.bottom = "auto";
    panel.style.transform = "none";
  };

  const wirePanelDrag = (panel) => {
    if (panel.dataset.hugDragWired === "1") return;

    const header = panel.querySelector(".hug-attendance-header");
    if (!header) return;

    let dragging = false;
    let didDrag = false;
    let startX = 0;
    let startY = 0;
    let startLeft = 0;
    let startTop = 0;

    const onPointerDown = (event) => {
      if (event.button !== 0) return;
      if (event.target.closest("button")) return;

      dragging = true;
      didDrag = false;

      const rect = panel.getBoundingClientRect();
      panel.classList.add("hug-panel-positioned");
      panel.style.right = "auto";
      panel.style.bottom = "auto";
      panel.style.transform = "none";
      startLeft = rect.left;
      startTop = rect.top;
      panel.style.left = `${startLeft}px`;
      panel.style.top = `${startTop}px`;

      startX = event.clientX;
      startY = event.clientY;
      header.setPointerCapture(event.pointerId);
      header.classList.add("hug-dragging");
      event.preventDefault();
    };

    const onPointerMove = (event) => {
      if (!dragging) return;

      const dx = event.clientX - startX;
      const dy = event.clientY - startY;
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
        didDrag = true;
      }

      const next = clampPanelPosition(panel, startLeft + dx, startTop + dy);
      panel.style.left = `${next.left}px`;
      panel.style.top = `${next.top}px`;
    };

    const finishDrag = (event) => {
      if (!dragging) return;
      dragging = false;
      header.classList.remove("hug-dragging");

      try {
        header.releasePointerCapture(event.pointerId);
      } catch {
        /* ignore */
      }

      if (didDrag) {
        const left = parseFloat(panel.style.left) || 0;
        const top = parseFloat(panel.style.top) || 0;
        savePanelPosition(left, top);
        panel.dataset.hugJustDragged = "1";
      }
    };

    header.addEventListener("pointerdown", onPointerDown);
    header.addEventListener("pointermove", onPointerMove);
    header.addEventListener("pointerup", finishDrag);
    header.addEventListener("pointercancel", finishDrag);

    header.addEventListener("click", (event) => {
      if (panel.dataset.hugJustDragged === "1") {
        panel.dataset.hugJustDragged = "0";
        return;
      }
      if (event.target.closest("button")) return;
      togglePanel();
    });

    panel.dataset.hugDragWired = "1";
  };

  const togglePanel = () => {
    const panel = document.querySelector("#hug-attendance-panel");
    if (!panel) return;

    const isCollapsed = panel.classList.toggle("hug-collapsed");

    const button = panel.querySelector(".hug-toggle-button");
    if (button) {
      button.textContent = isCollapsed ? "開く" : "閉じる";
    }

    if (panel.classList.contains("hug-panel-positioned")) {
      const left = parseFloat(panel.style.left);
      const top = parseFloat(panel.style.top);
      if (Number.isFinite(left) && Number.isFinite(top)) {
        requestAnimationFrame(() => {
          const next = clampPanelPosition(panel, left, top);
          panel.style.left = `${next.left}px`;
          panel.style.top = `${next.top}px`;
          savePanelPosition(next.left, next.top);
        });
      }
    }
  };

  const isSidepanelHost = () =>
    Boolean(document.getElementById("hug-sidepanel-host"));

  const ensureRefreshButton = (panel) => {
    const actions =
      panel.querySelector(".hug-header-actions") ||
      panel.querySelector(".hug-sidepanel-toolbar");
    if (!actions) return;

    const toggleButton = panel.querySelector(".hug-toggle-button");
    if (toggleButton && isSidepanelHost()) {
      toggleButton.remove();
    }

    let refreshBtn = panel.querySelector(".hug-refresh-button");
    if (!refreshBtn) {
      refreshBtn = document.createElement("button");
      refreshBtn.type = "button";
      refreshBtn.className = "hug-refresh-button";
      refreshBtn.textContent = "更新";
      refreshBtn.title = "入退室データを手動で再取得";
      actions.appendChild(refreshBtn);
    }

    if (refreshBtn.dataset.hugRefreshWired === "1") return;

    refreshBtn.addEventListener("click", Form.onRefreshClick);
    refreshBtn.dataset.hugRefreshWired = "1";
  };

  const ensureEnterMailPanelControls = (panel) => {
    panel.querySelector(".hug-enter-mail-download")?.remove();
    panel.querySelector(".hug-enter-mail-run")?.remove();

    const titleWrap =
      panel.querySelector(".hug-attendance-header > div") ||
      panel.querySelector(".hug-sidepanel-toolbar-meta");

    let badge = panel.querySelector(".hug-enter-mail-badge");
    if (!badge && titleWrap) {
      badge = document.createElement("div");
      badge.className = "hug-enter-mail-badge";
      badge.textContent = "入室is_mail=1: 0件";
      badge.hidden = true;
      titleWrap.appendChild(badge);
    }

    let leaveAlertBadge = panel.querySelector(".hug-leave-alert-collapsed-badge");
    if (!leaveAlertBadge && titleWrap) {
      leaveAlertBadge = document.createElement("div");
      leaveAlertBadge.className = "hug-leave-alert-collapsed-badge";
      leaveAlertBadge.hidden = true;
      titleWrap.appendChild(leaveAlertBadge);
    }

    if (typeof window.HugAttendance.refreshEnterMailPanelUi === "function") {
      window.HugAttendance.refreshEnterMailPanelUi();
    }
  };

  const wireAttendanceBodyEvents = (contentBody) => {
    if (!contentBody || contentBody.dataset.hugBodyWired === "1") return;
    contentBody.addEventListener("click", Form.onHugPostClick);
    contentBody.addEventListener("click", Form.onRecordProceedingsMove);
    contentBody.addEventListener("click", Form.onPersonalRecordOpen);
    contentBody.addEventListener("change", Form.onAlertPrefChange);
    contentBody.addEventListener("change", Form.onHalfTimePersist);
    contentBody.addEventListener("focusout", Form.onHalfTimePersist);
    contentBody.addEventListener("change", Form.onShowLeftRecordsChange);
    contentBody.addEventListener("change", Form.onFacilityFilterChange);
    contentBody.dataset.hugBodyWired = "1";
  };

  const createSidepanelAttendanceRoot = () => {
    const panel = document.querySelector(
      "#hug-tab-attendance #hug-attendance-panel.hug-sidepanel-form-root"
    );
    if (!panel) return null;

    if (panel.dataset.hugAttendanceWired !== "1") {
      panel.classList.remove("hug-collapsed");
      panel.innerHTML = `
        <div class="hug-sidepanel-toolbar">
          <div class="hug-sidepanel-toolbar-meta">
            <div class="hug-attendance-count">未取得</div>
          </div>
          <button type="button" class="hug-refresh-button" title="入退室データを手動で再取得">更新</button>
        </div>
        <div class="hug-attendance-status">未取得</div>
        <div class="hug-attendance-body"></div>
      `;
      panel.dataset.hugAttendanceWired = "1";
    }

    wireAttendanceBodyEvents(panel.querySelector(".hug-attendance-body"));
    ensureRefreshButton(panel);
    ensureEnterMailPanelControls(panel);
    return panel;
  };

  const createPanelIfNeeded = () => {
    Form.addFormStyle();

    if (isSidepanelHost()) {
      const sidepanelRoot = createSidepanelAttendanceRoot();
      if (sidepanelRoot) return sidepanelRoot;
    }

    let panel = document.querySelector("#hug-attendance-panel");

    if (panel?.classList.contains("hug-sidepanel-form-root")) {
      return createSidepanelAttendanceRoot() || panel;
    }

    if (panel) {
      ensureRefreshButton(panel);
      ensureEnterMailPanelControls(panel);
      applyPanelPosition(panel);
      wirePanelDrag(panel);
      return panel;
    }

    panel = document.createElement("div");
    panel.id = "hug-attendance-panel";
    panel.classList.add("hug-collapsed");

    panel.innerHTML = `
      <div class="hug-attendance-header">
        <div>
          <div class="hug-attendance-title">入退室データ</div>
          <div class="hug-attendance-count">未取得</div>
        </div>
        <div class="hug-header-actions">
          <button type="button" class="hug-refresh-button" title="入退室データを手動で再取得">更新</button>
          <button type="button" class="hug-toggle-button">開く</button>
        </div>
      </div>

      <div class="hug-attendance-content">
        <div class="hug-attendance-status">未取得</div>
        <div class="hug-attendance-body"></div>
      </div>
    `;

    document.body.appendChild(panel);

    const toggleButton = panel.querySelector(".hug-toggle-button");
    wireAttendanceBodyEvents(panel.querySelector(".hug-attendance-body"));

    if (toggleButton) {
      toggleButton.addEventListener("click", (event) => {
        event.stopPropagation();
        togglePanel();
      });
    }

    ensureRefreshButton(panel);
    ensureEnterMailPanelControls(panel);
    applyPanelPosition(panel);
    wirePanelDrag(panel);

    return panel;
  };

  Form.ensureEnterMailPanelControls = ensureEnterMailPanelControls;
  Form.createPanelIfNeeded = createPanelIfNeeded;
  Form.togglePanel = togglePanel;
  Form.resetPanelPosition = () => {
    localStorage.removeItem(PANEL_POS_KEY);
    const panel = document.querySelector("#hug-attendance-panel");
    if (!panel) return;
    panel.classList.remove("hug-panel-positioned");
    panel.style.left = "";
    panel.style.top = "";
    panel.style.right = "";
    panel.style.bottom = "";
    panel.style.transform = "";
  };
})();
