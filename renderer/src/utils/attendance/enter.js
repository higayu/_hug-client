// src/utils/attendance/enter.js

import { useDedicatedTabAndNavigate } from "./_shared/webview.js";

/**
 * column5Html から sendEnterMail(...) 呼び出し文字列を抽出
 * - onclick="sendEnterMail(...);" から取る
 * - fallback で本文から sendEnterMail(...) を直取り
 */
function extractSendEnterMailCall(column5Html) {
  if (!column5Html) return null;

  const html = String(column5Html);

  // onclick="sendEnterMail(...);"
  const m = html.match(/onclick\s*=\s*"([^"]*sendEnterMail\([^"]+\)[^"]*)"/i);
  if (m?.[1]) {
    const s = m[1].trim();
    return s.endsWith(";") ? s : s + ";";
  }

  // fallback: HTML内の sendEnterMail(...) を直取り
  const m2 = html.match(/sendEnterMail\([\s\S]*?\)\s*;?/i);
  if (m2?.[0]) {
    const s = m2[0].trim();
    return s.endsWith(";") ? s : s + ";";
  }

  return null;
}

function parseSendEnterMailArgs(callStr) {
  const m = String(callStr || "").match(/sendEnterMail\s*\(([\s\S]*?)\)\s*;?/i);
  if (!m) return null;

  // この引数構造（数値/文字列）なら単純splitでOK
  return m[1].split(",").map((x) => x.trim().replace(/^'|'$/g, ""));
}

/**
 * 入室（sendEnterMail）を実行する（モーダル無し）
 * - targetChildrenId は第3引数（c_id）一致チェックに使用
 */
export async function clickEnterButton(column5Html, targetChildrenId) {
  try {
    console.log("🔘 [ATTENDANCE] 入室処理 START", { targetChildrenId });

    // ✅ 成功率を揃えるため、専用タブに遷移してから実行
    const webview = await useDedicatedTabAndNavigate();

    const callStr = extractSendEnterMailCall(column5Html);
    if (!callStr) throw new Error("sendEnterMail を抽出できませんでした");

    // ✅ 第3引数（c_id）が一致するか確認
    const args = parseSendEnterMailArgs(callStr);
    const cIdFromOnclick = String(args?.[2] ?? "");
    if (cIdFromOnclick !== String(targetChildrenId)) {
      throw new Error(
        `児童ID不一致: onclick=${cIdFromOnclick}, target=${targetChildrenId}`
      );
    }

    console.log("🚪 [ATTENDANCE] sendEnterMail 実行:", { callStr });

    const result = await webview.executeJavaScript(`
      (function(){
        try {
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

    if (result?.success) {
      console.log("✅ [ATTENDANCE] 入室実行 OK");
      window.showSuccessToast?.("✅ 入室処理を実行しました", 2000);
      return { success: true };
    }

    throw new Error(result?.error || "入室処理に失敗しました");
  } catch (err) {
    console.error("❌ [ATTENDANCE] 入室処理 NG:", err);
    window.showErrorToast?.(`❌ 入室処理失敗\n${err.message}`, 3000);
    return { success: false, error: err.message };
  }
}
