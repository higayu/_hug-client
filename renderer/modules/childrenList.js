// modules/childrenList.js
import { AppState,getWeekdayFromDate } from "./config.js";
import { initSidebar, updateSidebarValues } from "../sidebar/sidebar.js";

export async function initChildrenList() {
  const settingsEl = document.getElementById("settings");

  // ✅ まずHTMLを読み込む
  const res = await fetch("sidebar/sidebar.html");
  settingsEl.innerHTML = await res.text();

  // ✅ その後に要素を取得
  const weekdaySelect = settingsEl.querySelector("#weekdaySelect");
  const dateInput = settingsEl.querySelector("#dateSelect");
  const listEl = settingsEl.querySelector("#childrenList");

  if (!dateInput || !weekdaySelect || !listEl) {
    console.error("❌ sidebar.html の要素取得に失敗しました");
    return;
  }

  // 🌟 デフォルト日付を設定
  AppState.WEEK_DAY = AppState.WEEK_DAY || "月";
  
  // サイドバーを初期化
  initSidebar();
  
  // サイドバーの値を更新
  updateSidebarValues(AppState.DATE_STR, AppState.WEEK_DAY);

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
      li.textContent = `${c.children_id}: ${c.name}`;
      li.dataset.childId = c.children_id;
      li.style.cursor = "pointer";

      // 左クリックで選択
      li.addEventListener("click", () => {
        AppState.SELECT_CHILD = c.children_id;
        AppState.SELECT_CHILD_NAME = c.name;
        listEl.querySelectorAll("li").forEach(li => li.classList.remove("active"));
        li.classList.add("active");
        console.log(`🎯 選択: ${AppState.SELECT_CHILD_NAME} (${AppState.SELECT_CHILD})`);
      });

      // 右クリックでnotes表示/非表示
      li.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        
        // 既存のnotes表示をチェック
        let notesDiv = li.querySelector('.notes-display');
        
        if (notesDiv) {
          // 既に表示されている場合は非表示
          notesDiv.remove();
        } else {
          // notesを表示
          notesDiv = document.createElement("div");
          notesDiv.className = "notes-display";
          
          // 時間入力コンテナを作成
          const timeInputContainer = document.createElement("div");
          timeInputContainer.className = "time-input-container";
          
          // 時間入力グループ（横並び）
          const timeGroup = document.createElement("div");
          timeGroup.className = "time-group";
          
          // 入室時間入力
          const enterTimeLabel = document.createElement("label");
          enterTimeLabel.textContent = "入室:";
          enterTimeLabel.className = "time-label";
          
          const enterTimeInput = document.createElement("input");
          enterTimeInput.type = "time";
          enterTimeInput.className = "time-input";
          enterTimeInput.id = `enter-${c.children_id}`;
          
          // 退出時間入力
          const exitTimeLabel = document.createElement("label");
          exitTimeLabel.textContent = "退出:";
          exitTimeLabel.className = "time-label";
          
          const exitTimeInput = document.createElement("input");
          exitTimeInput.type = "time";
          exitTimeInput.className = "time-input";
          exitTimeInput.id = `exit-${c.children_id}`;
          
          // 時間グループに追加
          timeGroup.appendChild(enterTimeLabel);
          timeGroup.appendChild(enterTimeInput);
          timeGroup.appendChild(exitTimeLabel);
          timeGroup.appendChild(exitTimeInput);
          
          // メモ入力テキストエリア
          const memoLabel = document.createElement("label");
          memoLabel.textContent = "メモ:";
          memoLabel.className = "memo-label";
          
          const memoTextarea = document.createElement("textarea");
          memoTextarea.className = "memo-textarea";
          memoTextarea.id = `memo-${c.children_id}`;
          memoTextarea.placeholder = "一時的なメモを入力してください...";
          memoTextarea.rows = 3;
          
          // 保存ボタン
          const saveButton = document.createElement("button");
          saveButton.textContent = "保存";
          saveButton.className = "save-button";
          
          // 既存の一時メモを読み込み
          loadTempNote(c.children_id, enterTimeInput, exitTimeInput, memoTextarea);
          
          // 保存ボタンのイベント
          saveButton.addEventListener("click", async () => {
            await saveTempNote(c.children_id, enterTimeInput.value, exitTimeInput.value, memoTextarea.value);
          });
          
          // 時間入力の変更時に自動保存
          enterTimeInput.addEventListener("change", async () => {
            await saveTempNote(c.children_id, enterTimeInput.value, exitTimeInput.value, memoTextarea.value);
          });
          
          exitTimeInput.addEventListener("change", async () => {
            await saveTempNote(c.children_id, enterTimeInput.value, exitTimeInput.value, memoTextarea.value);
          });
          
          // メモ入力の変更時に自動保存
          memoTextarea.addEventListener("input", async () => {
            await saveTempNote(c.children_id, enterTimeInput.value, exitTimeInput.value, memoTextarea.value);
          });
          
          timeInputContainer.appendChild(timeGroup);
          timeInputContainer.appendChild(memoLabel);
          timeInputContainer.appendChild(memoTextarea);
          timeInputContainer.appendChild(saveButton);
          
          // notes内容
          const notesContent = document.createElement("div");
          notesContent.className = "notes-content";
          notesContent.textContent = c.notes || "メモがありません";
          
          notesDiv.appendChild(timeInputContainer);
          notesDiv.appendChild(notesContent);
          li.appendChild(notesDiv);
        }
      });

      if (i === 0 && (!AppState.SELECT_CHILD || AppState.SELECT_CHILD === "")) {
        AppState.SELECT_CHILD = c.children_id;
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

// 一時メモの保存関数
async function saveTempNote(childId, enterTime, exitTime, memo) {
  try {
    const result = await window.electronAPI.saveTempNote({
      childId: childId,
      staffId: AppState.STAFF_ID,
      dateStr: AppState.DATE_STR,
      weekDay: AppState.WEEK_DAY,
      enterTime: enterTime,
      exitTime: exitTime,
      memo: memo
    });
    
    if (result.success) {
      console.log(`✅ 一時メモ保存成功: ${childId} - ${enterTime} ～ ${exitTime}`);
    } else {
      console.error(`❌ 一時メモ保存失敗: ${result.error}`);
    }
  } catch (error) {
    console.error(`❌ 一時メモ保存エラー:`, error);
  }
}

// 一時メモの読み込み関数
async function loadTempNote(childId, enterTimeInput, exitTimeInput, memoTextarea) {
  try {
    console.log('🔍 一時メモ読み込み開始:', {
      childId,
      staffId: AppState.STAFF_ID,
      dateStr: AppState.DATE_STR,
      weekDay: AppState.WEEK_DAY
    });
    
    const result = await window.electronAPI.getTempNote({
      childId: childId,
      staffId: AppState.STAFF_ID,
      dateStr: AppState.DATE_STR,
      weekDay: AppState.WEEK_DAY
    });
    
    console.log('📥 一時メモ取得結果:', result);
    
    if (result && result.success && result.data) {
      enterTimeInput.value = result.data.enter_time || "";
      exitTimeInput.value = result.data.exit_time || "";
      memoTextarea.value = result.data.memo || "";
      console.log(`📖 一時メモ読み込み成功: ${childId} - ${result.data.enter_time} ～ ${result.data.exit_time}`);
    } else {
      console.log(`📖 一時メモなし: ${childId} (${AppState.WEEK_DAY})`);
    }
  } catch (error) {
    console.error(`❌ 一時メモ読み込みエラー:`, error);
    console.error(`❌ エラー詳細:`, error.message || error);
    console.error(`❌ エラースタック:`, error.stack);
  }
}
