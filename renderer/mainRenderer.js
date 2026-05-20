// ===== モジュール読み込み =====
import { updateButtonVisibility } from "./src/utils/buttonVisibility.js";

import { loadAllReload } from "./src/utils/reloadSettings.js";

import { getActiveWebview } from "./src/utils/webviewState.js";
import { 
  fetchAttendanceTableData, 
  fetchAttendanceData, 
  parseAttendanceTable 
} from "./src/utils/ToDayChildrenList/attendanceTable.js";
// toastはReact側のToastContextからwindow経由でアクセス可能

// グローバルにエクスポート（デバッグ・開発用）
window.attendanceTableAPI = {
  fetchAttendanceTableData,
  fetchAttendanceData,
  parseAttendanceTable
};

console.log("loaded mainRenderer.js");

window.addEventListener("DOMContentLoaded", async () => {
  console.log("DOMContentLoaded fired");

  // ===== 1️⃣ 設定読み込み =====
  const ok = await loadAllReload();
  if (!ok) {
    if (window.showErrorToast) window.showErrorToast("error: config.json not loaded");
    return;
  }

  // ===== 5️⃣ 設定エディター初期化 =====
  // 少し遅延させて確実に初期化
  setTimeout(async () => {
    console.log("settings editor initializing...");
    
    // 設定が正しく読み込まれているか確認
    console.log("IniState checked:", window.IniState);
    console.log("AppState checked:", window.AppState);
    // customButtonsはcustomButtons.jsonに統一されたため、IniStateからの参照は削除
    
    // settingsEditorはReactコンポーネント（SettingsModal）に統合されました
    // window.settingsEditor = initSettingsEditor();
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
          console.log("config file imported and reloaded");
        }
      }
    } catch (err) {
      console.error("error: config file import and reload failed:", err);
    }
  });

  // ===== 8️⃣ ini.jsonの手動読み込み処理 =====
  document.getElementById("Load-Ini").addEventListener("click", async () => {
    try {
      const reloadOk = await loadAllReload();
      if (reloadOk) {
        updateButtonVisibility(); // ボタン表示を更新
        // カスタムボタンも再読み込み（React側のCustomButtonsPanelが自動的に更新される）
        console.log("ini.json manually loaded");
      }
    } catch (err) {
      console.error("error: ini.json manually load failed:", err);
    }
  });

  // ===== 退出確認（メインからの要求に応答） =====
  window.electronAPI.onConfirmCloseRequest(async () => {
    try {
      const enabled = window.IniState?.appSettings?.ui?.confirmOnClose !== false; // 未設定時は確認ON
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

  console.log("initialization complete:", window.AppState);

  // 🔄 アップデートUI機能を初期化
  // updateUI は React側の useUpdateUI() フックに移行済み（自動初期化）
  // デバッグモードの場合、追加のUIボタンを表示する必要がある場合は、
  // React側のuseUpdateUIフックからaddUpdateButtons()を呼び出す
  const isDebugMode = window.electronAPI.isDebugMode();
  if (isDebugMode) {
    console.log("debug mode: additional UI buttons are managed by React side");
  }

  // ===== 9️⃣ カスタムボタンマネージャー初期化 =====
  // カスタムボタンマネージャーはReact側のCustomButtonsPanelコンポーネントで自動初期化される
  console.log("custom button manager is initialized by React side");

  // ===== 🔟 ボタン表示制御マネージャー初期化 =====
  // buttonVisibilityManager は削除されました（機能が空のため）

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

    // ===== 🧩 SQLite GetChildrenByStaffAndDay テスト呼び出し =====
    try {
      console.log("test started...");
  
      // 例: staffId=73, 曜日="土"（ini.jsonにある値に合わせてOK）
      const response = await window.electronAPI.invoke("GetChildrenByStaffAndDay", {
        staffId: 73,
        date: "土",
        facility_id: 3
      });
  
      if (response?.success) {
        console.log(`get success (${response.week_children.length} items)`);
      } else {
        console.error("error: get failed:", response?.error || "unknown error");
      }
    } catch (err) {
      console.error("error: IPC call failed:", err);
    }
   // ===== 🧩 SQLite GetChildrenByStaffAndDay テスト呼び出し =====

});
