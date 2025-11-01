// sidebar/sidebar.js
// サイドバー機能のJavaScript

import { AppState, getWeekdayFromDate } from "../modules/config/config.js";
import { showInfoToast } from "../modules/ui/toast/toast.js";

/**
 * サイドバーを初期化する
 */
export function initSidebar() {
  console.log("🔄 サイドバーを初期化中...");
  
  // 日付選択のイベントリスナー
  const dateInput = document.querySelector("#dateSelect");
  if (dateInput) {
    dateInput.addEventListener("change", handleDateChange);
    console.log("✅ 日付選択のイベントリスナーを設定");
  }

  // 曜日選択のイベントリスナー
  const weekdaySelect = document.querySelector("#weekdaySelect");
  if (weekdaySelect) {
    weekdaySelect.addEventListener("change", handleWeekdayChange);
    console.log("✅ 曜日選択のイベントリスナーを設定");
  }

  console.log("✅ サイドバーの初期化完了");
}

/**
 * 日付変更時の処理
 * @param {Event} event - イベントオブジェクト
 */
function handleDateChange(event) {
  const selectedDate = event.target.value;
  console.log("📅 日付が変更されました:", selectedDate);
  
  if (selectedDate) {
    AppState.DATE_STR = selectedDate;
    const weekday = getWeekdayFromDate(selectedDate);
    AppState.WEEK_DAY = weekday;
    
    // 曜日選択も更新
    const weekdaySelect = document.querySelector("#weekdaySelect");
    if (weekdaySelect) {
      weekdaySelect.value = weekday;
    }
    
    showInfoToast(`📅 日付を ${selectedDate} (${weekday}) に設定しました`);
    console.log("✅ 日付と曜日を更新:", { date: selectedDate, weekday });
  }
}

/**
 * 曜日変更時の処理
 * @param {Event} event - イベントオブジェクト
 */
function handleWeekdayChange(event) {
  const selectedWeekday = event.target.value;
  console.log("📅 曜日が変更されました:", selectedWeekday);
  
  AppState.WEEK_DAY = selectedWeekday;
  showInfoToast(`📅 曜日を ${selectedWeekday} に設定しました`);
  console.log("✅ 曜日を更新:", selectedWeekday);
}

/**
 * サイドバーの値を更新する
 * @param {string} dateStr - 日付文字列
 * @param {string} weekday - 曜日
 */
export function updateSidebarValues(dateStr, weekday) {
  const dateInput = document.querySelector("#dateSelect");
  const weekdaySelect = document.querySelector("#weekdaySelect");
  
  if (dateInput && dateStr) {
    dateInput.value = dateStr;
  }
  
  if (weekdaySelect && weekday) {
    weekdaySelect.value = weekday;
  }
  
  console.log("✅ サイドバーの値を更新:", { dateStr, weekday });
}

/**
 * サイドバーの状態を取得する
 * @returns {Object} サイドバーの現在の状態
 */
export function getSidebarState() {
  const dateInput = document.querySelector("#dateSelect");
  const weekdaySelect = document.querySelector("#weekdaySelect");
  
  return {
    date: dateInput ? dateInput.value : AppState.DATE_STR,
    weekday: weekdaySelect ? weekdaySelect.value : AppState.WEEK_DAY
  };
}

/**
 * サイドバーの開閉機能を設定する
 * メインウィンドウのサイドバー表示/非表示を制御
 */
export function setupSidebar() {
  const settingsEl = document.getElementById("settings");
  const menuToggle = document.getElementById("menuToggle");
  const hugview = document.getElementById("hugview");

  if (!settingsEl || !menuToggle || !hugview) {
    console.warn("⚠️ サイドバー要素が見つかりません");
    return;
  }

  menuToggle.addEventListener("click", () => {
    const isOpen = settingsEl.classList.toggle("open");
    console.log(isOpen ? "📂 サイドバーを開いた" : "📁 サイドバーを閉じた");
  });

  document.addEventListener("click", (e) => {
    if (
      settingsEl.classList.contains("open") &&
      !settingsEl.contains(e.target) &&
      !menuToggle.contains(e.target)
    ) {
      settingsEl.classList.remove("open");
      console.log("📁 サイドバーを閉じました（外側クリック）");
    }
  });

  console.log("✅ サイドバーの開閉機能を設定しました");
}
