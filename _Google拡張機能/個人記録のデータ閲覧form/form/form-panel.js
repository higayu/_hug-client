(() => {
  const HF = (window.HugPersonalForm = window.HugPersonalForm || {});
  const Form = (HF.Form = HF.Form || {});

  const PANEL_POS_KEY = "hugPersonalRecordPanelPosition";

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
    try {
      localStorage.setItem(
        PANEL_POS_KEY,
        JSON.stringify({ left: Math.round(left), top: Math.round(top) })
      );
    } catch {
      /* ignore */
    }
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

  const togglePanel = () => {
    const panel = document.querySelector("#hug-personal-record-form");
    if (!panel) return;

    const isCollapsed = panel.classList.toggle("hug-collapsed");
    const button = panel.querySelector(".hug-pr-toggle-button");
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

  const wirePanelDrag = (panel) => {
    if (panel.dataset.hugDragWired === "1") return;

    const header = panel.querySelector(".hug-pr-header");
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

  const createPanelIfNeeded = () => {
    if (typeof Form.addFormStyle === "function") {
      Form.addFormStyle();
    }

    let panel = document.querySelector("#hug-personal-record-form");

    if (panel) {
      applyPanelPosition(panel);
      wirePanelDrag(panel);
      return panel;
    }

    panel = document.createElement("div");
    panel.id = "hug-personal-record-form";
    panel.classList.add("hug-collapsed");

    panel.innerHTML = `
      <div class="hug-pr-header">
        <div>
          <div class="hug-pr-title">個人記録の取得</div>
          <div class="hug-pr-subtitle" id="hug-pr-header-status"></div>
        </div>
        <div class="hug-pr-header-actions">
          <button type="button" class="hug-pr-toggle-button">開く</button>
        </div>
      </div>
      <div class="hug-pr-content" id="hug-pr-panel-body"></div>
    `;

    document.body.appendChild(panel);

    const toggleButton = panel.querySelector(".hug-pr-toggle-button");
    toggleButton.addEventListener("click", (event) => {
      event.stopPropagation();
      togglePanel();
    });

    applyPanelPosition(panel);
    wirePanelDrag(panel);

    return panel;
  };

  Form.createPanelIfNeeded = createPanelIfNeeded;
  Form.togglePanel = togglePanel;
  Form.resetPanelPosition = () => {
    localStorage.removeItem(PANEL_POS_KEY);
    const panel = document.querySelector("#hug-personal-record-form");
    if (!panel) return;
    panel.classList.remove("hug-panel-positioned");
    panel.style.left = "";
    panel.style.top = "";
    panel.style.right = "";
    panel.style.bottom = "";
    panel.style.transform = "";
  };
})();
