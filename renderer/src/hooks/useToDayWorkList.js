// renderer/src/hooks/useToDayWorkList.js
import { useAppState } from "../contexts/AppStateContext.jsx";
import { fetchAttendanceTableData } from "../utils/attendanceTable.js";
import { 
  ELEMENT_IDS, 
  MESSAGES, 
  EVENTS
} from "../utils/constants.js";

/**
 * 児童の出勤データを取得（コンソール出力のみ）
 * @param {string} childId - 児童ID
 * @param {string} childName - 児童名
 */
export async function handleFetchAttendanceForChild(childId, childName, appState) {
    const { FACILITY_ID, DATE_STR } = appState || {};
    try {
      console.log(`📊 [ATTENDANCE] 出勤データ取得開始 - 児童: ${childName} (ID: ${childId})`);
  
      // 施設IDと日付を取得
      const facilitySelect = document.getElementById(ELEMENT_IDS.FACILITY_SELECT);
      const dateInput = document.getElementById(ELEMENT_IDS.SETTINGS)?.querySelector(`#${ELEMENT_IDS.DATE_SELECT}`);
  
      const facility_id = facilitySelect?.value || FACILITY_ID;
      const date_str = dateInput?.value || DATE_STR;
  
      if (!facility_id || !date_str) {
        console.error("❌ [ATTENDANCE] 施設IDまたは日付が設定されていません");
        return;
      }
  
      // 出勤データを取得
      const result = await fetchAttendanceTableData(facility_id, date_str, { showToast: false });
  
      if (result.success) {
        console.log("✅ [ATTENDANCE] 出勤データ取得成功");
        console.log("📊 [ATTENDANCE] 取得結果:", {
          児童ID: childId,
          児童名: childName,
          施設ID: facility_id,
          日付: date_str,
          テーブル行数: result.rowCount,
          ページタイトル: result.pageTitle,
          ページURL: result.pageUrl,
          テーブルHTMLサイズ: result.htmlSize,
          テーブルクラス: result.className,
        });
      } else {
        console.error("❌ [ATTENDANCE] 出勤データ取得失敗", result.error);
      }
    } catch (error) {
      console.error("❌ [ATTENDANCE] 出勤データ取得エラー:", error);
    }
  }

export async function initChildrenList() {
  // Reactコンポーネント内の要素を直接取得（HTMLを読み込む必要はない）
  const weekdaySelect = document.getElementById(ELEMENT_IDS.WEEKDAY_SELECT);
  const dateInput = document.getElementById(ELEMENT_IDS.DATE_SELECT);
  const listEl = document.getElementById(ELEMENT_IDS.CHILDREN_LIST);

  // 要素が存在するまで待つ（Reactコンポーネントがマウントされるまで）
  if (!dateInput || !weekdaySelect || !listEl) {
    console.warn("⚠️ [childrenList] サイドバー要素が見つかりません。再試行します...");
    // 少し遅延させて再試行
    setTimeout(() => {
      initChildrenList();
    }, 100);
    return;
  }

  // 🌟 デフォルト日付を設定
  AppState.WEEK_DAY = AppState.WEEK_DAY || "月";
  
  // Reactコンポーネントで処理されるため、initSidebar()とupdateSidebarValues()の呼び出しは不要

  // 折りたたみ機能はReactコンポーネント内で処理されるため、ここでの初期化は不要

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
        li.dataset.childId = c.children_id;
        li.className = "p-2.5 my-1.5 bg-gray-50 border border-gray-200 rounded cursor-pointer transition-colors hover:bg-gray-200 flex items-center justify-between gap-2.5 text-black";

        // 児童名を表示するspan要素
        const nameSpan = document.createElement("span");
        nameSpan.textContent = `${c.children_id}: ${c.children_name}　:${c.pc_name?c.pc_name:""}`;
        nameSpan.className = "flex-1 cursor-pointer text-black";

        // 出勤データ取得ボタン
        const attendanceBtn = document.createElement("button");
        attendanceBtn.textContent = "📊";
        attendanceBtn.title = "出勤データ取得";
        attendanceBtn.className = "px-2 py-1 text-xs bg-blue-600 text-white border-none rounded cursor-pointer flex-shrink-0 hover:bg-blue-700 text-black";
        attendanceBtn.addEventListener(EVENTS.CLICK, async (e) => {
          e.stopPropagation(); // リスト項目のクリックイベントを防ぐ
          await handleFetchAttendanceForChild(c.children_id, c.children_name);
        });

        // 左クリックで選択（nameSpanのみ）
        nameSpan.addEventListener(EVENTS.CLICK, () => {
          AppState.SELECT_CHILD = c.children_id;
          AppState.SELECT_CHILD_NAME = c.children_name;
          listEl.querySelectorAll("li").forEach(li => {
            li.classList.remove("bg-gradient-to-b", "from-cyan-100", "to-cyan-400", "border-l-4", "border-l-cyan-700", "font-bold", "text-black");
          });
          li.classList.add("bg-gradient-to-b", "from-cyan-100", "to-cyan-400", "border-l-4", "border-l-cyan-700", "font-bold", "text-black");
          console.log(`${MESSAGES.INFO.CHILD_SELECTED}: ${AppState.SELECT_CHILD_NAME} (${AppState.SELECT_CHILD})`);
        });

        li.appendChild(nameSpan);
        li.appendChild(attendanceBtn);

        // 右クリックでnotes表示/非表示
        li.addEventListener(EVENTS.CONTEXTMENU, (e) => {
          e.preventDefault();
          
          // 既存のnotes表示をチェック
          let notesDiv = li.querySelector(".notes-display");
          
          if (notesDiv) {
            // 既に表示されている場合は非表示
            notesDiv.remove();
          } else {
            // notesを表示
            notesDiv = document.createElement("div");
            notesDiv.className = "mt-1.5 p-2 bg-gray-50 border border-gray-300 rounded text-xs text-gray-700 whitespace-pre-wrap break-words max-h-[100px] overflow-y-auto";
            
            // 時間入力コンテナを作成
            const timeInputContainer = document.createElement("div");
            timeInputContainer.className = "mb-2 pb-2 border-b border-gray-300";
            
            // 時間入力グループ（横並び）
            const timeGroup = document.createElement("div");
            timeGroup.className = "flex items-center gap-2 mb-2";
            
            // 入室時間入力
            const enterTimeLabel = document.createElement("label");
            enterTimeLabel.textContent = "入室:";
            enterTimeLabel.className = "text-[11px] font-bold text-gray-700 mr-1";
            
            const enterTimeInput = document.createElement("input");
            enterTimeInput.type = "time";
            enterTimeInput.className = "w-20 p-1.5 border border-gray-300 rounded text-[11px] bg-white text-black focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200";
            enterTimeInput.id = `enter-${c.children_id}`;
            
            // 退出時間入力
            const exitTimeLabel = document.createElement("label");
            exitTimeLabel.textContent = "退出:";
            exitTimeLabel.className = "text-[11px] font-bold text-gray-700 mr-1";
            
            const exitTimeInput = document.createElement("input");
            exitTimeInput.type = "time";
            exitTimeInput.className = "w-20 p-1.5 border border-gray-300 rounded text-[11px] bg-white text-black focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200";
            exitTimeInput.id = `exit-${c.children_id}`;
            
            // 時間グループに追加
            timeGroup.appendChild(enterTimeLabel);
            timeGroup.appendChild(enterTimeInput);
            timeGroup.appendChild(exitTimeLabel);
            timeGroup.appendChild(exitTimeInput);
            
            // メモ入力テキストエリア
            const memoLabel = document.createElement("label");
            memoLabel.textContent = "メモ:";
            memoLabel.className = "text-[11px] font-bold text-gray-700 mr-1 w-full mt-2 block";
            
            const memoTextarea = document.createElement("textarea");
            memoTextarea.className = "w-full p-1.5 border border-gray-300 rounded text-[11px] bg-white resize-y min-h-[60px] font-inherit text-black focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200";
            memoTextarea.id = `memo-${c.children_id}`;
            memoTextarea.placeholder = MESSAGES.PLACEHOLDERS.MEMO;
            memoTextarea.rows = 3;
            
            // 保存ボタン
            const saveButton = document.createElement("button");
            saveButton.textContent = "保存";
            saveButton.className = "px-2 py-1 bg-blue-600 text-white border-none rounded text-[10px] cursor-pointer ml-auto hover:bg-blue-700 text-black";
            
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
            notesContent.className = "mt-2 text-xs leading-snug text-black";
            notesContent.textContent = c.notes || "メモがありません";
            
            notesDiv.appendChild(timeInputContainer);
            notesDiv.appendChild(notesContent);
            li.appendChild(notesDiv);
          }
        });

        if (i === 0 && (!AppState.SELECT_CHILD || AppState.SELECT_CHILD === "")) {
          AppState.SELECT_CHILD = c.children_id;
          AppState.SELECT_CHILD_NAME = c.children_name;
          AppState.SELECT_PC_NAME = c.pc_name?c.pc_name:"";
          li.classList.add("bg-gradient-to-b", "from-cyan-100", "to-cyan-400", "border-l-4", "border-l-cyan-700", "font-bold", "text-black");
          console.log(`選択状態を変更する: ${AppState.SELECT_CHILD_NAME}:${AppState.SELECT_PC_NAME}`);
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
          li.className = "p-1.5 my-1.5 border-b border-gray-300 cursor-pointer transition-colors hover:bg-yellow-100 text-black";
          
          // 左クリックで選択
          li.addEventListener(EVENTS.CLICK, () => {
            AppState.SELECT_CHILD = c.children_id;
            AppState.SELECT_CHILD_NAME = c.children_name;
            AppState.SELECT_PC_NAME = c.pc_name?c.pc_name:"";
            // 他のリストのアクティブ状態をクリア
            document.querySelectorAll(`#${ELEMENT_IDS.CHILDREN_LIST} li, #${ELEMENT_IDS.WAITING_CHILDREN_LIST} li, #${ELEMENT_IDS.EXPERIENCE_CHILDREN_LIST} li`).forEach(li => {
              li.classList.remove("bg-gradient-to-b", "from-cyan-100", "to-cyan-400", "border-l-4", "border-l-cyan-700", "font-bold", "text-black");
            });
            li.classList.add("bg-gradient-to-b", "from-cyan-100", "to-cyan-400", "border-l-4", "border-l-cyan-700", "font-bold", "text-black");
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
          li.className = "p-1.5 my-1.5 border-b border-gray-300 cursor-pointer transition-colors hover:bg-blue-100 text-black";
          
          // 左クリックで選択
          li.addEventListener(EVENTS.CLICK, () => {
            AppState.SELECT_CHILD = c.children_id;
            AppState.SELECT_CHILD_NAME = c.children_name;
            AppState.SELECT_PC_NAME = "";
            // 他のリストのアクティブ状態をクリア
            document.querySelectorAll(`#${ELEMENT_IDS.CHILDREN_LIST} li, #${ELEMENT_IDS.WAITING_CHILDREN_LIST} li, #${ELEMENT_IDS.EXPERIENCE_CHILDREN_LIST} li`).forEach(li => {
              li.classList.remove("bg-gradient-to-b", "from-cyan-100", "to-cyan-400", "border-l-4", "border-l-cyan-700", "font-bold", "text-black");
            });
            li.classList.add("bg-gradient-to-b", "from-cyan-100", "to-cyan-400", "border-l-4", "border-l-cyan-700", "font-bold", "text-black");
            console.log(`${MESSAGES.INFO.CHILD_SELECTED}: ${AppState.SELECT_CHILD_NAME} (${AppState.SELECT_CHILD})`);
          });
          
          experienceListEl.appendChild(li);
        });
      }
    }
  }

  // 🌟 曜日選択のイベントリスナー（Reactコンポーネントからディスパッチされるイベントをリッスン）
  window.addEventListener('weekday-changed', async () => {
    // Reactコンポーネントで既にAppState.WEEK_DAYが更新されている
    AppState.SELECT_CHILD = "";
    AppState.SELECT_CHILD_NAME = "";
    await loadChildren();
  });

  // 🌟 日付選択はReactコンポーネント内で処理されるため、イベントリスナーは不要

  // 初期読み込み
  await loadChildren();
  console.log(MESSAGES.SUCCESS.CHILDREN_INIT);
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

