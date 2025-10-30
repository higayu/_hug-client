// ===== モジュール読み込み =====
import { initTabs } from "./modules/ui/tabs.js";
import { AppState } from "./modules/config/config.js";
import { setupSidebar } from "./sidebar/sidebar.js";
import { initHugActions, updateButtonVisibility } from "./modules/actions/hugActions.js";
import { initChildrenList } from "./modules/data/childrenList.js";
import { initSettingsEditor } from "./modules/ui/settingsEditor.js";
import { loadAllReload } from "./modules/actions/reloadSettings.js";
import { updateUI } from "./modules/update/updateUI.js";
import { customButtonManager } from "./modules/actions/customButtons.js";
import { buttonVisibilityManager } from "./modules/ui/buttonVisibility.js";
import { IniState } from "./modules/config/ini.js";
import { getActiveWebview } from "./modules/data/webviewState.js";

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
  setTimeout(async () => {
    console.log("🔄 設定エディターを初期化中...");
    
    // 設定が正しく読み込まれているか確認
    const { IniState } = await import('./modules/config/ini.js');
    const { AppState } = await import('./modules/config/config.js');
    
    console.log("🔍 [MAIN] IniState確認:", IniState);
    console.log("🔍 [MAIN] AppState確認:", AppState);
    console.log("🔍 [MAIN] customButtons:", IniState.appSettings.customButtons);
    
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
        // カスタムボタンも再読み込み
        await customButtonManager.reloadCustomButtons();
        // ボタン表示制御も再読み込み
        await buttonVisibilityManager.reloadButtonVisibility();
        console.log("✅ ini.jsonの手動読み込み完了");
      }
    } catch (err) {
      console.error("❌ ini.jsonの手動読み込みエラー:", err);
    }
  });

  // ===== 退出確認（メインからの要求に応答） =====
  window.electronAPI.onConfirmCloseRequest(async () => {
    try {
      const { IniState } = await import('./modules/config/ini.js');
      const enabled = IniState?.appSettings?.ui?.confirmOnClose !== false; // 未設定時は確認ON
      let shouldClose = true;
      if (enabled) {
        shouldClose = window.confirm('アプリを終了しますか？');
      }
      window.electronAPI.sendConfirmCloseResponse(shouldClose);
    } catch (err) {
      console.error('❌ 終了確認処理エラー:', err);
      // 失敗時は安全側（閉じない）
      window.electronAPI.sendConfirmCloseResponse(false);
    }
  });

  console.log("🎉 初期化完了:", AppState);

  // 🔄 アップデートUI機能を初期化
  const isDebugMode = window.electronAPI.isDebugMode();
  console.log("🔄 アップデートUI機能を初期化中...");
  await updateUI.init();
  
  // デバッグモードの場合、追加のUIボタンを表示
  if (isDebugMode) {
    console.log("🔧 デバッグモード: 追加UIボタンを表示します");
    updateUI.addUpdateButtons();
  }

  // ===== 9️⃣ カスタムボタンマネージャー初期化 =====
  console.log("🔧 カスタムボタンマネージャーを初期化中...");
  await customButtonManager.init();

  // ===== 🔟 ボタン表示制御マネージャー初期化 =====
  console.log("🔧 ボタン表示制御マネージャーを初期化中...");
  await buttonVisibilityManager.init();

  // ===== ⓫ アクティブURLのUI反映（設定モーダルのみ） =====
  function setModalUrlText(urlText) {
    const input = document.getElementById("current-webview-url");
    if (input) input.value = urlText || "";
  }

  function refreshUrlUI() {
    const vw = getActiveWebview();
    const url = vw && typeof vw.getURL === 'function' ? vw.getURL() : '';
    setModalUrlText(url);
  }

  // 初期反映
  refreshUrlUI();

  // アクティブwebview変更時に更新
  document.addEventListener('active-webview-changed', (e) => {
    const url = e?.detail?.url || '';
    setModalUrlText(url);
  });

  // webviewのナビゲーションイベントで更新
  function attachWebviewUrlListeners(vw) {
    if (!vw) return;
    const handler = () => {
      const url = typeof vw.getURL === 'function' ? vw.getURL() : '';
      setModalUrlText(url);
    };
    vw.addEventListener('did-navigate', handler);
    vw.addEventListener('did-navigate-in-page', handler);
    vw.addEventListener('did-redirect-navigation', handler);
  }

  // 既存のhugviewにリスナー
  attachWebviewUrlListeners(document.getElementById('hugview'));

  // 追加されるwebviewにも自動でリスナーを付与
  const contentEl = document.getElementById('content');
  if (contentEl) {
    const mo = new MutationObserver((mutations) => {
      for (const m of mutations) {
        m.addedNodes.forEach((node) => {
          if (node && node.tagName === 'WEBVIEW') {
            attachWebviewUrlListeners(node);
          }
        });
      }
    });
    mo.observe(contentEl, { childList: true });
  }

  // 設定保存などによりIniStateが更新された場合の反映
  document.addEventListener('app-settings-updated', () => {
    refreshUrlUI();
  });

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

  // ========= カスタムツールナビゲーション =====
  const customBtn = document.getElementById("custom-btn");
  const customPanel = document.getElementById("custom-panel");

  customBtn.addEventListener("click", () => {
    customPanel.classList.toggle("open");
    if (customPanel.classList.contains("open")) {
      positionDropdown(customBtn, customPanel);
    }
  });

  document.addEventListener("click", (e) => {
    if (!customPanel.contains(e.target) && e.target !== customBtn) {
      customPanel.classList.remove("open");
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
    if (customPanel.classList.contains("open")) {
      positionDropdown(customBtn, customPanel);
    }
  });

});
