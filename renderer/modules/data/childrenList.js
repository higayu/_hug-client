// modules/data/childrenList.js
import { AppState,getWeekdayFromDate } from "../config/config.js";
import { initSidebar, updateSidebarValues } from "../../sidebar/sidebar.js";
import { 
  ELEMENT_IDS, 
  CSS_CLASSES, 
  MESSAGES, 
  COLORS, 
  STYLES, 
  EVENTS,
  PATHS 
} from "../config/const.js";

export async function initChildrenList() {
  const settingsEl = document.getElementById(ELEMENT_IDS.SETTINGS);

  // ✅ まずHTMLを読み込む
  const res = await fetch(PATHS.SIDEBAR_HTML);
  settingsEl.innerHTML = await res.text();

  // ✅ その後に要素を取得
  const weekdaySelect = settingsEl.querySelector(`#${ELEMENT_IDS.WEEKDAY_SELECT}`);
  const dateInput = settingsEl.querySelector(`#${ELEMENT_IDS.DATE_SELECT}`);
  const listEl = settingsEl.querySelector(`#${ELEMENT_IDS.CHILDREN_LIST}`);

  if (!dateInput || !weekdaySelect || !listEl) {
    console.error(MESSAGES.ERROR.ELEMENT_NOT_FOUND);
    return;
  }

  // 🌟 デフォルト日付を設定
  AppState.WEEK_DAY = AppState.WEEK_DAY || "月";
  
  // サイドバーを初期化
  initSidebar();
  
  // サイドバーの値を更新
  updateSidebarValues(AppState.DATE_STR, AppState.WEEK_DAY);

  // 折りたたみ機能を初期化
  initCollapsibleSections();

  async function loadChildren() {
    // facilitySelectの値を取得
    const facilitySelect = document.getElementById(ELEMENT_IDS.FACILITY_SELECT);
    const facility_id = facilitySelect ? facilitySelect.value : null;
    
    const data = await window.electronAPI.GetChildrenByStaffAndDay(AppState.STAFF_ID, AppState.WEEK_DAY, facility_id);
    AppState.childrenData = data.week_children;
    AppState.waiting_childrenData = data.waiting_children;
    AppState.Experience_childrenData = data.Experience_children;
    console.log(MESSAGES.INFO.API_DATA, data);
    renderList(data);
  }

  function renderList(data) {
    // 通常の子どもリスト
    listEl.replaceChildren();

    if (!data || !data.week_children || data.week_children.length === 0) {
      listEl.innerHTML = `<li>${MESSAGES.INFO.NO_CHILDREN}</li>`;
    } else {
      data.week_children.forEach((c, i) => {
        const li = document.createElement("li");
        li.textContent = `${c.children_id}: ${c.children_name}　:${c.pc_name?c.pc_name:""}`;
        li.dataset.childId = c.children_id;
        li.style.cursor = "pointer";

        // 左クリックで選択
        li.addEventListener(EVENTS.CLICK, () => {
          AppState.SELECT_CHILD = c.children_id;
          AppState.SELECT_CHILD_NAME = c.children_name;
          listEl.querySelectorAll("li").forEach(li => li.classList.remove(CSS_CLASSES.ACTIVE));
          li.classList.add(CSS_CLASSES.ACTIVE);
          console.log(`${MESSAGES.INFO.CHILD_SELECTED}: ${AppState.SELECT_CHILD_NAME} (${AppState.SELECT_CHILD})`);
        });

        // 右クリックでnotes表示/非表示
        li.addEventListener(EVENTS.CONTEXTMENU, (e) => {
          e.preventDefault();
          
          // 既存のnotes表示をチェック
          let notesDiv = li.querySelector(`.${CSS_CLASSES.NOTES_DISPLAY}`);
          
          if (notesDiv) {
            // 既に表示されている場合は非表示
            notesDiv.remove();
          } else {
            // notesを表示
            notesDiv = document.createElement("div");
            notesDiv.className = CSS_CLASSES.NOTES_DISPLAY;
            
            // 時間入力コンテナを作成
            const timeInputContainer = document.createElement("div");
            timeInputContainer.className = CSS_CLASSES.TIME_INPUT_CONTAINER;
            
            // 時間入力グループ（横並び）
            const timeGroup = document.createElement("div");
            timeGroup.className = CSS_CLASSES.TIME_GROUP;
            
            // 入室時間入力
            const enterTimeLabel = document.createElement("label");
            enterTimeLabel.textContent = "入室:";
            enterTimeLabel.className = CSS_CLASSES.TIME_LABEL;
            
            const enterTimeInput = document.createElement("input");
            enterTimeInput.type = "time";
            enterTimeInput.className = CSS_CLASSES.TIME_INPUT;
            enterTimeInput.id = `enter-${c.children_id}`;
            
            // 退出時間入力
            const exitTimeLabel = document.createElement("label");
            exitTimeLabel.textContent = "退出:";
            exitTimeLabel.className = CSS_CLASSES.TIME_LABEL;
            
            const exitTimeInput = document.createElement("input");
            exitTimeInput.type = "time";
            exitTimeInput.className = CSS_CLASSES.TIME_INPUT;
            exitTimeInput.id = `exit-${c.children_id}`;
            
            // 時間グループに追加
            timeGroup.appendChild(enterTimeLabel);
            timeGroup.appendChild(enterTimeInput);
            timeGroup.appendChild(exitTimeLabel);
            timeGroup.appendChild(exitTimeInput);
            
            // メモ入力テキストエリア
            const memoLabel = document.createElement("label");
            memoLabel.textContent = "メモ:";
            memoLabel.className = CSS_CLASSES.MEMO_LABEL;
            
            const memoTextarea = document.createElement("textarea");
            memoTextarea.className = CSS_CLASSES.MEMO_TEXTAREA;
            memoTextarea.id = `memo-${c.children_id}`;
            memoTextarea.placeholder = MESSAGES.PLACEHOLDERS.MEMO;
            memoTextarea.rows = 3;
            
            // 保存ボタン
            const saveButton = document.createElement("button");
            saveButton.textContent = "保存";
            saveButton.className = CSS_CLASSES.SAVE_BUTTON;
            
            // 既存の一時メモを読み込み
            loadTempNote(c.children_id, enterTimeInput, exitTimeInput, memoTextarea);
            
            // 保存ボタンのイベント
            saveButton.addEventListener(EVENTS.CLICK, async () => {
              await saveTempNote(c.children_id, enterTimeInput.value, exitTimeInput.value, memoTextarea.value);
            });
            
            // 時間入力の変更時に自動保存
            enterTimeInput.addEventListener(EVENTS.CHANGE, async () => {
              await saveTempNote(c.children_id, enterTimeInput.value, exitTimeInput.value, memoTextarea.value);
            });
            
            exitTimeInput.addEventListener(EVENTS.CHANGE, async () => {
              await saveTempNote(c.children_id, enterTimeInput.value, exitTimeInput.value, memoTextarea.value);
            });
            
            // メモ入力の変更時に自動保存
            memoTextarea.addEventListener(EVENTS.INPUT, async () => {
              await saveTempNote(c.children_id, enterTimeInput.value, exitTimeInput.value, memoTextarea.value);
            });
            
            timeInputContainer.appendChild(timeGroup);
            timeInputContainer.appendChild(memoLabel);
            timeInputContainer.appendChild(memoTextarea);
            timeInputContainer.appendChild(saveButton);
            
            // notes内容
            const notesContent = document.createElement("div");
            notesContent.className = CSS_CLASSES.NOTES_CONTENT;
            notesContent.textContent = c.notes || "メモがありません";
            
            notesDiv.appendChild(timeInputContainer);
            notesDiv.appendChild(notesContent);
            li.appendChild(notesDiv);
          }
        });

        if (i === 0 && (!AppState.SELECT_CHILD || AppState.SELECT_CHILD === "")) {
          AppState.SELECT_CHILD = c.children_id;
          AppState.SELECT_CHILD_NAME = c.children_name;
          li.classList.add(CSS_CLASSES.ACTIVE);
          console.log(`${MESSAGES.INFO.AUTO_SELECT}: ${AppState.SELECT_CHILD_NAME}`);
        }

        listEl.appendChild(li);
      });
    }

    // キャンセル待ち子どもリスト
    const waitingListEl = document.getElementById(ELEMENT_IDS.WAITING_CHILDREN_LIST);
    if (waitingListEl) {
      waitingListEl.replaceChildren();
      
      if (!data || !data.waiting_children || data.waiting_children.length === 0) {
        waitingListEl.innerHTML = `<li>${MESSAGES.INFO.NO_WAITING}</li>`;
      } else {
        data.waiting_children.forEach((c) => {
          const li = document.createElement("li");
          li.textContent = `${c.children_id}: ${c.children_name}　:${c.pc_name?c.pc_name:""}`;
          li.dataset.childId = c.children_id;
          li.style.cursor = "pointer";
          li.style.backgroundColor = COLORS.WAITING_BG;
          li.style.borderColor = COLORS.WAITING_BORDER;
          
          // 左クリックで選択
          li.addEventListener(EVENTS.CLICK, () => {
            AppState.SELECT_CHILD = c.children_id;
            AppState.SELECT_CHILD_NAME = c.children_name;
            // 他のリストのアクティブ状態をクリア
            document.querySelectorAll(`#${ELEMENT_IDS.CHILDREN_LIST} li, #${ELEMENT_IDS.WAITING_CHILDREN_LIST} li, #${ELEMENT_IDS.EXPERIENCE_CHILDREN_LIST} li`).forEach(li => li.classList.remove(CSS_CLASSES.ACTIVE));
            li.classList.add(CSS_CLASSES.ACTIVE);
            console.log(`${MESSAGES.INFO.CHILD_SELECTED}: ${AppState.SELECT_CHILD_NAME} (${AppState.SELECT_CHILD})`);
          });
          
          waitingListEl.appendChild(li);
        });
      }
    }

    // 体験子どもリスト
    const experienceListEl = document.getElementById(ELEMENT_IDS.EXPERIENCE_CHILDREN_LIST);
    if (experienceListEl) {
      experienceListEl.replaceChildren();
      
      if (!data || !data.Experience_children || data.Experience_children.length === 0) {
        experienceListEl.innerHTML = `<li>${MESSAGES.INFO.NO_EXPERIENCE}</li>`;
      } else {
        data.Experience_children.forEach((c) => {
          const li = document.createElement("li");
          li.textContent = `${c.children_id}: ${c.children_name}　:${c.pc_name?c.pc_name:""}`;
          li.dataset.childId = c.children_id;
          li.style.cursor = "pointer";
          li.style.backgroundColor = COLORS.EXPERIENCE_BG;
          li.style.borderColor = COLORS.EXPERIENCE_BORDER;
          
          // 左クリックで選択
          li.addEventListener(EVENTS.CLICK, () => {
            AppState.SELECT_CHILD = c.children_id;
            AppState.SELECT_CHILD_NAME = c.children_name;
            // 他のリストのアクティブ状態をクリア
            document.querySelectorAll(`#${ELEMENT_IDS.CHILDREN_LIST} li, #${ELEMENT_IDS.WAITING_CHILDREN_LIST} li, #${ELEMENT_IDS.EXPERIENCE_CHILDREN_LIST} li`).forEach(li => li.classList.remove(CSS_CLASSES.ACTIVE));
            li.classList.add(CSS_CLASSES.ACTIVE);
            console.log(`${MESSAGES.INFO.CHILD_SELECTED}: ${AppState.SELECT_CHILD_NAME} (${AppState.SELECT_CHILD})`);
          });
          
          experienceListEl.appendChild(li);
        });
      }
    }
  }

  // 🌟 曜日選択
  weekdaySelect.value = AppState.WEEK_DAY;
  weekdaySelect.addEventListener(EVENTS.CHANGE, async () => {
    AppState.WEEK_DAY = weekdaySelect.value;
    AppState.SELECT_CHILD = "";
    AppState.SELECT_CHILD_NAME = "";
    await loadChildren();
  });

  // 🌟 日付選択
  dateInput.addEventListener(EVENTS.CHANGE, async () => {
    AppState.DATE_STR = dateInput.value;
    console.log(MESSAGES.INFO.DATE_CHANGED, AppState.DATE_STR);
    // AppState.WEEK_DAY = getWeekdayFromDate()
    // weekdaySelect.value = AppState.WEEK_DAY; // 表示も更新
    // await loadChildren();
  });

  await loadChildren();
  console.log(MESSAGES.SUCCESS.CHILDREN_INIT);
}

// 折りたたみセクションの初期化
function initCollapsibleSections() {
  const waitingHeader = document.getElementById(ELEMENT_IDS.WAITING_HEADER);
  const waitingList = document.getElementById(ELEMENT_IDS.WAITING_CHILDREN_LIST);
  
  if (waitingHeader && waitingList) {
    // 初期状態は折りたたみ
    waitingList.classList.add(CSS_CLASSES.COLLAPSED);
    waitingHeader.classList.add(CSS_CLASSES.COLLAPSED);
    
    waitingHeader.addEventListener(EVENTS.CLICK, () => {
      const isCollapsed = waitingList.classList.contains(CSS_CLASSES.COLLAPSED);
      
      if (isCollapsed) {
        // 展開
        waitingList.classList.remove(CSS_CLASSES.COLLAPSED);
        waitingHeader.classList.remove(CSS_CLASSES.COLLAPSED);
      } else {
        // 折りたたみ
        waitingList.classList.add(CSS_CLASSES.COLLAPSED);
        waitingHeader.classList.add(CSS_CLASSES.COLLAPSED);
      }
    });
  }
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
      console.log(`${MESSAGES.SUCCESS.TEMP_NOTE_SAVED}: ${childId} - ${enterTime} ～ ${exitTime}`);
    } else {
      console.error(`❌ 一時メモ保存失敗: ${result.error}`);
    }
  } catch (error) {
    console.error(`${MESSAGES.ERROR.TEMP_NOTE_SAVE}:`, error);
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
      console.log(`${MESSAGES.SUCCESS.TEMP_NOTE_LOADED}: ${childId} - ${result.data.enter_time} ～ ${result.data.exit_time}`);
    } else {
      console.log(`${MESSAGES.INFO.TEMP_NOTE_NONE}: ${childId} (${AppState.WEEK_DAY})`);
    }
  } catch (error) {
    console.error(`${MESSAGES.ERROR.TEMP_NOTE_LOAD}:`, error);
    console.error(`❌ エラー詳細:`, error.message || error);
    console.error(`❌ エラースタック:`, error.stack);
  }
}
