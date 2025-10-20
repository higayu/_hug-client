// ===== モジュール読み込み =====
import { initTabs } from "./modules/tabs.js";
import { loadConfig, AppState } from "./modules/config.js";
import { loadIni } from "./modules/ini.js";
import { setupSidebar } from "./modules/sidebar.js";
import { initHugActions, updateButtonVisibility } from "./modules/hugActions.js";
import { initChildrenList } from "./modules/childrenList.js";
import { initSettingsEditor } from "./modules/settingsEditor.js";

console.log("✅ mainRenderer.js 読み込み完了");

window.addEventListener("DOMContentLoaded", async () => {
  console.log("🚀 DOMContentLoaded 発火");

  // ===== 1️⃣ 設定読み込み =====
  const ok = await loadConfig();
  if (!ok) {
    alert("❌ config.json の読み込みに失敗しました");
    return;
  }

  // ===== 1.5️⃣ ini.json読み込み =====
  const iniOk = await loadIni();
  if (!iniOk) {
    console.warn("⚠️ ini.json の読み込みに失敗しました（デフォルト設定を使用）");
  }

  // ===== 2️⃣ サイドバー & タブ初期化 =====
  setupSidebar();
  initTabs();

  // ===== 3️⃣ 子ども一覧と曜日選択を初期化 =====
  await initChildrenList();

  // ===== 4️⃣ 各種ボタン（ログイン・計画）を設定 =====
  initHugActions();

  // ===== 5️⃣ 設定エディター初期化 =====
  // 少し遅延させて確実に初期化
  setTimeout(() => {
    console.log("🔄 設定エディターを初期化中...");
    initSettingsEditor();
  }, 200);

  // ===== 6️⃣ ボタンの表示を更新（少し遅延させて確実に実行） =====
  setTimeout(() => {
    updateButtonVisibility();
  }, 100);

  console.log("🎉 初期化完了:", AppState);

  // ========= 設定ナビゲーション =====
  const panelBtn = document.getElementById("panel-btn");
  const panel = document.getElementById("panel");

  panelBtn.addEventListener("click", () => {
    panel.classList.toggle("open");
  });

  document.addEventListener("click", (e) => {
    if (!panel.contains(e.target) && e.target !== panelBtn) {
      panel.classList.remove("open");
    }
  });

  // ========= 一覧ナビゲーション =====
  const panel_Support_Btn = document.getElementById("panel-support-btn");
  const panel_Support = document.getElementById("panel-support");

  panel_Support_Btn.addEventListener("click", () => {
    panel_Support.classList.toggle("open");
  });

  document.addEventListener("click", (e) => {
    if (!panel_Support.contains(e.target) && e.target !== panel_Support_Btn) {
      panel_Support.classList.remove("open");
    }
  });

  // ========= 専門的支援加算ナビゲーション =====
  const panel_special_Btn = document.getElementById("panel-special-btn");
  const panel_special = document.getElementById("panel-special");

  panel_special_Btn.addEventListener("click", () => {
    panel_special.classList.toggle("open");
  });

  document.addEventListener("click", (e) => {
    if (!panel_special.contains(e.target) && e.target !== panel_special_Btn) {
      panel_special.classList.remove("open");
    }
  });

});
