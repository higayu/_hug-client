// modules/tabs.js
import { AppState } from "./config.js";
import { setActiveWebview, getActiveWebview } from "./webviewState.js";

export function initTabs() {
  const tabsContainer = document.getElementById("tabs");
  const content = document.getElementById("content");
  let closeButtonsVisible = true;

  // 🌟 初期アクティブwebview設定
  setActiveWebview(document.getElementById("hugview"));

  // 🌟 追加ボタン
  const addTabBtn = document.createElement("button");
  addTabBtn.textContent = "＋";
  tabsContainer.appendChild(addTabBtn);

  // 🌟 個人記録ボタン
  const personalBtn = document.createElement("button");
  personalBtn.textContent = "＋ 個人記録";
  tabsContainer.appendChild(personalBtn);

  // ===== 通常タブ追加 =====
  addTabBtn.addEventListener("click", () => {
    const newId = `hugview-${Date.now()}`;
    const newWebview = document.createElement("webview");
    newWebview.id = newId;
    newWebview.src = `https://www.hug-ayumu.link/hug/wm/attendance.php?mode=detail&f_id=${AppState.FACILITY_ID}&date=${AppState.DATE_STR}`;
    newWebview.allowpopups = true;
    newWebview.style.cssText = "position:absolute;top:0;left:0;width:100%;height:100%;";
    newWebview.classList.add("hidden");
    content.appendChild(newWebview);

    const tabButton = document.createElement("button");
    tabButton.innerHTML = `
      Hug-${tabsContainer.querySelectorAll("button[data-target^='hugview']").length + 1}
      <span class="close-btn"${closeButtonsVisible ? "" : " style='display:none'"}>❌</span>
    `;
    tabButton.dataset.target = newId;
    tabsContainer.insertBefore(tabButton, addTabBtn);

    // タブクリック（アクティブ切替）
    tabButton.addEventListener("click", () => {
      document.querySelectorAll("webview").forEach(v => v.classList.add("hidden"));
      newWebview.classList.remove("hidden");
      setActiveWebview(newWebview);
    });

    // 閉じる処理
    const closeBtn = tabButton.querySelector(".close-btn");
    closeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (!confirm("このタブを閉じますか？")) return;
      newWebview.remove();
      tabButton.remove();

      // 閉じたタブがアクティブならデフォルトに戻す
      if (getActiveWebview() === newWebview) {
        const defaultView = document.getElementById("hugview");
        defaultView.classList.remove("hidden");
        setActiveWebview(defaultView);
        tabsContainer.querySelector(`button[data-target="hugview"]`)?.classList.add("active-tab");
      }
    });

    tabButton.click(); // 追加直後に選択
  });

  // ===== 個人記録タブ =====
  personalBtn.addEventListener("click", () => {
    if (!AppState.SELECT_CHILD) {
      alert("子どもを選択してください");
      return;
    }
    const newId = `hugview-${Date.now()}`;
    const newWebview = document.createElement("webview");
    newWebview.id = newId;
    newWebview.src = `https://www.hug-ayumu.link/hug/wm/contact_book.php?id=${AppState.SELECT_CHILD}`;
    newWebview.allowpopups = true;
    newWebview.style.cssText = "position:absolute;top:0;left:0;width:100%;height:100%;";
    newWebview.classList.add("hidden");
    content.appendChild(newWebview);

    const tabButton = document.createElement("button");
    tabButton.innerHTML = `
      個人記録 : ${AppState.SELECT_CHILD_NAME}
      <span class="close-btn"${closeButtonsVisible ? "" : " style='display:none'"}>❌</span>
    `;
    tabButton.dataset.target = newId;
    tabsContainer.appendChild(tabButton);

    // 切替イベント
    tabButton.addEventListener("click", () => {
      document.querySelectorAll("webview").forEach(v => v.classList.add("hidden"));
      newWebview.classList.remove("hidden");
      setActiveWebview(newWebview);
    });

    // 閉じる処理
    tabButton.querySelector(".close-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      if (!confirm("このタブを閉じますか？")) return;
      newWebview.remove();
      tabButton.remove();

      const defaultView = document.getElementById("hugview");
      defaultView.classList.remove("hidden");
      setActiveWebview(defaultView);
      tabsContainer.querySelector(`button[data-target="hugview"]`)?.classList.add("active-tab");
    });

    tabButton.click();
  });

  // ===== 🌟 タブ切り替えイベント =====
  tabsContainer.addEventListener("click", (e) => {
    const tab = e.target.closest("button[data-target]");
    if (!tab) return;

    tabsContainer.querySelectorAll("button").forEach(btn => btn.classList.remove("active-tab"));
    tab.classList.add("active-tab");

    const targetId = tab.dataset.target;
    document.querySelectorAll("webview").forEach(v => v.classList.add("hidden"));

    const targetView = document.getElementById(targetId);
    if (targetView) {
      targetView.classList.remove("hidden");
      setActiveWebview(targetView); // ✅ ←これで他モジュールも同期
    }
  });

  console.log("✅ タブ機能 初期化完了（setActiveWebview対応済）");
}
