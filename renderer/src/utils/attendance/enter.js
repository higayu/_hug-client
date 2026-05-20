// src/utils/attendance/enter.js

import { useDedicatedTabAndNavigate } from "./_shared/webview.js";

/**
 * column5Html から sendEnterMail(...) 呼び出し文字列を抽出
 */
function extractSendEnterMailCall(column5Html) {
  console.log("🧩 [ENTER] extractSendEnterMailCall input:", column5Html);

  if (!column5Html) {
    console.warn("⚠️ [ENTER] column5Html が空です");
    return null;
  }

  const html = String(column5Html);

  // onclick="sendEnterMail(...);"
  const m = html.match(/onclick\s*=\s*"([^"]*sendEnterMail\([^"]+\)[^"]*)"/i);
  if (m?.[1]) {
    const s = m[1].trim();
    console.log("🧩 [ENTER] onclick から抽出成功:", s);
    return s.endsWith(";") ? s : s + ";";
  }

  // fallback
  const m2 = html.match(/sendEnterMail\([\s\S]*?\)\s*;?/i);
  if (m2?.[0]) {
    const s = m2[0].trim();
    console.log("🧩 [ENTER] fallback 抽出成功:", s);
    return s.endsWith(";") ? s : s + ";";
  }

  console.warn("⚠️ [ENTER] sendEnterMail を抽出できませんでした");
  return null;
}

function parseSendEnterMailArgs(callStr) {
  console.log("🧩 [ENTER] parseSendEnterMailArgs input:", callStr);

  const m = String(callStr || "").match(/sendEnterMail\s*\(([\s\S]*?)\)\s*;?/i);
  if (!m) {
    console.warn("⚠️ [ENTER] 引数パース失敗");
    return null;
  }

  const args = m[1].split(",").map((x) => x.trim().replace(/^'|'$/g, ""));
  console.log("🧩 [ENTER] パース結果 args:", args);

  return args;
}

/**
 * 入室（sendEnterMail）を実行する
 */
export async function clickEnterButton(column5Html, targetChildrenId) {
  try {
    console.log("🔘 [ATTENDANCE] 入室処理 START");
    console.log("📥 [ATTENDANCE] targetChildrenId:", targetChildrenId);

    // 専用タブへ
    console.log("🧭 [ATTENDANCE] 専用タブへ遷移中...");
    const webview = await useDedicatedTabAndNavigate();
    console.log("🧭 [ATTENDANCE] 専用タブ取得 OK");

    // sendEnterMail 抽出
    const callStr = extractSendEnterMailCall(column5Html);
    if (!callStr) {
      throw new Error("sendEnterMail を抽出できませんでした");
    }

    console.log("📤 [ATTENDANCE] 実行予定 callStr:", callStr);

    // 引数チェック
    const args = parseSendEnterMailArgs(callStr);
    const cIdFromOnclick = String(args?.[2] ?? "");

    console.log("🔍 [ATTENDANCE] c_id 比較", {
      onclick: cIdFromOnclick,
      target: String(targetChildrenId),
    });

    if (cIdFromOnclick !== String(targetChildrenId)) {
      throw new Error(
        `児童ID不一致: onclick=${cIdFromOnclick}, target=${targetChildrenId}`
      );
    }

    // 実行
    console.log("🚪 [ATTENDANCE] sendEnterMail 実行開始");

    const result = await webview.executeJavaScript(`
      (function(){
        try {
          console.log("🧪 [WEBVIEW] sendEnterMail typeof:", typeof sendEnterMail);
          if (typeof sendEnterMail !== "function") {
            return { success:false, error:"sendEnterMail が未定義です" };
          }
          ${callStr}
          return { success:true };
        } catch(e) {
          return { success:false, error: e?.message || String(e) };
        }
      })();
    `);

    console.log("📬 [ATTENDANCE] executeJavaScript result:", result);

    if (result?.success) {
      console.log("✅ [ATTENDANCE] 入室実行 OK");
      window.showSuccessToast?.("✅ 入室処理を実行しました", 2000);
      return { success: true };
    }

    throw new Error(result?.error || "入室処理に失敗しました");
  } catch (err) {
    console.error("❌ [ATTENDANCE] 入室処理 NG");
    console.error("🧨 [ATTENDANCE] Error detail:", err);

    window.showErrorToast?.(`❌ 入室処理失敗\n${err.message}`, 3000);
    return { success: false, error: err.message };
  }
}
