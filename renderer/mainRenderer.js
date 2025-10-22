// ===== モジュール読み込み =====
import { initTabs } from "./modules/tabs.js";
import { AppState } from "./modules/config.js";
import { setupSidebar } from "./sidebar/sidebar.js";
import { initHugActions, updateButtonVisibility } from "./modules/hugActions.js";
import { initChildrenList } from "./modules/childrenList.js";
import { initSettingsEditor } from "./modules/settingsEditor.js";
import { loadAllReload } from "./modules/reloadSettings.js";

console.log("✅ mainRenderer.js 読み込み完了");

window.addEventListener("DOMContentLoaded", async () => {
  console.log("🚀 DOMContentLoaded 発火");

  // ===== 1️⃣ 設定読み込み =====
  const ok = await loadAllReload();
  if (!ok) {
    showErrorToast("❌ config.json の読み込みに失敗しました");
    return;
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
    window.settingsEditor = initSettingsEditor();
  }, 200);

  // ===== 6️⃣ ボタンの表示を更新（少し遅延させて確実に実行） =====
  setTimeout(() => {
    updateButtonVisibility();
  }, 100);

  // ===== 7️⃣ 設定ファイルインポート後の再読み込み処理 =====
  // 設定ファイルインポートボタンのイベントリスナーを追加
  document.getElementById("Import-Setting").addEventListener("click", async () => {
    try {
      const result = await window.electronAPI.importConfigFile();
      if (result.success) {
        // 設定ファイルインポート後に設定を再読み込み
        const reloadOk = await loadAllReload();
        if (reloadOk) {
          updateButtonVisibility(); // ボタン表示を更新
          console.log("✅ 設定ファイルインポート後の再読み込み完了");
        }
      }
    } catch (err) {
      console.error("❌ 設定ファイルインポート後の再読み込みエラー:", err);
    }
  });

  // ===== 8️⃣ ini.jsonの手動読み込み処理 =====
  document.getElementById("Load-Ini").addEventListener("click", async () => {
    try {
      const reloadOk = await loadAllReload();
      if (reloadOk) {
        updateButtonVisibility(); // ボタン表示を更新
        console.log("✅ ini.jsonの手動読み込み完了");
      }
    } catch (err) {
      console.error("❌ ini.jsonの手動読み込みエラー:", err);
    }
  });

  console.log("🎉 初期化完了:", AppState);

  // ドロップダウンメニューの位置を動的に計算する関数
  function positionDropdown(button, dropdown) {
    const rect = button.getBoundingClientRect();
    dropdown.style.position = 'fixed';
    dropdown.style.top = (rect.bottom + 5) + 'px';
    dropdown.style.left = rect.left + 'px';
    dropdown.style.zIndex = '99999';
  }

  // ========= 設定ナビゲーション =====
  const panelBtn = document.getElementById("panel-btn");
  const panel = document.getElementById("panel");

  panelBtn.addEventListener("click", () => {
    panel.classList.toggle("open");
    if (panel.classList.contains("open")) {
      positionDropdown(panelBtn, panel);
    }
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
    if (panel_Support.classList.contains("open")) {
      positionDropdown(panel_Support_Btn, panel_Support);
    }
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
    if (panel_special.classList.contains("open")) {
      positionDropdown(panel_special_Btn, panel_special);
    }
  });

  document.addEventListener("click", (e) => {
    if (!panel_special.contains(e.target) && e.target !== panel_special_Btn) {
      panel_special.classList.remove("open");
    }
  });

  // ウィンドウリサイズ時にドロップダウンの位置を再計算
  window.addEventListener("resize", () => {
    if (panel.classList.contains("open")) {
      positionDropdown(panelBtn, panel);
    }
    if (panel_Support.classList.contains("open")) {
      positionDropdown(panel_Support_Btn, panel_Support);
    }
    if (panel_special.classList.contains("open")) {
      positionDropdown(panel_special_Btn, panel_special);
    }
  });

});
