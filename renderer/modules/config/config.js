// modules/config/config.js
import { loadIni } from "./ini.js";
import { updateButtonVisibility } from "../actions/hugActions.js";
import { ELEMENT_IDS, MESSAGES, WEEKDAYS, DEFAULT_APP_STATE } from "./const.js";

export const AppState = { ...DEFAULT_APP_STATE };

// ...既存の AppState 定義などのあとに追記
export function getWeekdayFromDate(dateStr) {
  // 例: dateStr = "2025-10-11"
  const date = new Date(dateStr);
  return WEEKDAYS[date.getDay()];
}

function getTodayWeekday(offset = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return WEEKDAYS[date.getDay()];
}

export function getDateString(offset = 0) {
  const today = new Date();
  today.setDate(today.getDate() + offset);
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, "0");
  const d = String(today.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// ==========================
// 💾 config.json保存
// ==========================
export async function saveConfig() {
  try {
    const data = {
      HUG_USERNAME: AppState.HUG_USERNAME,
      HUG_PASSWORD: AppState.HUG_PASSWORD,
      VITE_API_BASE_URL: AppState.VITE_API_BASE_URL,
      STAFF_ID: AppState.STAFF_ID,
      FACILITY_ID: AppState.FACILITY_ID
    };

    const result = await window.electronAPI.saveConfig(data);
    if (!result.success) {
      console.error("❌ config.json保存エラー:", result.error);
      return false;
    }

    console.log(MESSAGES.SUCCESS.CONFIG_SAVED);
    return true;
  } catch (err) {
    console.error(MESSAGES.ERROR.CONFIG_SAVE, err);
    return false;
  }
}

// ==========================
// ⚙️ config.json読み込み
// ==========================
export async function loadConfig() {
  const output = document.getElementById(ELEMENT_IDS.CONFIG_OUTPUT);
  try {
    console.log("🔄 [CONFIG] config.json読み込み開始");
    const result = await window.electronAPI.readConfig();
    console.log("🔍 [CONFIG] readConfig結果:", result);
    
    if (!result.success) {
      console.error("❌ [CONFIG] 読み込みエラー:", result.error);
      if (output) output.textContent = "❌ 読み込みエラー: " + result.error;
      return false;
    }

    const data = result.data;
    console.log("🔍 [CONFIG] 読み込んだデータ:", data);
    
    Object.assign(AppState, data);
    console.log("🔍 [CONFIG] AppStateにマージ後:", AppState);

    // 自動で日付と曜日を設定
    AppState.DATE_STR = getDateString();
    AppState.WEEK_DAY = getTodayWeekday();

    console.log("✅ [CONFIG] config.json読み込み成功:", AppState);
    if (output) output.textContent = JSON.stringify(data, null, 2);
    return true;
  } catch (err) {
    console.error("❌ [CONFIG] config.json読み込みエラー:", err);
    if (output) output.textContent = "❌ エラー: " + err.message;
    return false;
  }
}