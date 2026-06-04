(() => {
  const HF = (window.HugPersonalForm = window.HugPersonalForm || {});
  const Form = (HF.Form = HF.Form || {});

  const PANEL_POS_KEY = "hugPersonalRecordPanelPosition";
  const PANEL_WIDTH_KEY = "hugPersonalRecordPanelWidth";
  const DEFAULT_PANEL_WIDTH_OPEN = 420;
  const MIN_PANEL_WIDTH_OPEN = 280;
  const MAX_PANEL_WIDTH_OPEN = 960;
  const PANEL_VIEWPORT_MARGIN = 8;
  const PANEL_DEFAULT_TOP = 12;
  const PANEL_MIN_HEIGHT = 160;

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

  const clampPanelWidth = (width) => {
    const max = Math.min(
      MAX_PANEL_WIDTH_OPEN,
      Math.max(MIN_PANEL_WIDTH_OPEN, window.innerWidth - 16)
    );
    return Math.min(Math.max(MIN_PANEL_WIDTH_OPEN, width), max);
  };

  const loadPanelWidth = () => {
    try {
      const raw = localStorage.getItem(PANEL_WIDTH_KEY);
      if (!raw) return null;
      const width = Number(raw);
      if (!Number.isFinite(width)) return null;
      return clampPanelWidth(width);
    } catch {
      return null;
    }
  };

  const savePanelWidth = (width) => {
    try {
      localStorage.setItem(
        PANEL_WIDTH_KEY,
        String(Math.round(clampPanelWidth(width)))
      );
    } catch {
      /* ignore */
    }
  };

  const applyPanelWidth = (panel) => {
    const width = loadPanelWidth() ?? DEFAULT_PANEL_WIDTH_OPEN;
    panel.style.setProperty(
      "--hug-pr-panel-width-default-open",
      `${clampPanelWidth(width)}px`
    );
  };

  const getPanelTop = (panel) => {
    if (panel.classList.contains("hug-panel-positioned")) {
      const top = parseFloat(panel.style.top);
      if (Number.isFinite(top)) {
        return top;
      }
    }
    return PANEL_DEFAULT_TOP;
  };

  const fitPanelToViewport = (panel) => {
    if (!panel) return;
    if (panel.classList.contains("hug-sidepanel-form-root")) return;

    if (panel.classList.contains("hug-collapsed")) {
      panel.style.removeProperty("--hug-pr-panel-max-height");
      return;
    }

    const top = getPanelTop(panel);
    const maxHeight = Math.max(
      PANEL_MIN_HEIGHT,
      window.innerHeight - top - PANEL_VIEWPORT_MARGIN
    );
    panel.style.setProperty("--hug-pr-panel-max-height", `${maxHeight}px`);

    if (panel.classList.contains("hug-panel-positioned")) {
      const left = parseFloat(panel.style.left);
      const currentTop = parseFloat(panel.style.top);
      if (Number.isFinite(left) && Number.isFinite(currentTop)) {
        const next = clampPanelPosition(panel, left, currentTop);
        panel.style.left = `${next.left}px`;
        panel.style.top = `${next.top}px`;
      }
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
    fitPanelToViewport(panel);
  };

  const togglePanel = () => {
    const panel = document.querySelector("#hug-personal-record-form");
    if (!panel) return;

    const isCollapsed = panel.classList.toggle("hug-collapsed");
    const button = panel.querySelector(".hug-pr-toggle-button");
    if (button) {
      button.textContent = isCollapsed ? "開く" : "閉じる";
    }

    requestAnimationFrame(() => {
      fitPanelToViewport(panel);

      if (panel.classList.contains("hug-panel-positioned")) {
        const left = parseFloat(panel.style.left);
        const top = parseFloat(panel.style.top);
        if (Number.isFinite(left) && Number.isFinite(top)) {
          const next = clampPanelPosition(panel, left, top);
          panel.style.left = `${next.left}px`;
          panel.style.top = `${next.top}px`;
          savePanelPosition(next.left, next.top);
        }
      }
    });
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
      fitPanelToViewport(panel);
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
        fitPanelToViewport(panel);
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

  const wirePanelResize = (panel) => {
    if (panel.dataset.hugResizeWired === "1") return;

    const handle = panel.querySelector(".hug-pr-resize-handle");
    if (!handle) return;

    let resizing = false;
    let startX = 0;
    let startWidth = 0;
    let startLeft = 0;
    let startTop = 0;
    let resizeFromPositioned = false;

    const onPointerDown = (event) => {
      if (event.button !== 0) return;

      resizing = true;
      const rect = panel.getBoundingClientRect();
      startX = event.clientX;
      startWidth = rect.width;
      resizeFromPositioned = panel.classList.contains("hug-panel-positioned");
      if (resizeFromPositioned) {
        startLeft = rect.left;
        startTop = rect.top;
      }
      handle.setPointerCapture(event.pointerId);
      handle.classList.add("hug-resizing");
      event.preventDefault();
      event.stopPropagation();
    };

    const onPointerMove = (event) => {
      if (!resizing) return;

      const deltaX = event.clientX - startX;
      const nextWidth = clampPanelWidth(startWidth - deltaX);
      panel.style.setProperty(
        "--hug-pr-panel-width-default-open",
        `${nextWidth}px`
      );

      if (resizeFromPositioned) {
        const nextLeft = startLeft + (startWidth - nextWidth);
        const next = clampPanelPosition(panel, nextLeft, startTop);
        panel.style.left = `${next.left}px`;
        panel.style.top = `${next.top}px`;
      }
      fitPanelToViewport(panel);
    };

    const finishResize = (event) => {
      if (!resizing) return;
      resizing = false;
      handle.classList.remove("hug-resizing");

      try {
        handle.releasePointerCapture(event.pointerId);
      } catch {
        /* ignore */
      }

      savePanelWidth(panel.getBoundingClientRect().width);
      fitPanelToViewport(panel);

      if (resizeFromPositioned) {
        const left = parseFloat(panel.style.left);
        const top = parseFloat(panel.style.top);
        if (Number.isFinite(left) && Number.isFinite(top)) {
          const next = clampPanelPosition(panel, left, top);
          panel.style.left = `${next.left}px`;
          panel.style.top = `${next.top}px`;
          savePanelPosition(next.left, next.top);
        }
      }
    };

    handle.addEventListener("pointerdown", onPointerDown);
    handle.addEventListener("pointermove", onPointerMove);
    handle.addEventListener("pointerup", finishResize);
    handle.addEventListener("pointercancel", finishResize);

    panel.dataset.hugResizeWired = "1";
  };

  const wirePanelViewportFit = (panel) => {
    if (panel.dataset.hugViewportWired === "1") return;

    window.addEventListener("resize", () => fitPanelToViewport(panel));

    panel.dataset.hugViewportWired = "1";
  };

  const isSidepanelHost = () =>
    Boolean(document.getElementById("hug-sidepanel-host"));

  const ensurePanelResizeHandle = (panel) => {
    if (isSidepanelHost()) return;
    if (panel.querySelector(".hug-pr-resize-handle")) return;
    const handle = document.createElement("div");
    handle.className = "hug-pr-resize-handle";
    handle.title = "幅を調整";
    handle.setAttribute("aria-hidden", "true");
    panel.prepend(handle);
  };

  const createPanelIfNeeded = () => {
    if (typeof Form.addFormStyle === "function") {
      Form.addFormStyle();
    }

    const inSidepanel = isSidepanelHost();

    if (inSidepanel) {
      const panel = document.querySelector(
        "#hug-tab-personal-record #hug-personal-record-form.hug-sidepanel-form-root"
      );
      if (panel) {
        panel.classList.remove("hug-collapsed");
        return panel;
      }
    }

    let panel = document.querySelector("#hug-personal-record-form");

    if (panel?.classList.contains("hug-sidepanel-form-root")) {
      panel.classList.remove("hug-collapsed");
      return panel;
    }

    if (panel) {
      ensurePanelResizeHandle(panel);
      applyPanelWidth(panel);
      applyPanelPosition(panel);
      wirePanelDrag(panel);
      wirePanelResize(panel);
      fitPanelToViewport(panel);
      wirePanelViewportFit(panel);
      return panel;
    }

    panel = document.createElement("div");
    panel.id = "hug-personal-record-form";
    panel.classList.add("hug-collapsed");

    panel.innerHTML = `
      <div class="hug-pr-resize-handle" title="幅を調整" aria-hidden="true"></div>
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

    applyPanelWidth(panel);
    applyPanelPosition(panel);
    wirePanelDrag(panel);
    wirePanelResize(panel);
    fitPanelToViewport(panel);
    wirePanelViewportFit(panel);

    return panel;
  };

  Form.createPanelIfNeeded = createPanelIfNeeded;
  Form.togglePanel = togglePanel;
  Form.fitPanelToViewport = fitPanelToViewport;
  Form.resetPanelPosition = () => {
    localStorage.removeItem(PANEL_POS_KEY);
    localStorage.removeItem(PANEL_WIDTH_KEY);
    const panel = document.querySelector("#hug-personal-record-form");
    if (!panel) return;
    panel.classList.remove("hug-panel-positioned");
    panel.style.left = "";
    panel.style.top = "";
    panel.style.right = "";
    panel.style.bottom = "";
    panel.style.transform = "";
    panel.style.removeProperty("--hug-pr-panel-width-default-open");
    panel.style.removeProperty("--hug-pr-panel-max-height");
    fitPanelToViewport(panel);
  };
})();
