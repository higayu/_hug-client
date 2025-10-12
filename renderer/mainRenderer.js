// ===== モジュール読み込み =====
import { initTabs } from "./modules/tabs.js";
import { loadConfig, AppState } from "./modules/config.js";
import { setupSidebar } from "./modules/sidebar.js";
import { initHugActions } from "./modules/hugActions.js";
import { initChildrenList } from "./modules/childrenList.js";

console.log("✅ mainRenderer.js 読み込み完了");

window.addEventListener("DOMContentLoaded", async () => {
  console.log("🚀 DOMContentLoaded 発火");

  // ===== 1️⃣ 設定読み込み =====
  const ok = await loadConfig();
  if (!ok) {
    alert("❌ config.json の読み込みに失敗しました");
    return;
  }

  // ===== 2️⃣ サイドバー & タブ初期化 =====
  setupSidebar();
  initTabs();

  // ===== 3️⃣ 子ども一覧と曜日選択を初期化 =====
  await initChildrenList();

  // ===== 4️⃣ 各種ボタン（ログイン・計画）を設定 =====
  initHugActions();

  console.log("🎉 初期化完了:", AppState);
});
