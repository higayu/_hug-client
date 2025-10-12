// modules/childrenList.js
import { AppState,getWeekdayFromDate } from "./config.js";

export async function initChildrenList() {
  const settingsEl = document.getElementById("settings");

  // ✅ まずHTMLを読み込む
  const res = await fetch("settings.html");
  settingsEl.innerHTML = await res.text();

  // ✅ その後に要素を取得
  const weekdaySelect = settingsEl.querySelector("#weekdaySelect");
  const dateInput = settingsEl.querySelector("#dateSelect");
  const listEl = settingsEl.querySelector("#childrenList");

  if (!dateInput || !weekdaySelect || !listEl) {
    console.error("❌ settings.html の要素取得に失敗しました");
    return;
  }

  // 🌟 デフォルト日付を設定
  dateInput.value = AppState.DATE_STR;

  AppState.WEEK_DAY = AppState.WEEK_DAY || "月";

  async function loadChildren() {
    const data = await window.electronAPI.GetChildrenByStaffAndDay(AppState.STAFF_ID, AppState.WEEK_DAY);
    AppState.childrenData = data;
    renderList(data);
  }

  function renderList(children) {
    listEl.replaceChildren();

    if (!children || children.length === 0) {
      listEl.innerHTML = "<li>該当する子どもがいません</li>";
      return;
    }

    children.forEach((c, i) => {
      const li = document.createElement("li");
      li.textContent = `${c.child_id}: ${c.name}`;
      li.dataset.childId = c.child_id;
      li.style.cursor = "pointer";

      li.addEventListener("click", () => {
        AppState.SELECT_CHILD = c.child_id;
        AppState.SELECT_CHILD_NAME = c.name;
        listEl.querySelectorAll("li").forEach(li => li.classList.remove("active"));
        li.classList.add("active");
        console.log(`🎯 選択: ${AppState.SELECT_CHILD_NAME} (${AppState.SELECT_CHILD})`);
      });

      if (i === 0 && (!AppState.SELECT_CHILD || AppState.SELECT_CHILD === "")) {
        AppState.SELECT_CHILD = c.child_id;
        AppState.SELECT_CHILD_NAME = c.name;
        li.classList.add("active");
        console.log(`✨ 自動選択: ${AppState.SELECT_CHILD_NAME}`);
      }

      listEl.appendChild(li);
    });
  }

  // 🌟 曜日選択
  weekdaySelect.value = AppState.WEEK_DAY;
  weekdaySelect.addEventListener("change", async () => {
    AppState.WEEK_DAY = weekdaySelect.value;
    AppState.SELECT_CHILD = "";
    AppState.SELECT_CHILD_NAME = "";
    await loadChildren();
  });

  // 🌟 日付選択
  dateInput.addEventListener("change", async () => {
    AppState.DATE_STR = dateInput.value;
    console.log("📅 日付変更:", AppState.DATE_STR);
    // AppState.WEEK_DAY = getWeekdayFromDate()
    // weekdaySelect.value = AppState.WEEK_DAY; // 表示も更新
    // await loadChildren();
  });

  await loadChildren();
  console.log("✅ 子ども一覧 初期化完了");
}
