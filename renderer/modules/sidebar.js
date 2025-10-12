// modules/sidebar.js
export function setupSidebar() {
  const settingsEl = document.getElementById("settings");
  const menuToggle = document.getElementById("menuToggle");
  const hugview = document.getElementById("hugview");

  if (!settingsEl || !menuToggle || !hugview) return;

  menuToggle.addEventListener("click", () => {
    const isOpen = settingsEl.classList.toggle("open");
    hugview.classList.toggle("shifted", isOpen);
    console.log(isOpen ? "📂 サイドバーを開いた" : "📁 サイドバーを閉じた");
  });

  document.addEventListener("click", (e) => {
    if (
      settingsEl.classList.contains("open") &&
      !settingsEl.contains(e.target) &&
      !menuToggle.contains(e.target)
    ) {
      settingsEl.classList.remove("open");
      hugview.classList.remove("shifted");
      console.log("📁 サイドバーを閉じました（外側クリック）");
    }
  });
}
