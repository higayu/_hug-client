// renderer/modules/hugActions.js
import { AppState } from "./config.js";
import { initChildrenList } from "./childrenList.js";
import { getActiveWebview } from "./webviewState.js";
import { isFeatureEnabled, getButtonConfig } from "./ini.js";
import { showSuccessToast, showErrorToast } from "./toast/toast.js";

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
  const testButton = document.getElementById("test-double-get");
  if (testButton) {
    testButton.addEventListener("click", () => {
      console.log("🔘 [RENDERER] テストボタンがクリックされました");
      console.log("🔍 [RENDERER] AppState:", { 
        FACILITY_ID: AppState.FACILITY_ID, 
        DATE_STR: AppState.DATE_STR 
      });
      try {
        if (window.electronAPI && window.electronAPI.open_test_double_get) {
          console.log("📤 [RENDERER] electronAPI.open_test_double_get を呼び出します");
          window.electronAPI.open_test_double_get(AppState.FACILITY_ID, AppState.DATE_STR);
        } else {
          console.error("❌ [RENDERER] window.electronAPI.open_test_double_get が見つかりません");
          console.log("🔍 [RENDERER] window.electronAPI:", window.electronAPI);
        }
      } catch (error) {
        console.error("❌ [RENDERER] テストボタンクリック処理でエラー:", error);
      }
    });
    console.log("✅ テストボタンのイベントリスナーを設定しました");
  } else {
    console.error("❌ テストボタンが見つかりません: test-double-get");
  }
  
  // 「設定ファイルの取得」ボタンのクリックイベント
  document.getElementById("Import-Setting").addEventListener("click", async () => {
    try {
      const result = await window.electronAPI.importConfigFile();
      if (result.success) {
        showSuccessToast("✅ 設定ファイルをコピーしました:\n" + result.destination);
        // 設定の再読み込みは mainRenderer.js で処理される
        showSuccessToast("✅ 設定の再読み込みが完了しました");
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

    // ✅ URLの取得処理
  document.getElementById("Get-Url").addEventListener("click", async () => {
    try {
      console.log("🔄 URLの取得処理を開始...");
      const vw = getActiveWebview();
      
      if (!vw) {
        showErrorToast("❌ WebViewが見つかりません");
        return;
      }

      // WebViewのURLを取得
      const url = vw.getURL();
      console.log("📋 取得したURL:", url);

      if (!url || url === 'about:blank') {
        showErrorToast("❌ URLが取得できませんでした");
        return;
      }

      // クリップボードにコピー
      await navigator.clipboard.writeText(url);
      console.log("✅ URLをクリップボードにコピーしました:", url);
      
      // 成功メッセージを表示（URLの詳細情報も含める）
      const urlObj = new URL(url);
      const shortUrl = urlObj.hostname + urlObj.pathname;
      showSuccessToast(`✅ URLをコピーしました\n${shortUrl}`);
      
    } catch (err) {
      console.error("❌ URL取得・コピーエラー:", err);
      
      // フォールバック: 古いブラウザ対応
      try {
        const vw = getActiveWebview();
        const url = vw.getURL();
        
        // テキストエリアを使用したフォールバック
        const textArea = document.createElement('textarea');
        textArea.value = url;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        
        showSuccessToast(`✅ URLをクリップボードにコピーしました（フォールバック）`);
        console.log("✅ フォールバック方式でコピー成功");
        
      } catch (fallbackErr) {
        console.error("❌ フォールバック方式も失敗:", fallbackErr);
        showErrorToast("❌ URLのコピーに失敗しました");
      }
    }
  });


  // ✅ ini.jsonの手動読み込み
  document.getElementById("Load-Ini").addEventListener("click", async () => {
    try {
      // 設定の再読み込みは mainRenderer.js で処理される
      showSuccessToast("✅ 設定の再読み込みが完了しました");
    } catch (err) {
      console.error("❌ ini.json読み込みエラー:", err);
      alert("❌ エラーが発生しました: " + err.message);
    }
  });

  console.log("✅ Hug操作 初期化完了");
}


// ボタンの表示/非表示を制御する関数（統合版）
export function updateButtonVisibility() {
  console.log('🔄 [HUG_ACTIONS] ボタン表示制御を実行中...');
  
  // 各ボタンの表示/非表示を制御
  const buttonMappings = {
    'individualSupportPlan': 'Individual_Support_Button',
    'specializedSupportPlan': 'Specialized-Support-Plan',
    'testDoubleGet': 'test-double-get',
    'importSetting': 'Import-Setting',
    'getUrl': 'Get-Url',
    'loadIni': 'Load-Ini'
  };

  Object.keys(buttonMappings).forEach(featureName => {
    const buttonId = buttonMappings[featureName];
    const button = document.getElementById(buttonId);
    
    if (button) {
      const isEnabled = isFeatureEnabled(featureName);
      console.log(`🔧 [HUG_ACTIONS] ボタン更新: ${buttonId}, 有効: ${isEnabled}`);
      
      // テストボタンの場合は常に表示（デバッグ用）
      if (buttonId === 'test-double-get') {
        button.style.display = 'inline-block';
        console.log(`🔧 [HUG_ACTIONS] テストボタンを強制表示: ${buttonId}`);
      } else {
        // ボタンの表示/非表示を制御
        button.style.display = isEnabled ? 'inline-block' : 'none';
      }
      
      // ボタンテキストとカラーを更新
      const config = getButtonConfig(featureName);
      if (config.buttonText) {
        button.textContent = config.buttonText;
        console.log(`📝 [HUG_ACTIONS] ボタンテキスト更新: ${buttonId} -> ${config.buttonText}`);
      }
      if (config.buttonColor) {
        button.style.backgroundColor = config.buttonColor;
        console.log(`🎨 [HUG_ACTIONS] ボタンカラー更新: ${buttonId} -> ${config.buttonColor}`);
      }
    } else {
      console.warn(`⚠️ [HUG_ACTIONS] ボタンが見つかりません: ${buttonId}`);
    }
  });
  
  console.log('✅ [HUG_ACTIONS] ボタン表示制御完了');
}
