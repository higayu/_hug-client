// renderer/modules/actions/hugActions.js
import { AppState } from "../config/config.js";
import { initChildrenList } from "../data/childrenList.js";
import { getActiveWebview } from "../data/webviewState.js";
import { isFeatureEnabled, getButtonConfig } from "../config/ini.js";
import { showSuccessToast, showErrorToast } from "../ui/toast/toast.js";

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
        // facilitySelectの値を取得
        const facilitySelect = document.getElementById("facilitySelect");
        const facility_id = facilitySelect ? facilitySelect.value : null;
        
        AppState.childrenData = await window.electronAPI.GetChildrenByStaffAndDay(
          AppState.STAFF_ID,
          AppState.WEEK_DAY,
          facility_id
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

  // ✅ 出勤データ取得ボタン（サイドバー内）
  // サイドバーが読み込まれるまで待機してからイベントリスナーを設定
  setupAttendanceButton();

  console.log("✅ Hug操作 初期化完了");
}

/**
 * 出勤データ取得ボタンのイベントリスナーを設定
 */
function setupAttendanceButton() {
  // サイドバーが読み込まれるまで待機
  const checkAndSetup = () => {
    const settingsEl = document.getElementById("settings");
    const button = settingsEl?.querySelector("#fetchAttendanceBtn");
    
    if (button && !button.dataset.listenerAdded) {
      button.dataset.listenerAdded = "true";
      
      button.addEventListener("click", async () => {
        await handleFetchAttendanceData(button);
      });
      
      console.log("✅ 出勤データ取得ボタンのイベントリスナーを設定しました");
    } else if (!button) {
      // まだ読み込まれていない場合、少し待って再試行
      setTimeout(checkAndSetup, 500);
    }
  };
  
  // 初期チェック
  checkAndSetup();
  
  // DOM変更を監視してサイドバーが読み込まれたら設定
  const observer = new MutationObserver(() => {
    checkAndSetup();
  });
  
  const settingsEl = document.getElementById("settings");
  if (settingsEl) {
    observer.observe(settingsEl, { childList: true, subtree: true });
  }
}

/**
 * 出勤データ取得処理
 * @param {HTMLElement} button - ボタン要素
 */
async function handleFetchAttendanceData(button) {
  const resultEl = document.getElementById("settings")?.querySelector("#attendanceResult");
  
  if (!resultEl) {
    console.error("❌ 結果表示要素が見つかりません");
    return;
  }

  try {
    // ボタンを無効化
    button.disabled = true;
    button.textContent = "⏳ 取得中...";
    resultEl.style.display = "block";
    resultEl.className = "attendance-result info";
    resultEl.textContent = "📥 データを取得しています...";

    // 施設IDと日付を取得
    const facilitySelect = document.getElementById("facilitySelect");
    const dateInput = document.getElementById("settings")?.querySelector("#dateSelect");
    
    const facility_id = facilitySelect?.value || AppState.FACILITY_ID;
    const date_str = dateInput?.value || AppState.DATE_STR;

    if (!facility_id || !date_str) {
      throw new Error("施設IDまたは日付が設定されていません");
    }

    console.log("📊 [ATTENDANCE] 出勤データ取得開始:", { facility_id, date_str });

    // 出勤データを取得
    const { fetchAttendanceTableData } = await import("../data/attendanceTable.js");
    const result = await fetchAttendanceTableData(facility_id, date_str, {
      showToast: true
    });

    if (result.success) {
      // 成功時
      resultEl.className = "attendance-result success";
      resultEl.innerHTML = `
        <div style="font-weight: bold; margin-bottom: 8px;">✅ データ取得完了</div>
        <div style="margin-bottom: 4px;">施設ID: ${facility_id}</div>
        <div style="margin-bottom: 4px;">日付: ${date_str}</div>
        <div style="margin-bottom: 4px;">テーブル行数: ${result.rowCount}</div>
        <div style="margin-bottom: 4px;">ページタイトル: ${result.pageTitle || "N/A"}</div>
        <details style="margin-top: 8px;">
          <summary style="cursor: pointer; font-weight: bold;">テーブルHTML（クリックで展開）</summary>
          <pre style="margin-top: 8px; padding: 8px; background: #f8f9fa; border-radius: 4px; overflow-x: auto; font-size: 10px; max-height: 300px; overflow-y: auto;">${escapeHtml(result.html)}</pre>
        </details>
      `;
      console.log("✅ [ATTENDANCE] 出勤データ取得成功:", result);
    } else {
      // 失敗時
      resultEl.className = "attendance-result error";
      resultEl.innerHTML = `
        <div style="font-weight: bold; margin-bottom: 8px;">❌ データ取得失敗</div>
        <div>エラー: ${escapeHtml(result.error || "不明なエラー")}</div>
      `;
      console.error("❌ [ATTENDANCE] 出勤データ取得失敗:", result.error);
    }

  } catch (error) {
    console.error("❌ [ATTENDANCE] 出勤データ取得エラー:", error);
    resultEl.className = "attendance-result error";
    resultEl.innerHTML = `
      <div style="font-weight: bold; margin-bottom: 8px;">❌ エラーが発生しました</div>
      <div>${escapeHtml(error.message || "不明なエラー")}</div>
    `;
  } finally {
    // ボタンを再有効化
    button.disabled = false;
    button.textContent = "📊 出勤データ取得";
  }
}

/**
 * HTMLエスケープ関数
 * @param {string} text - エスケープするテキスト
 * @returns {string} エスケープされたテキスト
 */
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// ボタンの表示/非表示を制御する関数（統合版）
export function updateButtonVisibility() {
  console.log('🔄 [HUG_ACTIONS] ボタン表示制御を実行中...');
  
  // 各ボタンの表示/非表示を制御
  const buttonMappings = {
    'individualSupportPlan': 'Individual_Support_Button',
    'specializedSupportPlan': 'Specialized-Support-Plan',
    'importSetting': 'Import-Setting',
    'getUrl': 'Get-Url',
    'loadIni': 'Load-Ini',
  };

  Object.keys(buttonMappings).forEach(featureName => {
    const buttonId = buttonMappings[featureName];
    const button = document.getElementById(buttonId);
    
    if (button) {
      const isEnabled = isFeatureEnabled(featureName);
      console.log(`🔧 [HUG_ACTIONS] ボタン更新: ${buttonId}, 有効: ${isEnabled}`);
      
      // ボタンの表示/非表示を制御
      button.style.display = isEnabled ? 'inline-block' : 'none';
      
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
