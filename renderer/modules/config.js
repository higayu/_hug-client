// modules/config.js
import { loadIni } from "./ini.js";
import { updateButtonVisibility } from "./hugActions.js";

export const AppState = {
  HUG_USERNAME: "",
  HUG_PASSWORD: "",
  STAFF_ID: "",
  FACILITY_ID: "",
  DATE_STR: "",
  WEEK_DAY: "",
  SELECT_CHILD: "",
  SELECT_CHILD_NAME: "",
  childrenData: [],
  closeButtonsVisible:true,
  STAFF_DATA: [],
  FACILITY_DATA: [],
  STAFF_AND_FACILITY_DATA: [],
};

// ...既存の AppState 定義などのあとに追記
export function getWeekdayFromDate(dateStr) {
  // 例: dateStr = "2025-10-11"
  const date = new Date(dateStr);
  const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
  return weekdays[date.getDay()];
}

function getTodayWeekday(offset = 0) {
  const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return weekdays[date.getDay()];
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

    console.log("✅ config.json保存成功");
    return true;
  } catch (err) {
    console.error("❌ config.json保存中にエラー:", err);
    return false;
  }
}

// ==========================
// ⚙️ config.json読み込み
// ==========================
export async function loadConfig() {
  const output = document.getElementById("configOutput");
  try {
    const result = await window.electronAPI.readConfig();
    if (!result.success) {
      output.textContent = "❌ 読み込みエラー: " + result.error;
      return false;
    }

    const data = result.data;
    Object.assign(AppState, data);

    // 自動で日付と曜日を設定
    AppState.DATE_STR = getDateString();
    AppState.WEEK_DAY = getTodayWeekday();

    console.log("✅ config.json 読み込み成功:", AppState);
    if (output) output.textContent = JSON.stringify(data, null, 2);
    return true;
  } catch (err) {
    console.error("❌ config.json 読み込み中にエラー:", err);
    if (output) output.textContent = "❌ エラー: " + err.message;
    return false;
  }
}