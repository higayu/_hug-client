// src/utils/attendanceButtonClick.js
// 出勤データの入室・欠席・退室ボタンを自動クリックする機能

import { getActiveWebview, setActiveWebview } from './webviewState.js'
import store from '@/store/store.js'
import { activateHugViewFirstButton } from '@/hooks/useTabs/common/index.js'

const FIRST_BUTTON_ID = 'hugview-first-button';

/**
 * column5Html から欠席ボタンID（absence_...）を抽出
 */
function extractAbsenceButtonId(column5Html) {
  const m = (column5Html || "").match(/id\s*=\s*"((?:absence|absense)_[^"]+)"/i);
  return m?.[1] ?? null;
}

function parseAbsenceId(absenceId) {
  const parts = String(absenceId || "").split("_");
  if (parts.length < 5 || parts[0] !== "absence") return null;

  return {
    raw: absenceId,
    r_id: parts[1],
    c_id: parts[2],     // ✅ 児童ID
    f_id: parts[3],
    date: parts[4],
    strength_action: parts[5] ?? null,
    special_support: parts[6] ?? null,
  };
}

function assertAbsenceChildId(absenceId, expectedChildId) {
  const parsed = parseAbsenceId(absenceId);
  if (!parsed) {
    throw new Error(`absenceId の形式が不正です: ${absenceId}`);
  }

  if (String(parsed.c_id) !== String(expectedChildId)) {
    throw new Error(
      `児童ID不一致: expected=${expectedChildId}, absenceId.c_id=${parsed.c_id}, absenceId=${absenceId}`
    );
  }

  return parsed; // 必要なら分解済みデータも返す
}

/* ---------------------------------------------------------
 * WebView が dom-ready / load 完了するまで確実に待つ
 * --------------------------------------------------------- */
async function waitForWebviewReady(webview) {
  return new Promise((resolve) => {
    if (!webview) return resolve(false);

    if (webview.isConnected && !webview.isLoading()) {
      resolve(true);
      return;
    }

    if (!webview.isConnected) {
      const observer = new MutationObserver(() => {
        if (webview.isConnected) {
          observer.disconnect();
          webview.addEventListener('dom-ready', () => resolve(true), { once: true });
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
    } else {
      webview.addEventListener('dom-ready', () => resolve(true), { once: true });
    }
  });
}

/* ---------------------------------------------------------
 * extract 系（onclick / 欠席ID / 欠席name）
 * --------------------------------------------------------- */
export function extractEnterButtonOnclick(column5Html) {
  if (!column5Html) return null;
  const regex = /onclick\s*=\s*["']([^"']+)["']/i;
  const m = column5Html.match(regex);
  return m?.[1] ?? null;
}

export function extractAbsenceButtonName(column5Html) {
  if (!column5Html) return null;
  const m = column5Html.match(/name\s*=\s*["']([^"']*absence[^"']*)["']/i);
  return m?.[1] ?? null;
}

export function extractExitButtonOnclick(column6Html) {
  if (!column6Html) return null;
  const m = column6Html.match(/onclick\s*=\s*["']([^"']+)["']/i);
  return m?.[1] ?? null;
}

/* ---------------------------------------------------------
 * 専用タブで attendance.php を表示し WebView を返す
 * --------------------------------------------------------- */
async function useDedicatedTabAndNavigate() {
  const state = store.getState();
  const facilityId = state.appState.FACILITY_ID;
  const dateStr = state.appState.CURRENT_YMD;
  console.log("入退室ボタンの起動",state);

  if (!facilityId || !dateStr) {
    throw new Error('FACILITY_ID または DATE_STR がありません');
  }

  activateHugViewFirstButton();

  const webview = document.getElementById('hugview');
  if (!webview) throw new Error('hugview WebView が見つかりません');

  const url = `https://www.hug-ayumu.link/hug/wm/attendance.php?mode=detail&f_id=${facilityId}&date=${dateStr}`;
  const now = webview.getURL?.() || "";

  if (!now.includes(url)) {
    webview.src = url;
  }

  setActiveWebview(webview);

  await waitForWebviewReady(webview);

  await new Promise((resolve) => {
    const wait = () => {
      webview.addEventListener(
        'did-finish-load',
        () => {
          const loaded = webview.getURL?.() || "";
          loaded.includes(url) ? resolve() : wait();
        },
        { once: true }
      );
    };

    webview.isLoading() ? wait() : resolve();
  });

  return webview;
}

/* ---------------------------------------------------------
 * WebView 内で実行する安全なクリックスクリプトを生成
 * --------------------------------------------------------- */
function buildWebviewClickExecutor({ onclickCode, buttonText, extraSelector }) {
  const hasOnclickCode = onclickCode && typeof onclickCode === 'string';
  const buttonTextJson = JSON.stringify(buttonText);
  const errorMsgJson = JSON.stringify(buttonText + ' ボタンが見つかりません');
  
  // extraSelectorの処理
  let extraSelectorPart = '';
  if (extraSelector) {
    const selectorJson = JSON.stringify(extraSelector);
    extraSelectorPart = `
      if (!btn) {
        try {
          const allButtons = Array.from(document.querySelectorAll('button'));
          btn = allButtons.find(b => {
            try {
              return b.matches(${selectorJson});
            } catch (e) {
              return false;
            }
          });
        } catch (e) {
          console.warn("selector エラー:", e);
        }
      }`;
  }
  
  // onclickCodeを安全に実行（Functionコンストラクタを使用）
  const onclickCodeJson = JSON.stringify(onclickCode || '');
  const onclickCodePart = hasOnclickCode ? `
        // ① onclick の直接実行を試行
        try {
          logInfo.type = 'onclick_direct';
          logInfo.onclickCode = ${onclickCodeJson};
          console.log("🔵 onclick 実行:", logInfo);

          const onclickFn = new Function(${onclickCodeJson});
          onclickFn();
          
          return { success: true, logInfo };
        } catch (err) {
          logInfo.onclickError = err.message;
          console.warn("⚠ onclick エラー → fallbackへ:", err);
        }` : '';
  
  return `
    (function() {
      try {
        const logInfo = {};
        ${onclickCodePart}

        // ② ボタン探索（text / id / class / name）
        const buttons = Array.from(document.querySelectorAll('button'));
        let btn = buttons.find(b => b.textContent.trim() === ${buttonTextJson});
        ${extraSelectorPart}

        if (!btn) {
          return { success: false, error: ${errorMsgJson} };
        }

        logInfo.type = 'dom_button';
        logInfo.button = {
          id: btn.id || null,
          name: btn.name || null,
          classList: [...btn.classList],
          text: btn.textContent.trim(),
          outerHTML: btn.outerHTML.substring(0, 200)
        };

        console.log("🔵 ボタン特定:", logInfo);

        btn.click();

        return { success: true, logInfo };

      } catch (error) {
        console.error("❌ click executor error", error);
        return { success: false, error: error.message || String(error) };
      }
    })();
  `;
}

/* =========================================================
 * ★ 入室ボタン（退室ボタンと同等の成功率）
 * ========================================================= */
export async function clickEnterButton(column5Html) {
  let webview = null;
  
  if(!false){
    return;//一旦使用停止
  }

  try {
    console.log("🔘 [ATTENDANCE] 入室ボタン処理開始");
    webview = await useDedicatedTabAndNavigate();

    const onclickCode = extractEnterButtonOnclick(column5Html);

    const script = buildWebviewClickExecutor({
      onclickCode,
      buttonText: "入室",
      extraSelector: "button.btn-entry, button[class*='enter']"
    });

    const result = await webview.executeJavaScript(script);

    if (result.success) {
      console.log("✅ 入室ボタンクリック成功:", result.logInfo);
      window.showSuccessToast?.("✅ 入室ボタンをクリックしました", 2000);
      return { success: true };
    }

    throw new Error(result.error);
  } catch (err) {
    console.error("❌ 入室ボタンエラー:", err);
    window.showErrorToast?.(`❌ 入室ボタンクリック失敗\n${err.message}`, 3000);
    return { success: false, error: err.message };
  }
}

/* =========================================================
 * ★ 欠席ボタン（退室ボタン同等の成功率）
 * ========================================================= */
/* =========================================================
 * ★ 欠席ボタン → モーダル表示まで（児童ID一致チェック付き）
 * ========================================================= */
export async function clickAbsenceButton(column5Html, targetChildrenId) {
  const webview = getActiveWebview();
  if (!webview) return { success: false, error: "アクティブWebViewがありません" };

  try {
    const absenceId = extractAbsenceButtonId(column5Html);
    if (!absenceId) throw new Error("欠席ボタンID(absence_...)を抽出できませんでした");

    // ✅ 児童ID一致チェック（ここで違ってたら中断）
    assertAbsenceChildId(absenceId, targetChildrenId);

    console.log("🔘 [ATTENDANCE] 欠席モーダル表示 START", { absenceId, targetChildrenId });

    const script = `
      (function(){
        try {
          const id = ${JSON.stringify(absenceId)};
          const btn = document.getElementById(id);
          if (!btn) return { success:false, error:"欠席ボタンが見つかりません: " + id };

          btn.click();

          return new Promise((resolve) => {
            const start = Date.now();
            (function waitOpen(){
              const dialog = document.getElementById("addtend_dialog");
              const wrapper = dialog ? dialog.closest(".ui-dialog") : null;
              const isOpen = !!(wrapper && wrapper.style.display !== "none");

              if (isOpen) {
                resolve({ success:true, logInfo:"addtend_dialog opened", absenceId:id });
                return;
              }
              if (Date.now() - start > 2000) {
                resolve({ success:false, error:"addtend_dialog が開きませんでした", absenceId:id });
                return;
              }
              setTimeout(waitOpen, 100);
            })();
          });
        } catch(e) {
          return { success:false, error: e?.message || String(e) };
        }
      })();
    `;

    const result = await webview.executeJavaScript(script);

    if (result?.success) {
      console.log("✅ [ATTENDANCE] 欠席モーダル表示 OK:", result.logInfo);
      window.showSuccessToast?.("✅ 欠席モーダルを開きました", 2000);
      return { success: true, absenceId };
    }

    throw new Error(result?.error || "欠席モーダル表示に失敗しました");
  } catch (err) {
    console.error("❌ [ATTENDANCE] 欠席モーダル表示 NG:", err);
    window.showErrorToast?.(`❌ 欠席モーダル表示失敗\n${err.message}`, 3000);
    return { success: false, error: err.message };
  }
}


/* =========================================================
 * ★ 退室ボタン（もともと成功率高い）
 * ========================================================= */
export async function clickExitButton(column6Html) {
  let webview = null;

  if(!false){
    return;//一旦使用停止
  }

  try {
    console.log("🔘 [ATTENDANCE] 退室ボタン処理開始");
    webview = await useDedicatedTabAndNavigate();

    const onclickCode = extractExitButtonOnclick(column6Html);

    const script = buildWebviewClickExecutor({
      onclickCode,
      buttonText: "退室",
      extraSelector: "button[class*='exit']"
    });

    const result = await webview.executeJavaScript(script);

    if (result.success) {
      console.log("✅ 退室ボタンクリック成功:", result.logInfo);
      window.showSuccessToast?.("✅ 退室ボタンをクリックしました", 2000);
      return { success: true };
    }

    throw new Error(result.error);
  } catch (err) {
    console.error("❌ 退室ボタンクリックエラー:", err);
    window.showErrorToast?.(`❌ 退室ボタンクリック失敗\n${err.message}`, 3000);
    return { success: false, error: err.message };
  }
}
