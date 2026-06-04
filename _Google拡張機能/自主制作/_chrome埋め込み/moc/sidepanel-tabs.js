/**
 * サイドパネル: 入退室管理 / 個人記録 のタブ切り替え
 */
(() => {
  const STORAGE_KEY = "hugSidepanelActiveTab";
  const VALID_TABS = ["attendance", "personal-record"];

  const setTab = (tabId) => {
    const host = document.getElementById("hug-sidepanel-host");
    if (!host) return;

    const id = VALID_TABS.includes(tabId) ? tabId : "attendance";

    host.querySelectorAll(".hug-sidepanel-tab-btn").forEach((btn) => {
      const active = btn.dataset.tab === id;
      btn.classList.toggle("active", active);
      btn.setAttribute("aria-selected", active ? "true" : "false");
    });

    host.querySelectorAll(".hug-sidepanel-tab-panel").forEach((panel) => {
      const active = panel.dataset.tabPanel === id;
      panel.classList.toggle("active", active);
      panel.hidden = !active;
    });

    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch {
      /* ignore */
    }

    if (id === "personal-record") {
      const panel = document.getElementById("hug-personal-record-form");
      window.HugPersonalForm?.Form?.fitPanelToViewport?.(panel);
    }
  };

  const init = () => {
    const host = document.getElementById("hug-sidepanel-host");
    if (!host) return;

    let initial = "attendance";
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (VALID_TABS.includes(saved)) {
        initial = saved;
      }
    } catch {
      /* ignore */
    }

    host.querySelectorAll(".hug-sidepanel-tab-btn").forEach((btn) => {
      btn.addEventListener("click", () => setTab(btn.dataset.tab));
    });

    setTab(initial);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  window.HugSidepanelTabs = { setTab };
})();
