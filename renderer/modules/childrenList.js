// modules/childrenList.js
import { AppState } from "./config.js";

export async function initChildrenList() {
  const settingsEl = document.getElementById("settings");
  const res = await fetch("settings.html");
  settingsEl.innerHTML = await res.text();

  const weekdaySelect = settingsEl.querySelector("#weekdaySelect");
  const listEl = settingsEl.querySelector("#childrenList");

  AppState.WEEK_DAY = AppState.WEEK_DAY || "月";

  async function loadChildren() {
    const data = await window.electronAPI.GetChildrenByStaffAndDay(AppState.STAFF_ID, AppState.WEEK_DAY);
    AppState.childrenData = data;
    renderList(data);
  }

    function renderList(children) {
    // 🔁 まずリストを完全リセット
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

        // ✅ クリックで選択更新
        li.addEventListener("click", () => {
        AppState.SELECT_CHILD = c.child_id;
        AppState.SELECT_CHILD_NAME = c.name;
        // 全アイテムから .active 削除
        listEl.querySelectorAll("li").forEach(li => li.classList.remove("active"));
        // 現在クリックした要素に付与
        li.classList.add("active");
        console.log(`🎯 選択: ${AppState.SELECT_CHILD_NAME} (${AppState.SELECT_CHILD})`);
        });

        // ✅ 初回または子ども未選択時 → 自動選択
        if (i === 0 && (!AppState.SELECT_CHILD || AppState.SELECT_CHILD === "")) {
        AppState.SELECT_CHILD = c.child_id;
        AppState.SELECT_CHILD_NAME = c.name;
        li.classList.add("active");
        console.log(`✨ 自動選択: ${AppState.SELECT_CHILD_NAME}`);
        }

        listEl.appendChild(li);
    });
    }


    weekdaySelect.value = AppState.WEEK_DAY;

    // ===== 曜日変更イベント部分 =====  //曜日変更
    weekdaySelect.addEventListener("change", async () => {
        AppState.WEEK_DAY = weekdaySelect.value;
        AppState.SELECT_CHILD = ""; // ✅ ← 選択をリセット
        AppState.SELECT_CHILD_NAME = "";
        await loadChildren();
    });

  await loadChildren();
  console.log("✅ 子ども一覧 初期化完了");
}
