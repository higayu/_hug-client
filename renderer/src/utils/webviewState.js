// src/utils/webviewState.js
// WebView状態管理ユーティリティ + 詳細ログ付きデバッグ版

let activeWebview = null;

/**
 * 現在のアクティブwebviewを取得
 */
export function getActiveWebview() {
  console.group("🔍 getActiveWebview() 呼び出し");

  if (!activeWebview) {
    console.warn("⚠ activeWebview が null → DOM から取得を試みる");

    const vw = document.getElementById("hugview");
    console.log("📌 document.getElementById('hugview'):", vw);

    if (!vw) {
      console.error("❌ #hugview が DOM に存在しません");
      console.warn("⛔ webview が mount 前の可能性");
      console.warn("⛔ レンダラー切り替え直後で DOM 未反映の可能性");
      console.warn("⛔ React の useEffect がまだ走っていない可能性");
      console.groupEnd();
      return null;
    }

    console.log("🟢 #hugview を activeWebview として採用");
    activeWebview = vw;
  }

  // ▼ activeWebview のURL取得をチェック
  const hasGetURL = typeof activeWebview.getURL === "function";
  console.log("📌 typeof activeWebview.getURL:", typeof activeWebview.getURL);

  if (!hasGetURL) {
    console.warn("⚠ getURL() が存在しない → webview がまだ準備中の可能性");
    console.warn(
      "   推測: <webview> タグの 'nodeintegration' や 'preload' が影響している可能性"
    );
  }

  let url = "";
  try {
    url = hasGetURL ? activeWebview.getURL() : "";
  } catch (e) {
    console.error("💥 getURL() 実行で例外:", e);
  }

  console.log("📌 getURL() の返値:", url);

  if (url === "") {
    console.warn("⚠ getURL が空文字 → 読み込み前 or about:blank の可能性");
  }

  console.groupEnd();
  return activeWebview;
}

/**
 * アクティブwebviewを更新（タブ切り替え時などに使用）
 */
export function setActiveWebview(vw) {
  console.group("🔄 setActiveWebview 呼び出し");

  console.log("📌 新しい activeWebview:", vw);

  if (!vw) {
    console.error("❌ 渡された vw が null → activeWebview をクリア");
    activeWebview = null;
    console.groupEnd();
    return;
  }

  activeWebview = vw;

  let url = "";
  try {
    url = typeof vw.getURL === "function" ? vw.getURL() : "";
  } catch (e) {
    console.error("💥 getURL 実行時エラー:", e);
  }

  console.log("📌 新 activeWebview URL:", url);

  // イベント発火
  try {
    const detail = { webview: vw, url };
    document.dispatchEvent(
      new CustomEvent("active-webview-changed", { detail })
    );
    console.log("📣 active-webview-changed イベント送出 OK");
  } catch (e) {
    console.error("💥 active-webview-changed イベント送出失敗:", e);
  }

  console.groupEnd();
}

/**
 * 現在のアクティブIDを取得（デバッグ用途）
 */
export function getActiveId() {
  const id = activeWebview ? activeWebview.id : "(none)";
  console.log("ℹ getActiveId():", id);
  return id;
}

/**
 * WebContents ID を取得（キャッシュ削除に必須）
 */
export function getActiveWebContentsId() {
  if (!activeWebview) {
    console.warn("⚠ activeWebview が null → getActiveWebContentsId は null");
    return null;
  }

  if (typeof activeWebview.getWebContentsId !== "function") {
    console.warn("⚠ getWebContentsId() が存在しません");
    return null;
  }

  try {
    const id = activeWebview.getWebContentsId();
    console.log("ℹ WebContentsId:", id);
    return id;
  } catch (e) {
    console.error("💥 getWebContentsId 実行中に例外:", e);
    return null;
  }
}
