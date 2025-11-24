// renderer/src/utils/noteUtils.js

/**
 * 一時メモを保存する
 */
export async function saveTempNote(childId, memo1, memo2, appState) {
  console.group("📝 saveTempNote() 呼び出し");
  console.log("📌 childId:", childId);
  console.log("📌 memo1:", memo1);
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
      memo1: memo1 || "",
      memo2: memo2 || "",
    };

    console.log("📤 送信データ(saveTempNote):", data);

    const result = await window.electronAPI.saveTempNote(data);

    console.log("📥 受信結果(saveTempNote):", result);

    if (result?.success) {
      console.log("✅ TEMP_NOTE 保存成功");
    } else {
      console.error("❌ TEMP_NOTE 保存失敗", result?.error);
    }
  } catch (error) {
    console.error("❌ 一時メモ保存エラー(saveTempNote):", error);
  }

  console.groupEnd();
}


/**
 * 一時メモを読み込む
 */
export function loadTempNote(childId, proxy, appState) {
  console.group("📄 loadTempNote() 呼び出し");
  console.log("📌 childId:", childId);
  console.log("📌 proxy:", proxy);
  console.log("📌 appState:", appState);

  if (!childId || !appState?.STAFF_ID || !appState?.WEEK_DAY) {
    console.error("❌ [noteUtils] 必須パラメータ不足");
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

        // 🔥 ここを修正！！ note.memo は存在しない
        proxy.value = {
          memo1: note.memo1 || "",
          memo2: note.memo2 || "",
        };

        console.log("✅ TEMP_NOTE 読込成功");
      } else {
        proxy.value = { memo1: "", memo2: "" };
        console.log("ℹ️ TEMP_NOTE なし");
      }
    })
    .catch((error) => {
      console.error("❌ TEMP_NOTE 読込失敗:", error);
      proxy.value = { memo1: "", memo2: "" };
    });

  console.groupEnd();
}
