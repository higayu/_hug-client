// src/utils/webviewState.js
// WebView状態管理ユーティリティ + 詳細ログ付きデバッグ版

let activeWebview = null;

/**
 * 現在のアクティブwebviewを取得
 */
export function getActiveWebview() {
  console.group("🔍 getActiveWebview() 呼び出し");

  if (!activeWebview) {
    const vw = document.getElementById("hugview");
    if (!vw) {
      console.groupEnd();
      return null;
    }
    activeWebview = vw;
  }

  // getURL があっても dom-ready 前は例外になることがある
  let url = "";
  try {
    if (typeof activeWebview.getURL === "function") {
      url = activeWebview.getURL();
    }
  } catch {
    // ★ ここが重要：何も出さない（正常系として扱う）
    console.groupEnd();
    return activeWebview;
  }

  if (url) {
    console.log("📌 現在URL:", url);
  }

  console.groupEnd();
  return activeWebview;
}


/**
 * アクティブwebviewを更新（タブ切り替え時などに使用）
 */
export function setActiveWebview(vw) {
  if (!vw) {
    activeWebview = null;
    return;
  }

  activeWebview = vw;

  vw.addEventListener("dom-ready", () => {
    try {
      const url = vw.getURL();
      document.dispatchEvent(
        new CustomEvent("active-webview-changed", {
          detail: { webview: vw, url }
        })
      );
    } catch {
      // dom-ready直後でも失敗することがあるので黙殺
    }
  });
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
