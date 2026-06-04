(() => {
  const HF = (window.HugPersonalForm = window.HugPersonalForm || {});
  const Form = (HF.Form = HF.Form || {});

  const addFormStyle = () => {
    if (document.querySelector("#hug-personal-record-form-style")) return;

    const style = document.createElement("style");
    style.id = "hug-personal-record-form-style";
    style.textContent = `
      #hug-personal-record-form {
        --hug-pr-panel-width-default-open: 420px;
        --hug-pr-panel-width-open: min(
          var(--hug-pr-panel-width-default-open),
          calc(100vw - 16px)
        );
        --hug-pr-panel-width-collapsed: min(280px, calc(100vw - 16px));
        position: fixed;
        right: 12px;
        top: 12px;
        z-index: 99999;
        width: var(--hug-pr-panel-width-open);
        background: #ffffff;
        border: 1px solid #ccc;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        font: 14px/1.4 sans-serif;
        color: #222;
        overflow: hidden;
        --hug-pr-panel-max-height: calc(100vh - 24px);
        max-height: var(--hug-pr-panel-max-height);
        display: flex;
        flex-direction: column;
      }

      #hug-personal-record-form.hug-panel-positioned {
        right: auto !important;
        bottom: auto !important;
        transform: none !important;
      }

      #hug-personal-record-form.hug-collapsed {
        width: var(--hug-pr-panel-width-collapsed);
        max-height: none;
        border-radius: 6px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
      }

      #hug-personal-record-form .hug-pr-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 8px;
        padding: 8px 10px;
        background: #5e35b1;
        color: #fff;
        cursor: grab;
        user-select: none;
        touch-action: none;
        flex-shrink: 0;
      }

      #hug-personal-record-form .hug-pr-header.hug-dragging {
        cursor: grabbing;
      }

      #hug-personal-record-form .hug-pr-title {
        font-size: 14px;
        font-weight: bold;
      }

      #hug-personal-record-form .hug-pr-subtitle {
        font-size: 11px;
        opacity: 0.9;
        margin-top: 2px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 200px;
      }

      #hug-personal-record-form.hug-collapsed .hug-pr-subtitle {
        display: none;
      }

      #hug-personal-record-form .hug-pr-header-actions {
        display: flex;
        align-items: center;
        gap: 6px;
        flex-shrink: 0;
      }

      #hug-personal-record-form .hug-pr-toggle-button {
        cursor: pointer;
        padding: 2px 10px;
        border: 1px solid #fff;
        border-radius: 4px;
        background: transparent;
        color: #fff;
        font-size: 12px;
        white-space: nowrap;
      }

      #hug-personal-record-form .hug-pr-toggle-button:hover {
        background: rgba(255, 255, 255, 0.15);
      }

      #hug-personal-record-form.hug-collapsed .hug-pr-toggle-button {
        padding: 8px 16px;
        min-width: 56px;
        font-size: 14px;
        font-weight: bold;
      }

      #hug-personal-record-form .hug-pr-content {
        flex: 1 1 auto;
        min-height: 0;
        overflow: auto;
        padding: 12px 14px;
        transition: padding 0.25s ease;
      }

      #hug-personal-record-form.hug-collapsed .hug-pr-content {
        max-height: 0;
        padding: 0;
        margin: 0;
        overflow: hidden;
        border: none;
      }

      #hug-personal-record-form .hug-form-section-toggle {
        flex-shrink: 0;
        cursor: pointer;
        padding: 2px 8px;
        border: 1px solid #64b5f6;
        border-radius: 4px;
        background: #fff;
        color: #1565c0;
        font-size: 11px;
        line-height: 1.3;
        white-space: nowrap;
      }

      #hug-personal-record-form .hug-form-section-toggle:hover {
        background: #e3f2fd;
      }

      #hug-personal-record-form .hug-form-section-attendance.hug-form-section-collapsed .hug-form-section-body {
        display: none;
      }

      #hug-personal-record-form .hug-form-section-attendance.hug-form-section-collapsed .hug-form-section-header {
        margin-bottom: 0;
      }

      #hug-personal-record-form .hug-pr-resize-handle {
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 8px;
        cursor: ew-resize;
        z-index: 2;
        touch-action: none;
      }

      #hug-personal-record-form .hug-pr-resize-handle::after {
        content: "";
        position: absolute;
        left: 2px;
        top: 50%;
        transform: translateY(-50%);
        width: 3px;
        height: 36px;
        border-radius: 2px;
        background: rgba(0, 0, 0, 0.12);
        opacity: 0;
        transition: opacity 0.15s ease;
      }

      #hug-personal-record-form:hover .hug-pr-resize-handle::after,
      #hug-personal-record-form .hug-pr-resize-handle.hug-resizing::after {
        opacity: 1;
      }

      #hug-personal-record-form.hug-collapsed .hug-pr-resize-handle {
        display: none;
      }

      #hug-sidepanel-host #hug-personal-record-form.hug-sidepanel-form-root {
        position: static;
        width: 100%;
        max-width: none;
        margin: 0;
        border: none;
        border-radius: 0;
        box-shadow: none;
        max-height: none;
        overflow: visible;
      }
    `;

    document.head.appendChild(style);
  };

  Form.addFormStyle = addFormStyle;
})();
