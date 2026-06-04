/**
 * サイドパネル用: HugAttendance の初期設定
 */
(() => {
  const init = () => {
    window.HugAttendance = window.HugAttendance || {};
    window.HugAttendance.WM_BASE_URL =
      window.HugAttendance.WM_BASE_URL ||
      "https://www.hug-ayumu.link/hug/wm/";
    window.HugAttendance.isSidePanelHost = Boolean(
      document.getElementById("hug-sidepanel-host")
    );
    window.HugPersonalForm = window.HugPersonalForm || {};
    window.HugPersonalForm.isSidePanelHost = window.HugAttendance.isSidePanelHost;
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
