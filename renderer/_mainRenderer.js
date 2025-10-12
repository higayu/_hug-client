import { initTabs } from "./modules/tabs.js";
import { loadConfig } from "./modules/config.js";
import { setupSidebar } from "./modules/sidebar.js";
import { initHugActions } from "./modules/hugActions.js";

console.log("✅ mainRenderer.js 読み込み完了");


// ===== グローバル変数 =====
let HUG_USERNAME = "";
let HUG_PASSWORD = "";
let STAFF_ID = "";
let FACILITY_ID = "";
let DATE_STR = "";
let WEEK_DAY = "";
let SELECT_CHILD = "";
let SELECT_CHILD_Name = "";
let childrenData;

const AppState = {
  HUG_USERNAME: "",
  HUG_PASSWORD: "",
  STAFF_ID: "",
  FACILITY_ID: "",
  DATE_STR: "",
  WEEK_DAY: "",
  SELECT_CHILD: "",
  SELECT_CHILD_NAME: "",
  childrenData: [],
};


const SELECTORS = {
  REFRESH: "#refreshBtn",
  LOGIN: "#loginBtn",
  INDIVIDUAL_PLAN: "#Individual_Support_Button",
  SPECIALIZED_PLAN: "#Specialized-Support-Plan",
  IMPORT_SETTING: "#Import-Setting",
};

let initializeChildrenList = async function () {
  console.warn("⚠️ initializeChildrenList() はまだ初期化されていません");
};

// ===== 共通関数 =====
function getTodayWeekday(offset = 0) {
  const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return weekdays[date.getDay()];
}

function getDateString(offset = 0) {
  const today = new Date();
  today.setDate(today.getDate() + offset);
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

async function loadConfig() {
  const output = document.getElementById("configOutput");
  try {
    const result = await window.electronAPI.readConfig();
    if (!result.success) {
      output.textContent = "❌ 読み込みエラー: " + result.error;
      console.error(result.error);
      return false;
    }
    console.log("✅ config.json 読み込み成功:", result.data);
    output.textContent = JSON.stringify(result.data, null, 2);

    HUG_USERNAME = result.data.HUG_USERNAME;
    HUG_PASSWORD = result.data.HUG_PASSWORD;
    STAFF_ID = result.data.STAFF_ID;
    FACILITY_ID = result.data.FACILITY_ID;
    DATE_STR = getDateString(0);
    WEEK_DAY = getTodayWeekday(0);
    console.log("🧩 設定完了:", { HUG_USERNAME, STAFF_ID, FACILITY_ID, DATE_STR, WEEK_DAY });
    return true;
  } catch (err) {
    console.error("❌ config.json 読み込み中にエラー:", err);
    output.textContent = "❌ エラー: " + err.message;
    return false;
  }
}

// ===== メイン処理 =====
window.addEventListener("DOMContentLoaded", async () => {
    const output = document.getElementById("configOutput");
    const settingsEl = document.getElementById("settings");

    // ===== ① config.json 読み込み =====
    const ok = await loadConfig();
    if (ok) {
    console.log("OK");
    } else {
    alert("❌ 設定の読み込みに失敗しました");
    }

    // ===== ② settings.html を読み込む =====
    const res = await fetch("settings.html");
    const html = await res.text();
    settingsEl.innerHTML = html;
    console.log("✅ settings.html 読み込み完了");

    // ===== ③ 子どもリスト描画関数を定義 =====
    const weekdaySelect = settingsEl.querySelector("#weekdaySelect");
    const childrenList = settingsEl.querySelector("#childrenList");

    initializeChildrenList = async function (children = childrenData) {
    console.log("🚀 子どもリスト描画開始");

    if (!childrenList) return;
    childrenList.innerHTML = "";

    if (Array.isArray(children) && children.length > 0) {
        children.forEach((c, index) => {
        const li = document.createElement("li");
        li.textContent = `${c.child_id}：${c.name}`;
        li.dataset.childId = c.child_id;
        li.style.cursor = "pointer";

        li.addEventListener("click", () => {
            SELECT_CHILD = c.child_id;
            SELECT_CHILD_Name = c.name;
            console.log(`🎯 SELECT_CHILD: ${SELECT_CHILD} / ${SELECT_CHILD_Name}`);
            childrenList.querySelectorAll("li").forEach((item) => (item.style = ""));
            li.style.background = "#4fc3f7";
            li.style.color = "#000";
        });

        childrenList.appendChild(li);

        // 🌟 初回のみ：1番目の子を自動選択
        if (index === 0 && !SELECT_CHILD) {
            SELECT_CHILD = c.child_id;
            SELECT_CHILD_Name = c.name;
            li.style.background = "#4fc3f7";
            li.style.color = "#000";
            console.log(`✨ 初回自動選択: ${SELECT_CHILD_Name} (${SELECT_CHILD})`);
        }
        });
    } else {
        childrenList.innerHTML = "<li>該当する子どもがいません</li>";
    }
    };

    // ===== ④ 初期化（曜日設定＋児童取得） =====
    if (weekdaySelect) {
    WEEK_DAY = getTodayWeekday(0);
    weekdaySelect.value = WEEK_DAY;
    console.log(`🗓️ 初期設定 → WEEK_DAY = ${WEEK_DAY}`);

    try {
        childrenData = await window.electronAPI.GetChildrenByStaffAndDay(STAFF_ID, WEEK_DAY);
        console.log("✅ 初期子ども一覧取得成功:", childrenData);
        initializeChildrenList(childrenData);
    } catch (err) {
        console.error("❌ 初期子ども一覧取得失敗:", err);
    }

    // 曜日変更イベント
    weekdaySelect.addEventListener("change", async () => {
        WEEK_DAY = weekdaySelect.value;
        childrenData = await window.electronAPI.GetChildrenByStaffAndDay(STAFF_ID, WEEK_DAY);
        console.log("🔁 子ども一覧再取得:", childrenData);
        SELECT_CHILD = ""; // ← 曜日が変わったら選択をリセット
        initializeChildrenList();
    });
    }

    // ===== ⑤ サイドバー制御 =====
    const menuToggle = document.getElementById("menuToggle");
    const hugview = document.getElementById("hugview");

    if (menuToggle && settingsEl && hugview) {
    menuToggle.addEventListener("click", () => {
        const isOpen = settingsEl.classList.toggle("open");
        hugview.classList.toggle("shifted", isOpen);
        console.log(isOpen ? "📂 サイドバーを開きました" : "📁 サイドバーを閉じました");
    });
    }

    document.addEventListener("click", (e) => {
    if (
        settingsEl.classList.contains("open") &&
        !settingsEl.contains(e.target) &&
        !menuToggle.contains(e.target)
    ) {
        settingsEl.classList.remove("open");
        document.getElementById("hugview").classList.remove("shifted");
        console.log("📁 サイドバーを閉じました（外側クリック）");
    }
    });

    // ✅ ページ初期表示時にも「今日の利用者」ボタンを自動クリック
    const vw = document.getElementById("hugview");
    
    vw.addEventListener("did-finish-load", async () => {
    console.log("🌐 ページ読み込み完了 - 今日の利用者ボタンをチェック中...");
    vw.executeJavaScript(`
        const todayButton = [...document.querySelectorAll('a.btn.btn-primary.btn-user')]
        .find(a => a.href.includes('attendance.php?mode=detail'));
        if (todayButton) {
        console.log("✅ 今日の利用者ボタンが見つかりました。クリックします:", todayButton.href);
        todayButton.click();
        } else {
        console.warn("⚠️ 今日の利用者ボタンが見つかりませんでした。");
        }
    `);
    });

    // ===== 🌟 ページ初期表示でHugタブをアクティブにする =====
    document.querySelector('#tabs button[data-target="hugview"]').classList.add('active-tab');

});

    
// 🌟 現在アクティブなwebviewを管理
let activeWebview = document.getElementById("hugview");
let closeButtonsVisible = true; // ← トグルの状態を管理

// 各ボタン共通でアクティブタブに対して操作する
function getActiveWebview() {
if (!activeWebview) {
    alert("アクティブなHugタブがありません");
    return null;
}
return activeWebview;
}

document.getElementById("refreshBtn").addEventListener("click", async () => {
const vw = getActiveWebview();
vw?.reload();

// ✅ 設定パネル側のリストも再描画したいとき
if (typeof initializeChildrenList === "function") {
console.log("🔄 再読み込み後に子どもリストを再描画");
childrenData = await window.electronAPI.GetChildrenByStaffAndDay(STAFF_ID, WEEK_DAY);
await initializeChildrenList();
}
});


// 🌟 トグルで閉じるボタンの表示ON/OFF
document.getElementById("closeToggle").addEventListener("change", (e) => {
closeButtonsVisible = e.target.checked;
document.querySelectorAll(".close-btn").forEach(btn => {
    btn.style.display = closeButtonsVisible ? "inline" : "none";
});
});


document.getElementById("loginBtn").addEventListener("click", async () => {
const vw = getActiveWebview();
if (!vw) return;

if (!HUG_USERNAME || !HUG_PASSWORD) {
alert("config.json がまだ読み込まれていません。");
return;
}

console.log("🚀 自動ログイン開始...");

vw.executeJavaScript(`
document.querySelector('input[name="username"]').value = ${JSON.stringify(HUG_USERNAME)};
document.querySelector('input[name="password"]').value = ${JSON.stringify(HUG_PASSWORD)};
const checkbox = document.querySelector('input[name="setexpire"]');
if (checkbox && !checkbox.checked) checkbox.click();
document.querySelector("input.btn-login")?.click();
`);

// ✅ ログイン後の画面が読み込まれたら実行
vw.addEventListener("did-finish-load", async () => {
console.log("✅ ログイン後ページの読み込み完了。今日の利用者ボタンを探します...");
vw.executeJavaScript(`
    // href に "attendance.php?mode=detail" を含むリンクを探す
    const todayButton = [...document.querySelectorAll('a.btn.btn-primary')]
    .find(a => a.href.includes('attendance.php?mode=detail'));

    if (todayButton) {
    console.log("✅ 今日の利用者ボタンが見つかりました。クリックします。");
    todayButton.click();
    } else {
    console.warn("⚠️ 今日の利用者ボタンが見つかりません。");
    }
`);
}, { once: true }); // ← 一度だけ発火する
});


document.getElementById("professional-support").addEventListener("click", () => {
const vw = getActiveWebview();
vw?.loadURL("https://www.hug-ayumu.link/hug/wm/record_proceedings.php");
});

document.getElementById("professional-support-new").addEventListener("click", () => {
const vw = getActiveWebview();
if (!vw) return;
vw.loadURL("https://www.hug-ayumu.link/hug/wm/record_proceedings.php?mode=edit");
vw.addEventListener("did-finish-load", () => {
    vw.executeJavaScript(`// 専門的支援実施加算
const selectSupport = document.querySelector('select[name="adding_children_id"]');
if (selectSupport) {
selectSupport.value = "55";
selectSupport.dispatchEvent(new Event("change", { bubbles: true }));
console.log("✅ 専門的支援実施加算を選択");
}

// 子どもリスト（例：岡田 磨和 → value="49"）
const selectChild = document.querySelector('select[name="c_id_list[0][id]"]');
if (selectChild) {
selectChild.value = "${SELECT_CHILD}";
selectChild.dispatchEvent(new Event("change", { bubbles: true }));
console.log("✅ 子どもリストで岡田磨和を選択");
}

// 記録者（例：東山 → value="73"）
const selectRecorder = document.querySelector('select[name="recorder"]');
if (selectRecorder) {
selectRecorder.value = ${JSON.stringify(STAFF_ID)};
selectRecorder.dispatchEvent(new Event("change", { bubbles: true }));
console.log("✅ 記録者をひがしやまに選択");
}
const interviewSelect = document.querySelector('select[name="interview_staff[]"]');
if (interviewSelect) {
interviewSelect.value = ${JSON.stringify(STAFF_ID)};
interviewSelect.dispatchEvent(new Event("change", { bubbles: true }));
console.log("✅ 面接担当を選択:", interviewSelect.value);
}

// カスタマイズ項目のタイトル入力
const customizeInput = document.querySelector('input[name="customize[title][]"]');
if (customizeInput) {
customizeInput.value = "記録";
customizeInput.dispatchEvent(new Event("input", { bubbles: true }));
console.log("✅ カスタマイズタイトル入力:", customizeInput.value);
}
`);
}, { once: true });
});

// ✅ 個別支援計画を別ウインドウで開く
document.getElementById("Individual_Support_Button").addEventListener("click", () => {
window.electronAPI.openIndividualSupportPlan(SELECT_CHILD);
});


// ✅ Renderer 側（あなたのHTML内）
document.getElementById("Specialized-Support-Plan").addEventListener("click", () => {
// mainプロセスに新しいウインドウを開くよう依頼
window.electronAPI.openSpecializedSupportPlan(SELECT_CHILD);
});

// 「設定ファイルの取得」ボタンのクリックイベント
document.getElementById("Import-Setting").addEventListener("click", async () => {
try {
const result = await window.electronAPI.importConfigFile();
if (result.success) {
    alert("✅ 設定ファイルをコピーしました:\n" + result.destination);
    // ===== ① config.json 読み込み =====
    const ok = await loadConfig();
    if (ok) {
        console.log("OK");
    } else {
        alert("❌ 設定の読み込みに失敗しました");
    }
} else {
    alert("⚠️ コピーがキャンセルまたは失敗しました");
}
} catch (err) {
alert("❌ エラーが発生しました: " + err.message);
}
});


// タブ追加ボタンを作る
const tabsContainer = document.getElementById("tabs");

const addTabButton = document.createElement("button");
addTabButton.textContent = "＋";

const Kojin_Button = document.createElement("button");
Kojin_Button.textContent = "＋ 個人記録";


tabsContainer.appendChild(addTabButton);
tabsContainer.appendChild(Kojin_Button);

addTabButton.addEventListener("click", () => {
const newId = `hugview-${Date.now()}`;
const newWebview = document.createElement("webview");
newWebview.id = newId;
newWebview.src = `https://www.hug-ayumu.link/hug/wm/attendance.php?mode=detail&f_id=${JSON.stringify(FACILITY_ID)}&date=${DATE_STR}`;
newWebview.allowpopups = true;
newWebview.style.cssText = "position:absolute;top:0;left:0;width:100%;height:100%;";
newWebview.classList.add("hidden");
document.getElementById("content").appendChild(newWebview);

// タブボタン作成部分の改良
const tabButton = document.createElement("button");
tabButton.innerHTML = `
Hug-${tabsContainer.querySelectorAll("button[data-target^='hugview']").length + 1}
<span class="close-btn"${closeButtonsVisible ? "" : " style='display:none'"}>❌</span>
`;
tabButton.dataset.target = newId;
tabsContainer.insertBefore(tabButton, addTabButton);

tabButton.addEventListener("click", () => {
document.querySelectorAll("webview").forEach(v => v.classList.add("hidden"));
newWebview.classList.remove("hidden");
activeWebview = newWebview; // ← アクティブを更新
});

// 閉じる処理
const closeBtn = tabButton.querySelector(".close-btn");
closeBtn.addEventListener("click", (e) => {
e.stopPropagation(); // タブ切り替えを防ぐ
if (!confirm("このタブを閉じてもよろしいですか？")) return;
newWebview.remove();
tabButton.remove();

if (activeWebview === newWebview) {
    activeWebview = document.getElementById("hugview");
    activeWebview.classList.remove("hidden");
}
});

// 追加直後にこのタブを選択状態にする
tabButton.click();
});



// 🧩 個人記録タブを開く
Kojin_Button.addEventListener("click", () => {
const newId = `hugview-${Date.now()}`;
const newWebview = document.createElement("webview");
newWebview.id = newId;
console.log("個人記録クリック　　今日の日付",DATE_STR);

// contact_book ページを開く
newWebview.src = `https://www.hug-ayumu.link/hug/wm/contact_book.php?id=${SELECT_CHILD}`;
newWebview.allowpopups = true;
newWebview.style.cssText = "position:absolute;top:0;left:0;width:100%;height:100%;";
newWebview.classList.add("hidden");

// ✅ タブコンテナに新しいボタンを追加（最後尾でOK）
const tabButton = document.createElement("button");
tabButton.innerHTML = `
個人記録 : ${SELECT_CHILD_Name}
<span class="close-btn"${closeButtonsVisible ? "" : " style='display:none'"}>❌</span>
`;
tabButton.dataset.target = newId;
tabsContainer.appendChild(tabButton); // ← 修正箇所！

// 切り替え処理
tabButton.addEventListener("click", () => {
document.querySelectorAll("webview").forEach(v => v.classList.add("hidden"));
newWebview.classList.remove("hidden");
activeWebview = newWebview;
});

// 閉じる処理
tabButton.querySelector(".close-btn").addEventListener("click", (e) => {
e.stopPropagation();
if (!confirm("このタブを閉じてもよろしいですか？")) return;
newWebview.remove();
tabButton.remove();
activeWebview = document.getElementById("hugview");
activeWebview.classList.remove("hidden");
});

console.log("🔍 自動で編集ボタンを捜索:");
// ✅ 自動で編集モードを開く処理
newWebview.addEventListener("did-finish-load", () => {
newWebview.executeJavaScript(`
    console.log("✅ 初回ロード完了、編集ボタン探索中...");
    const btns = document.querySelectorAll('button.btn.btn-sm.m0.edit');
    const target = [...btns].find(b => (b.getAttribute('onclick') || '').includes('cal_date=${DATE_STR}'));
    if (target) {
    console.log("✅ 編集ボタン発見。クリック実行...");
    target.click();
    } else {
    console.warn("❌ 編集ボタン未検出");
    }
`);
});

// 🔁 編集クリック後の再読み込みにも対応
newWebview.addEventListener("did-stop-loading", async () => {
const url = await newWebview.getURL();
console.log("🔁 読み込み完了:", url);
if (url.includes("contact_book.php?mode=edit") || url.includes("record_proceedings.php?mode=edit")) {
    // 編集画面と思われるページ
    newWebview.executeJavaScript(`
    console.log("📝 編集ページ内で record_staff を設定中...");
    const staffSelect = document.querySelector('select[name="record_staff"]');
    if (staffSelect) {
        staffSelect.value = "${STAFF_ID}";
        staffSelect.dispatchEvent(new Event("change", { bubbles: true }));
        console.log("✅ record_staff 設定完了:", staffSelect.value);
    } else {
        console.warn("⚠️ record_staff が見つかりません");
    }
    `);
}
});

// ✅ webview内部のconsole.logを親のDevToolsに転送
newWebview.addEventListener("console-message", (e) => {
console.log(`🌐 [${newWebview.id}] ${e.message}`);
});

document.getElementById("content").appendChild(newWebview);
tabButton.click(); // ← すぐに表示
});

// タブ切り替え
const tabs = document.querySelectorAll("#tabs button");
const hugviewEl = document.getElementById("hugview");
const settingsEl = document.getElementById("settings");


// タブ切り替え（イベント委譲対応）
tabsContainer.addEventListener("click", (e) => {
const tab = e.target.closest("button[data-target]");
if (!tab) return;

// 🎨 すべてのタブからアクティブクラスを除去
tabsContainer.querySelectorAll("button").forEach(btn => btn.classList.remove("active-tab"));
// 🎨 押されたタブだけにアクティブクラスを付与
tab.classList.add("active-tab");

const targetId = tab.dataset.target;
document.querySelectorAll("webview").forEach(v => v.classList.add("hidden"));

if (targetId === "settings") {
settingsEl.classList.remove("hidden");
} else {
const targetView = document.getElementById(targetId);
if (targetView) {
    targetView.classList.remove("hidden");
    activeWebview = targetView;
}
}
});
