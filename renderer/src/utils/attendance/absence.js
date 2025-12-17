// src/utils/attendance/absence.js

import { useDedicatedTabAndNavigate } from "./_shared/webview.js";
import { extractAbsenceButtonId, assertAbsenceChildId } from "./_shared/extractors.js";

/**
 * 欠席ボタン → モーダル表示まで（児童ID一致チェック付き）
 */
export async function clickAbsenceButton(column5Html, targetChildrenId) {
  try {
    console.log("🔘 [ATTENDANCE] 欠席モーダル表示 START", { targetChildrenId });

    // ✅ 入室/退室と同じく「専用タブへ遷移」して成功率を揃える
    const webview = await useDedicatedTabAndNavigate();

    const absenceId = extractAbsenceButtonId(column5Html);
    if (!absenceId) throw new Error("欠席ボタンID(absence_...)を抽出できませんでした");

    assertAbsenceChildId(absenceId, targetChildrenId);

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
