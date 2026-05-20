/**
 * 入退室と同様、hugview-first タブをアクティブにして
 * HUG の Cookie 付き webview で fetch できる状態にする。
 */

import { activateHugViewFirstButton } from "@/hooks/useTabs/common/index.js";
import { setActiveWebview } from "@/utils/webviewState.js";
import { waitForWebviewReady } from "@/utils/attendance/_shared/webview.js";

const HUG_WM_BASE = "https://www.hug-ayumu.link/hug/wm";

/**
 * @param {string} url
 * @param {Electron.WebviewTag} webview
 */
async function waitForWebviewUrl(webview, url) {
  const matches = () => {
    const loaded = webview.getURL?.() || webview.getAttribute?.("src") || "";
    return loaded.includes(url) || loaded.includes("record_proceedings.php");
  };

  if (!webview.isLoading?.() && matches()) return;

  await new Promise((resolve) => {
    const attach = () => {
      webview.addEventListener(
        "did-finish-load",
        () => {
          if (matches()) resolve();
          else attach();
        },
        { once: true }
      );
    };
    attach();
  });
}

/**
 * hugview-first をアクティブにするだけ（URL は変えない）。
 * fetch は webview 内の Cookie 付きセッションで実行する。
 * @returns {Promise<Electron.WebviewTag>}
 */
export async function ensureHugWebviewSession() {
  activateHugViewFirstButton();

  const webview = document.getElementById("hugview");
  if (!webview) {
    throw new Error("hugview WebView が見つかりません");
  }

  setActiveWebview(webview);
  await waitForWebviewReady(webview);

  const origin = webview.getURL?.() || webview.getAttribute?.("src") || "";
  if (!origin.includes("hug-ayumu.link")) {
    throw new Error(
      "HUG にログインした hugview タブを開いてから実行してください"
    );
  }

  return webview;
}

/**
 * id="hugview" を表示し、各種加算・議事録の登録フォームへ遷移する（画面確認用）
 * @param {string|number} childId
 * @returns {Promise<Electron.WebviewTag>}
 */
export async function ensureHugWebviewForRecordProceedings(childId) {
  if (!childId) {
    throw new Error("児童IDがありません");
  }

  activateHugViewFirstButton();

  const webview = document.getElementById("hugview");
  if (!webview) {
    throw new Error("hugview WebView が見つかりません");
  }

  const url =
    `${HUG_WM_BASE}/record_proceedings.php?mode=edit&select_child=${encodeURIComponent(String(childId))}`;

  const now = webview.getURL?.() || webview.getAttribute?.("src") || "";
  if (!now.includes(`select_child=${childId}`)) {
    webview.src = url;
  }

  setActiveWebview(webview);

  await waitForWebviewReady(webview);
  await waitForWebviewUrl(webview, url);

  return webview;
}
