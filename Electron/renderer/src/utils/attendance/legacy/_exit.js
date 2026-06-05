// src/utils/attendance/exit.js

import { useDedicatedTabAndNavigate } from "./_webview.js";

/**
 * column6Html から sendLeaveMail(...) 呼び出し文字列を抽出
 */
function extractSendLeaveMailCall(column6Html) {
  console.log("🧩 [EXIT] extractSendLeaveMailCall input:", column6Html);

  if (!column6Html) {
    console.warn("⚠️ [EXIT] column6Html が空です");
    return null;
  }

  const html = String(column6Html);

  // onclick="sendLeaveMail(...);"
  const m = html.match(/onclick\s*=\s*"([^"]*sendLeaveMail\([^"]+\)[^"]*)"/i);
  if (m?.[1]) {
    const s = m[1].trim();
    console.log("🧩 [EXIT] onclick から抽出成功:", s);
    return s.endsWith(";") ? s : s + ";";
  }

  // fallback
  const m2 = html.match(/sendLeaveMail\([\s\S]*?\)\s*;?/i);
  if (m2?.[0]) {
    const s = m2[0].trim();
    console.log("🧩 [EXIT] fallback 抽出成功:", s);
    return s.endsWith(";") ? s : s + ";";
  }

  console.warn("⚠️ [EXIT] sendLeaveMail を抽出できませんでした");
  return null;
}

function parseSendLeaveMailArgs(callStr) {
  console.log("🧩 [EXIT] parseSendLeaveMailArgs input:", callStr);

  const m = String(callStr || "").match(/sendLeaveMail\s*\(([\s\S]*?)\)\s*;?/i);
  if (!m) {
    console.warn("⚠️ [EXIT] 引数パース失敗");
    return null;
  }

  const args = m[1].split(",").map((x) => x.trim().replace(/^'|'$/g, ""));
  console.log("🧩 [EXIT] パース結果 args:", args);
  return args;
}

/**
 * 退室（sendLeaveMail）を実行する
 */
export async function clickExitButton(column6Html, targetChildrenId) {
  try {
    console.log("🔘 [ATTENDANCE] 退室処理 START");
    console.log("📥 [ATTENDANCE] targetChildrenId:", targetChildrenId);

    // 専用タブへ
    console.log("🧭 [ATTENDANCE] 専用タブへ遷移中...");
    const webview = await useDedicatedTabAndNavigate();
    console.log("🧭 [ATTENDANCE] 専用タブ取得 OK");

    // sendLeaveMail 抽出
    const callStr = extractSendLeaveMailCall(column6Html);
    if (!callStr) {
      throw new Error("sendLeaveMail を抽出できませんでした");
    }

    console.log("📤 [ATTENDANCE] 実行予定 callStr:", callStr);

    // 引数チェック
    const args = parseSendLeaveMailArgs(callStr);
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
    console.log("🚪 [ATTENDANCE] sendLeaveMail 実行開始");

    const result = await webview.executeJavaScript(`
      (function(){
        try {
          console.log("🧪 [WEBVIEW] sendLeaveMail typeof:", typeof sendLeaveMail);
          if (typeof sendLeaveMail !== "function") {
            return { success:false, error:"sendLeaveMail が未定義です" };
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
      console.log("✅ [ATTENDANCE] 退室実行 OK");
      window.showSuccessToast?.("✅ 退室処理を実行しました", 2000);
      return { success: true };
    }

    throw new Error(result?.error || "退室処理に失敗しました");
  } catch (err) {
    console.error("❌ [ATTENDANCE] 退室処理 NG");
    console.error("🧨 [ATTENDANCE] Error detail:", err);

    window.showErrorToast?.(`❌ 退室処理失敗\n${err.message}`, 3000);
    return { success: false, error: err.message };
  }
}
