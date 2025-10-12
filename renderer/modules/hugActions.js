// modules/hugActions.js
import { AppState } from "./config.js";
import { initChildrenList } from "./childrenList.js";
import { getActiveWebview } from "./webviewState.js";
import { loadConfig } from "./config.js";

export function initHugActions() {

  // ✅ 更新ボタン
  document.getElementById("refreshBtn").addEventListener("click", async () => {
    const vw = getActiveWebview();
    vw?.reload();

    if (typeof initChildrenList === "function") {
      console.log("🔄 再読み込み後に子どもリストを再描画");
      AppState.childrenData = await window.electronAPI.GetChildrenByStaffAndDay(
        AppState.STAFF_ID,
        AppState.WEEK_DAY
      );
      await initChildrenList();
    }
  });

  // ✅ 自動ログイン
  document.getElementById("loginBtn").addEventListener("click", async () => {
    const vw = getActiveWebview();
    if (!vw) return alert("Webview が見つかりません");
    if (!AppState.HUG_USERNAME || !AppState.HUG_PASSWORD) {
      alert("config.json がまだ読み込まれていません。");
      return;
    }

    console.log("🚀 自動ログイン開始...");
    vw.executeJavaScript(`
      document.querySelector('input[name="username"]').value = ${JSON.stringify(AppState.HUG_USERNAME)};
      document.querySelector('input[name="password"]').value = ${JSON.stringify(AppState.HUG_PASSWORD)};
      const checkbox = document.querySelector('input[name="setexpire"]');
      if (checkbox && !checkbox.checked) checkbox.click();
      document.querySelector("input.btn-login")?.click();
    `);
  });

  // ✅ 専門的支援一覧
  document.getElementById("professional-support").addEventListener("click", () => {
    const vw = getActiveWebview();
    vw?.loadURL("https://www.hug-ayumu.link/hug/wm/record_proceedings.php");
  });

  // ✅ 新規専門的支援
  document.getElementById("professional-support-new").addEventListener("click", () => {
    const vw = getActiveWebview();
    if (!vw) return;
    vw.loadURL("https://www.hug-ayumu.link/hug/wm/record_proceedings.php?mode=edit");
  });

  // ✅ 個別支援計画（別ウインドウ）
  document.getElementById("Individual_Support_Button").addEventListener("click", () => {
    window.electronAPI.openIndividualSupportPlan(AppState.SELECT_CHILD);
  });

  // ✅ 専門的支援計画（別ウインドウ）
  document.getElementById("Specialized-Support-Plan").addEventListener("click", () => {
    window.electronAPI.openSpecializedSupportPlan(AppState.SELECT_CHILD);
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


  console.log("✅ Hug操作 初期化完了");
}
