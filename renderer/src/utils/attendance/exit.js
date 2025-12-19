// src/utils/attendance/exit.js

import { useDedicatedTabAndNavigate } from "./_shared/webview.js";

/**
 * column6Html から sendLeaveMail(...) 呼び出し文字列を抽出
 * - onclick="sendLeaveMail(...);"
 * - fallback で本文から sendLeaveMail(...) を直取り
 */
function extractSendLeaveMailCall(column6Html) {
  if (!column6Html) return null;

  const html = String(column6Html);

  // onclick="sendLeaveMail(...);"
  const m = html.match(/onclick\s*=\s*"([^"]*sendLeaveMail\([^"]+\)[^"]*)"/i);
  if (m?.[1]) {
    const s = m[1].trim();
    return s.endsWith(";") ? s : s + ";";
  }

  // fallback: HTML内の sendLeaveMail(...) を直取り
  const m2 = html.match(/sendLeaveMail\([\s\S]*?\)\s*;?/i);
  if (m2?.[0]) {
    const s = m2[0].trim();
    return s.endsWith(";") ? s : s + ";";
  }

  return null;
}

function parseSendLeaveMailArgs(callStr) {
  const m = String(callStr || "").match(/sendLeaveMail\s*\(([\s\S]*?)\)\s*;?/i);
  if (!m) return null;
  return m[1].split(",").map((x) => x.trim().replace(/^'|'$/g, ""));
}

/**
 * 退室（sendLeaveMail）を実行する（モーダル無し）
 * - targetChildrenId は第3引数（c_id）一致チェックに使用
 */
export async function clickExitButton(column6Html, targetChildrenId) {
  try {
    console.log("🔘 [ATTENDANCE] 退室処理 START", { targetChildrenId });

    // ✅ 成功率を揃えるため、専用タブに遷移してから実行
    const webview = await useDedicatedTabAndNavigate();

    const callStr = extractSendLeaveMailCall(column6Html);
    
    if (!callStr) throw new Error("sendLeaveMail を抽出できませんでした");

    // ✅ 第3引数（c_id）が一致するか確認
    const args = parseSendLeaveMailArgs(callStr);
    const cIdFromOnclick = String(args?.[2] ?? "");
    if (cIdFromOnclick !== String(targetChildrenId)) {
      throw new Error(
        `児童ID不一致: onclick=${cIdFromOnclick}, target=${targetChildrenId}`
      );
    }

    console.log("🚪 [ATTENDANCE] sendLeaveMail 実行:", { callStr });

    const result = await webview.executeJavaScript(`
      (function(){
        try {
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

    if (result?.success) {
      console.log("✅ [ATTENDANCE] 退室実行 OK");
      window.showSuccessToast?.("✅ 退室処理を実行しました", 2000);
      return { success: true };
    }

    throw new Error(result?.error || "退室処理に失敗しました");
  } catch (err) {
    console.error("❌ [ATTENDANCE] 退室処理 NG:", err);
    window.showErrorToast?.(`❌ 退室処理失敗\n${err.message}`, 3000);
    return { success: false, error: err.message };
  }
}
