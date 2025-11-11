// src/utils/noteUtils.js
// 一時メモの保存・読み込みユーティリティ

import { MESSAGES } from "./constants.js";

/**
 * 一時メモを保存する
 * @param {string} childId - 子どもID
 * @param {string} memo - メモ内容
 * @param {object} appState - アプリ状態（STAFF_ID, WEEK_DAY, DATE_STR を含む）
 */
export async function saveTempNote(childId, memo, appState) {
  if (!childId || !appState?.STAFF_ID || !appState?.WEEK_DAY) {
    console.error("❌ [noteUtils] 必須パラメータが不足しています");
    return;
  }

  try {
    const data = {
      children_id: childId,
      staff_id: appState.STAFF_ID,
      date_str: appState.DATE_STR || "",
      week_day: appState.WEEK_DAY,
      memo: memo || "",
    };

    const result = await window.electronAPI.saveTempNote(data);
    
    if (result?.success) {
      console.log(MESSAGES.SUCCESS.TEMP_NOTE_SAVED);
    } else {
      console.error(MESSAGES.ERROR.TEMP_NOTE_SAVE, result?.error);
    }
  } catch (error) {
    console.error(MESSAGES.ERROR.TEMP_NOTE_SAVE, error);
  }
}

/**
 * 一時メモを読み込む
 * @param {string} childId - 子どもID
 * @param {HTMLTextAreaElement} memoTextarea - メモ入力要素
 * @param {object} appState - アプリ状態（STAFF_ID, WEEK_DAY を含む）
 */
export function loadTempNote(childId, memoTextarea, appState) {
  if (!childId || !appState?.STAFF_ID || !appState?.WEEK_DAY) {
    console.error("❌ [noteUtils] 必須パラメータが不足しています");
    return;
  }

  if (!memoTextarea) {
    console.error("❌ [noteUtils] 入力要素が取得できません");
    return;
  }

  const data = {
    children_id: childId,
    staff_id: appState.STAFF_ID,
    week_day: appState.WEEK_DAY,
  };

  window.electronAPI
    .getTempNote(data)
    .then((result) => {
      if (result?.success && result?.data) {
        const note = result.data;
        memoTextarea.value = note.memo || "";
        console.log(MESSAGES.SUCCESS.TEMP_NOTE_LOADED);
      } else {
        // データがない場合は空にする
        memoTextarea.value = "";
        console.log(MESSAGES.INFO.TEMP_NOTE_NONE);
      }
    })
    .catch((error) => {
      console.error(MESSAGES.ERROR.TEMP_NOTE_LOAD, error);
      // エラー時も空にする
      memoTextarea.value = "";
    });
}

