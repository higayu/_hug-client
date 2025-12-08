// renderer\src\hooks\useTabs\common\clearCacheTab.js
// アクティブな WebView のキャッシュを削除する共通関数

import { getActiveWebview } from "@/utils/webviewState.js";

export async function clearActiveWebviewCache() {
  const activeView = getActiveWebview();

  if (!activeView) {
    console.warn("⚠ アクティブな WebView がありません");
    return false;
  }

  const wcId = activeView.getWebContentsId(); // ← WebContents ID を取得

  if (!wcId) {
    console.warn("⚠ WebContents ID が取得できませんでした");
    return false;
  }

  try {
    // メインプロセスへキャッシュ削除を依頼
    const result = await window.api.clearWebviewCache(wcId);

    if (result) {
      console.log("🧹 WebView cache cleared:", activeView.id);
      return true;
    } else {
      console.warn("⚠ キャッシュ削除に失敗しました");
      return false;
    }

  } catch (err) {
    console.error("❌ clearActiveWebviewCache error:", err);
    return false;
  }
}
