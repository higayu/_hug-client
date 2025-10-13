// renderer/modules/hugActions.js
import { AppState,loadConfig } from "./config.js";
import { initChildrenList } from "./childrenList.js";
import { getActiveWebview } from "./webviewState.js";

export function initHugActions() {

  // ✅ 更新ボタン
  document.getElementById("refreshBtn").addEventListener("click", async () => {
    const vw = getActiveWebview();
    if (!vw) {
      alert("WebView が見つかりません");
      return;
    }

    console.log("🔄 WebViewを再読み込み中...");
    vw.reload();

    // 再読み込み完了を待つ
    await new Promise((resolve) => {
      vw.addEventListener("did-finish-load", resolve, { once: true });
    });

    console.log("✅ 再読み込み完了。子どもリストを再取得");
    if (typeof initChildrenList === "function") {
      try {
        AppState.childrenData = await window.electronAPI.GetChildrenByStaffAndDay(
          AppState.STAFF_ID,
          AppState.WEEK_DAY
        );
        await initChildrenList();
      } catch (err) {
        console.error("❌ 子リスト再取得エラー:", err);
        alert("子どもリストの再取得に失敗しました");
      }
    }
  });


  // ✅ 自動ログイン
  document.getElementById("loginBtn").addEventListener("click", async () => {
    const vw = getActiveWebview();
    if (!vw) return alert("Webview が見つかりません");

    await new Promise((resolve) => {
      if (vw.isLoading()) {
        vw.addEventListener("did-finish-load", resolve, { once: true });
      } else {
        resolve();
      }
    });

    if (!AppState.HUG_USERNAME || !AppState.HUG_PASSWORD) {
      alert("config.json がまだ読み込まれていません。");
      return;
    }

    console.log("🚀 自動ログイン開始...");
    try {
      await vw.executeJavaScript(`
        document.querySelector('input[name="username"]').value = ${JSON.stringify(AppState.HUG_USERNAME)};
        document.querySelector('input[name="password"]').value = ${JSON.stringify(AppState.HUG_PASSWORD)};
        const checkbox = document.querySelector('input[name="setexpire"]');
        if (checkbox && !checkbox.checked) checkbox.click();
        document.querySelector("input.btn-login")?.click();
      `);
    } catch (err) {
      console.error("❌ ログインスクリプト実行エラー:", err);
      alert("ログインスクリプト実行に失敗しました");
    }
  });



  // ✅ 個別支援計画（別ウインドウ）
  document.getElementById("Individual_Support_Button").addEventListener("click", () => {
    window.electronAPI.openIndividualSupportPlan(AppState.SELECT_CHILD);
  });

  // ✅ 専門的支援計画（別ウインドウ）
  document.getElementById("Specialized-Support-Plan").addEventListener("click", () => {
    window.electronAPI.openSpecializedSupportPlan(AppState.SELECT_CHILD);
  });

    // ✅ テスト データ取得（別ウインドウ）
  document.getElementById("test-double-get").addEventListener("click", () => {
    window.electronAPI.open_test_double_get();
  });
  
  // 「設定ファイルの取得」ボタンのクリックイベント
  document.getElementById("Import-Setting").addEventListener("click", async () => {
    try {
      const result = await window.electronAPI.importConfigFile();
      if (result.success) {
        alert("✅ 設定ファイルをコピーしました:\n" + result.destination);
        // ===== ① config.json 読み込み =====
          const ok = await loadConfig();
          if (ok) {
            console.log("OK");
          } else {
            alert("❌ 設定の読み込みに失敗しました");
          }
      } else {
        alert("⚠️ コピーがキャンセルまたは失敗しました");
      }
    } catch (err) {
      alert("❌ エラーが発生しました: " + err.message);
    }
  });

  // 🌟 トグルで閉じるボタンの表示ON/OFF
  document.getElementById("closeToggle").addEventListener("change", (e) => {
    AppState.closeButtonsVisible = e.target.checked;
    document.querySelectorAll(".close-btn").forEach(btn => {
      btn.style.display = AppState.closeButtonsVisible ? "inline" : "none";
    });
  });


  console.log("✅ Hug操作 初期化完了");
}
