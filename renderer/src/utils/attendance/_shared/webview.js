// src/utils/attendance/_shared/webview.js

import { getActiveWebview, setActiveWebview } from "@/utils/webviewState.js";
import store from "@/store/store.js";
import { activateHugViewFirstButton } from "@/hooks/useTabs/common/index.js";

/* WebView が dom-ready になるまで待つ */
export async function waitForWebviewReady(webview) {
  return new Promise((resolve) => {
    if (!webview) return resolve(false);

    // 既にreadyっぽい
    if (webview.isConnected && !webview.isLoading?.()) {
      resolve(true);
      return;
    }

    // DOM接続待ち
    if (!webview.isConnected) {
      const observer = new MutationObserver(() => {
        if (webview.isConnected) {
          observer.disconnect();
          webview.addEventListener("dom-ready", () => resolve(true), { once: true });
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
      return;
    }

    webview.addEventListener("dom-ready", () => resolve(true), { once: true });
  });
}

/**
 * 専用タブで attendance.php を表示し WebView を返す
 * - 入室/退室/欠席すべてこれを使う（成功率を揃える）
 */
export async function useDedicatedTabAndNavigate() {
  const state = store.getState();
  const facilityId = state.appState?.FACILITY_ID;
  const dateStr = state.appState?.DATE_STR;

  if (!facilityId || !dateStr) {
    throw new Error("FACILITY_ID または DATE_STR がありません");
  }

  activateHugViewFirstButton();

  const webview = document.getElementById("hugview");
  if (!webview) throw new Error("hugview WebView が見つかりません");

  const url = `https://www.hug-ayumu.link/hug/wm/attendance.php?mode=detail&f_id=${facilityId}&date=${dateStr}`;
  const now = webview.getURL?.() || "";

  if (!now.includes(url)) {
    webview.src = url;
  }

  setActiveWebview(webview);

  await waitForWebviewReady(webview);

  // did-finish-load を確実に待つ
  await new Promise((resolve) => {
    const wait = () => {
      webview.addEventListener(
        "did-finish-load",
        () => {
          const loaded = webview.getURL?.() || "";
          loaded.includes(url) ? resolve() : wait();
        },
        { once: true }
      );
    };
    webview.isLoading?.() ? wait() : resolve();
  });

  return webview;
}
