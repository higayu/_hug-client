// renderer/src/utils/noteUtils.js
// renderer/src/utils/noteUtils.js

const WEEKDAY_MAP = {
  日: 7,
  月: 1,
  火: 2,
  水: 3,
  木: 4,
  金: 5,
  土: 6,
};

/**
 * 一時メモを保存する
 */
export async function saveTempNote(childId, memo1, memo2, appState) {
  console.group("📝 saveTempNote() 呼び出し");

  try {
    console.log("📌 childId:", childId);
    console.log("📌 memo1:", memo1);
    console.log("📌 memo2:", memo2);
    console.log("📌 appState:", appState);

    if (!childId || !appState?.STAFF_ID || !appState?.WEEK_DAY) {
      throw new Error("必須パラメータ不足");
    }

    const weekDayNumber = WEEKDAY_MAP[appState.WEEK_DAY];

    if (!weekDayNumber) {
      throw new Error("曜日変換失敗");
    }

    const data = {
      children_id: childId,
      staff_id: appState.STAFF_ID,
      day_of_week_id: weekDayNumber,
      memo1: memo1 ?? "",
      memo2: memo2 ?? "",
    };

    console.log("📤 送信データ(saveTempNote):", data);

    const result = await window.electronAPI.saveTempNote(data);

    console.log("📥 受信結果(saveTempNote):", result);

    if (result?.success) {
      console.log("✅ TEMP_NOTE 保存成功");
      return true;
    }

    throw new Error(result?.error || "保存失敗");
  } catch (error) {
    console.error("❌ 一時メモ保存エラー(saveTempNote):", error);
    return false;
  } finally {
    console.groupEnd();
  }
}

/**
 * 一時メモを読み込む
 */
export async function loadTempNote(childId, proxy, appState) {
  console.group("📄 loadTempNote() 呼び出し");

  try {
    console.log("📌 childId:", childId);
    console.log("📌 proxy:", proxy);
    console.log("📌 appState:", appState);

    if (!childId || !appState?.STAFF_ID || !appState?.WEEK_DAY) {
      throw new Error("必須パラメータ不足");
    }

    const weekDayNumber = WEEKDAY_MAP[appState.WEEK_DAY];

    if (!weekDayNumber) {
      throw new Error("曜日変換失敗");
    }

    const data = {
      children_id: childId,
      staff_id: appState.STAFF_ID,
      day_of_week_id: weekDayNumber,
    };

    console.log("📤 送信データ(getTempNote):", data);

    const result = await window.electronAPI.getTempNote(data);

    console.log("📥 受信結果(getTempNote):", result);

    if (result?.success && result?.data) {
      proxy.value = {
        memo1: result.data.memo1 ?? "",
        memo2: result.data.memo2 ?? "",
      };
      console.log("✅ TEMP_NOTE 読込成功");
      return true;
    }

    proxy.value = { memo1: "", memo2: "" };
    console.log("ℹ️ TEMP_NOTE なし");
    return false;
  } catch (error) {
    console.error("❌ TEMP_NOTE 読込失敗:", error);
    proxy.value = { memo1: "", memo2: "" };
    return false;
  } finally {
    console.groupEnd();
  }
}
