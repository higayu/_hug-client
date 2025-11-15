// renderer/src/utils/noteUtils.js
// 一時メモの保存・読み込みユーティリティ

import { MESSAGES } from "./constants.js";

/**
 * 一時メモを保存する
 */
export async function saveTempNote(childId, memo, memo2, appState) {
  console.group("📝 saveTempNote() 呼び出し");
  console.log("📌 childId:", childId);
  console.log("📌 memo:", memo);
  console.log("📌 memo2:", memo2);
  console.log("📌 appState:", appState);

  if (!childId || !appState?.STAFF_ID || !appState?.WEEK_DAY) {
    console.error("❌ [noteUtils] 必須パラメータが不足しています");
    console.groupEnd();
    return;
  }

  try {
    const data = {
      children_id: childId,
      staff_id: appState.STAFF_ID,
      week_day: appState.WEEK_DAY,
      memo: memo || "",
      memo2:memo2 || "",
    };

    console.log("📤 送信データ(saveTempNote):", data);

    const result = await window.electronAPI.saveTempNote(data);

    console.log("📥 受信結果(saveTempNote):", result);

    if (result?.success) {
      console.log("✅", MESSAGES.SUCCESS.TEMP_NOTE_SAVED);
    } else {
      console.error("❌", MESSAGES.ERROR.TEMP_NOTE_SAVE, result?.error);
    }
  } catch (error) {
    console.error("❌ 一時メモ保存エラー(saveTempNote):", error);
  }

  console.groupEnd();
}

/**
 * 一時メモを読み込む
 */
export function loadTempNote(childId, memoTextarea, appState) {
  console.group("📄 loadTempNote() 呼び出し");
  console.log("📌 childId:", childId);
  console.log("📌 appState:", appState);
  console.log("📌 memoTextarea:", memoTextarea);

  if (!childId || !appState?.STAFF_ID || !appState?.WEEK_DAY) {
    console.error("❌ [noteUtils] 必須パラメータが不足しています");
    console.groupEnd();
    return;
  }

  if (!memoTextarea) {
    console.error("❌ [noteUtils] 入力要素が取得できません");
    console.groupEnd();
    return;
  }

  const data = {
    children_id: childId,
    staff_id: appState.STAFF_ID,
    week_day: appState.WEEK_DAY,
  };

  console.log("📤 送信データ(getTempNote):", data);

  window.electronAPI
    .getTempNote(data)
    .then((result) => {
      console.log("📥 受信結果(getTempNote):", result);

      if (result?.success && result?.data) {
        const note = result.data;
        memoTextarea.value = note.memo || "";
        console.log("✅", MESSAGES.SUCCESS.TEMP_NOTE_LOADED);
      } else {
        memoTextarea.value = "";
        console.log("ℹ️", MESSAGES.INFO.TEMP_NOTE_NONE);
      }
    })
    .catch((error) => {
      console.error("❌ 一時メモ読み込みエラー(loadTempNote):", error);
      memoTextarea.value = "";
    });

  console.groupEnd();
}
