// modules/tabs.js
import { AppState,getDateString} from "./config.js";
import { setActiveWebview, getActiveWebview } from "./webviewState.js";

export function initTabs() {
  const tabsContainer = document.getElementById("tabs");
  const content = document.getElementById("content");

  // 🌟 初期アクティブwebview設定
  setActiveWebview(document.getElementById("hugview"));

  // 🌟 追加ボタン
  const addTabBtn = document.createElement("button");
  addTabBtn.textContent = "＋";
  tabsContainer.appendChild(addTabBtn);

  // 🌟 個人記録ボタン
  const Kojin_Button = document.getElementById("kojin-kiroku");//document.createElement("button");
  //Kojin_Button.textContent = "＋ 個人記録";
  //tabsContainer.appendChild(Kojin_Button);

  // ===== 通常タブ追加 =====
  addTabBtn.addEventListener("click", () => {
    const newId = `hugview-${Date.now()}`;
    const newWebview = document.createElement("webview");
    newWebview.id = newId;
    newWebview.src = `https://www.hug-ayumu.link/hug/wm/attendance.php?mode=detail&f_id=${AppState.FACILITY_ID}&date=${AppState.DATE_STR}`;
    newWebview.allowpopups = true;
    newWebview.style.cssText = "position:absolute;top:0;left:0;width:100%;height:100%;";
    newWebview.classList.add("hidden");
    content.appendChild(newWebview);

    const tabButton = document.createElement("button");
    tabButton.innerHTML = `
      Hug-${tabsContainer.querySelectorAll("button[data-target^='hugview']").length + 1}
      <span class="close-btn"${AppState.closeButtonsVisible ? "" : " style='display:none'"}>❌</span>
    `;
    tabButton.dataset.target = newId;
    tabsContainer.insertBefore(tabButton, addTabBtn);

    // タブクリック（アクティブ切替）
    tabButton.addEventListener("click", () => {
      document.querySelectorAll("webview").forEach(v => v.classList.add("hidden"));
      newWebview.classList.remove("hidden");
      setActiveWebview(newWebview);
    });

    // 閉じる処理
    const closeBtn = tabButton.querySelector(".close-btn");
    closeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (!confirm("このタブを閉じますか？")) return;
      newWebview.remove();
      tabButton.remove();

      // 閉じたタブがアクティブならデフォルトに戻す
      if (getActiveWebview() === newWebview) {
        const defaultView = document.getElementById("hugview");
        defaultView.classList.remove("hidden");
        setActiveWebview(defaultView);
        tabsContainer.querySelector(`button[data-target="hugview"]`)?.classList.add("active-tab");
      }
    });

    tabButton.click(); // 追加直後に選択
  });


  // ===== 個人記録タブ =====
  Kojin_Button.addEventListener("click", () => {
    if (!AppState.SELECT_CHILD) {
      alert("子どもを選択してください");
      return;
    }

    const newId = `hugview-${AppState.DATE_STR}`;
    console.log("newIdの値", newId);
    const newWebview = document.createElement("webview");
    newWebview.id = newId;
    console.log("👤 個人記録クリック — 選択した日付:", AppState.DATE_STR);

    // contact_book ページを開く
    newWebview.src = `https://www.hug-ayumu.link/hug/wm/contact_book.php?id=${AppState.SELECT_CHILD}`;
    newWebview.allowpopups = true;
    newWebview.style.cssText = "position:absolute;top:0;left:0;width:100%;height:100%;";
    newWebview.classList.add("hidden");
    content.appendChild(newWebview);

    // ✅ 子webview内 console を親に転送
    newWebview.addEventListener("console-message", (e) => {
      console.log(`🪶 [${newWebview.id}] ${e.message}`); // ← ここで全ログ拾える！
    });

    // ✅ タブボタン作成
    const tabButton = document.createElement("button");
    tabButton.innerHTML = `
      個人記録 : ${AppState.SELECT_CHILD_NAME}
      <span class="close-btn"${AppState.closeButtonsVisible ? "" : " style='display:none'"}>❌</span>
    `;
    tabButton.dataset.target = newId;
    tabsContainer.appendChild(tabButton);

    // タブ切替
    tabButton.addEventListener("click", () => {
      document.querySelectorAll("webview").forEach(v => v.classList.add("hidden"));
      newWebview.classList.remove("hidden");
      setActiveWebview(newWebview);
    });

    // 閉じる処理
    tabButton.querySelector(".close-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      if (!confirm("このタブを閉じますか？")) return;
      newWebview.remove();
      tabButton.remove();

      const defaultView = document.getElementById("hugview");
      defaultView.classList.remove("hidden");
      setActiveWebview(defaultView);
      tabsContainer.querySelector(`button[data-target="hugview"]`)?.classList.add("active-tab");
    });

    // ✅ 初回ロード時：日付セット + 検索クリック + 編集ボタン探索
    let hasSearched = false;
    let hasClickedEdit = false;

    if(AppState.DATE_STR == getDateString()){
      console.log("当日のため省略",AppState.DATE_STR+'　＝＝　'+getDateString())
      //hasSearched = true;
    }else{
      console.log("当日ではない",AppState.DATE_STR+'　＝＝　'+getDateString())
    }

    // contact_book ページ初回ロード時のみ実行
    newWebview.addEventListener("did-finish-load", async () => {
      if (hasSearched) return; // ✅ 検索処理を1回だけに制限
      hasSearched = true;

      console.log("✅ contact_book ページロード完了 — 日付設定＆検索処理を開始");

      newWebview.executeJavaScript(`
        try {
          console.log("🗓️ 日付設定を実行");
          const dp1 = document.querySelector('input[name="date"]');
          const dp2 = document.querySelector('input[name="date_end"]');
          if (dp1 && dp2) {
            dp1.value = "${AppState.DATE_STR}";
            dp2.value = "${AppState.DATE_STR}";
            dp1.dispatchEvent(new Event("change", { bubbles: true }));
            dp2.dispatchEvent(new Event("change", { bubbles: true }));
            console.log("📅 日付を設定:", dp1.value, dp2.value);
          } else {
            console.warn("⚠️ 日付入力欄が見つかりません");
          }

          const searchBtn = document.querySelector('button.btn.btn-sm.search');
          if (searchBtn) {
            setTimeout(() => {
              console.log("🔍 検索ボタンをクリックします");
              searchBtn.click();
            }, 800);
          } else {
            console.warn("⚠️ 検索ボタンが見つかりません");
          }
        } catch (e) {
          console.error("❌ 自動日付・検索処理エラー:", e);
        }
      `);
    }, { once: true }); // ← 🔥 一度だけ発火

    // ===== 編集ボタン探索（検索後のページロード完了で実行） =====
    newWebview.addEventListener("did-stop-loading", async () => {
      if (hasClickedEdit) return; // ✅ クリック済みなら再実行しない

      const url = await newWebview.getURL();
      if (!url.includes("contact_book.php")) return; // 対象ページのみ実行

      console.log("✅ 編集ボタン探索開始:", url);

      newWebview.executeJavaScript(`
        try {
          const btns = document.querySelectorAll('button.btn.btn-sm.m0.edit');
          const target = [...btns].find(b => (b.getAttribute('onclick') || '').includes('cal_date=${AppState.DATE_STR}'));
          if (target) {
            console.log("✅ 編集ボタン発見 — クリック実行");
            target.click();
          } else {
            console.warn("❌ 編集ボタン未検出");
          }
        } catch (e) {
          console.error("❌ 編集ボタン探索エラー:", e);
        }
      `);

      hasClickedEdit = true;
    });


    // 🔁 編集ページ再読込時に記録者設定
    newWebview.addEventListener("did-stop-loading", async () => {
      const url = await newWebview.getURL();
      console.log("🔁 読み込み完了:", url);

      if (url.includes("contact_book.php?mode=edit") || url.includes("record_proceedings.php?mode=edit")) {
        newWebview.executeJavaScript(`
          console.log("📝 編集ページ内で record_staff を設定中...");
          const staffSelect = document.querySelector('select[name="record_staff"]');
          if (staffSelect) {
            staffSelect.value = "${AppState.STAFF_ID}";
            staffSelect.dispatchEvent(new Event("change", { bubbles: true }));
            console.log("✅ record_staff 設定完了:", staffSelect.value);
          } else {
            console.warn("⚠️ record_staff が見つかりません");
          }
        `);
      }
    });

    // ✅ webview内部のconsole.logを親DevToolsに転送
    newWebview.addEventListener("console-message", (e) => {
      console.log(`🌐 [${newWebview.id}] ${e.message}`);
    });

    // 🌟 DevTools を自動で開いて確認したい場合（開発中のみ推奨）
    // newWebview.addEventListener("dom-ready", () => {
    //   newWebview.openDevTools({ mode: "detach" }); // ← これで子webviewの内部consoleを直接見れる
    // });

    // すぐに表示
    tabButton.click();
  });

  // ===== ✅ 新規専門的支援
  document.getElementById("professional-support-new").addEventListener("click", () => {
    if (!AppState.SELECT_CHILD) {
      alert("子どもを選択してください");
      return;
    }

    const newId = `hugview-${AppState.DATE_STR}`;
    console.log("newIdの値", newId);
    const newWebview = document.createElement("webview");
    newWebview.id = newId;
    console.log("👤 個人記録クリック — 選択した日付:", AppState.DATE_STR);

    // contact_book ページを開く
    newWebview.src = `https://www.hug-ayumu.link/hug/wm/record_proceedings.php?mode=edit`;
    newWebview.allowpopups = true;
    newWebview.style.cssText = "position:absolute;top:0;left:0;width:100%;height:100%;";
    newWebview.classList.add("hidden");
    content.appendChild(newWebview);

    // ✅ 子webview内 console を親に転送
    newWebview.addEventListener("console-message", (e) => {
      console.log(`🪶 [${newWebview.id}] ${e.message}`); // ← ここで全ログ拾える！
    });

    // ✅ タブボタン作成
    const tabButton = document.createElement("button");
    tabButton.innerHTML = `
      専門的加算 : ${AppState.SELECT_CHILD_NAME}
      <span class="close-btn"${AppState.closeButtonsVisible ? "" : " style='display:none'"}>❌</span>
    `;
    tabButton.dataset.target = newId;
    tabsContainer.appendChild(tabButton);

    // 閉じる処理
    tabButton.querySelector(".close-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      if (!confirm("このタブを閉じますか？")) return;
      newWebview.remove();
      tabButton.remove();

      const defaultView = document.getElementById("hugview");
      defaultView.classList.remove("hidden");
      setActiveWebview(defaultView);
      tabsContainer.querySelector(`button[data-target="hugview"]`)?.classList.add("active-tab");
    });

    // タブ切替
    tabButton.addEventListener("click", () => {
      document.querySelectorAll("webview").forEach(v => v.classList.add("hidden"));
      newWebview.classList.remove("hidden");
      setActiveWebview(newWebview);
    });

        // ✅ 初回ロード時：日付セット + 検索クリック + 編集ボタン探索
    let hasSearched = false;
    let hasClickedEdit = false;

    if(AppState.DATE_STR == getDateString()){
      console.log("当日のため省略",AppState.DATE_STR+'　＝＝　'+getDateString())
      //hasSearched = true;
    }else{
      console.log("当日ではない",AppState.DATE_STR+'　＝＝　'+getDateString())
    }

        // contact_book ページ初回ロード時のみ実行
    newWebview.addEventListener("did-finish-load", async () => {
      if (hasSearched) return; // ✅ 検索処理を1回だけに制限
      hasSearched = true;

      console.log("✅ contact_book ページロード完了 — 日付設定＆検索処理を開始");

    newWebview.executeJavaScript(`// 専門的支援実施加算
    const selectSupport = document.querySelector('select[name="adding_children_id"]');
    if (selectSupport) {
      selectSupport.value = "55";
      selectSupport.dispatchEvent(new Event("change", { bubbles: true }));
      console.log("✅ 専門的支援実施加算を選択");
    }

    // 子どもリスト（例：岡田 磨和 → value="49"）
    const selectChild = document.querySelector('select[name="c_id_list[0][id]"]');
    if (selectChild) {
      selectChild.value = "${AppState.SELECT_CHILD}";
      selectChild.dispatchEvent(new Event("change", { bubbles: true }));
      console.log("✅ 子どもリストで岡田磨和を選択");
    }

    // 記録者（例：東山 → value="73"）
    const selectRecorder = document.querySelector('select[name="recorder"]');
    if (selectRecorder) {
      selectRecorder.value = ${JSON.stringify(AppState.STAFF_ID)};
      selectRecorder.dispatchEvent(new Event("change", { bubbles: true }));
      console.log("✅ 記録者をひがしやまに選択");
    }
    const interviewSelect = document.querySelector('select[name="interview_staff[]"]');
    if (interviewSelect) {
      interviewSelect.value = ${JSON.stringify(AppState.STAFF_ID)};
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
    }, { once: true }); // ← 🔥 一度だけ発火


    //🌟 DevTools を自動で開いて確認したい場合（開発中のみ推奨）
    newWebview.addEventListener("dom-ready", () => {
      newWebview.openDevTools({ mode: "detach" }); // ← これで子webviewの内部consoleを直接見れる
    });

    // すぐに表示
    tabButton.click();
  });

  // ===== 🌟 タブ切り替えイベント =====
  tabsContainer.addEventListener("click", (e) => {
    const tab = e.target.closest("button[data-target]");
    if (!tab) return;

    tabsContainer.querySelectorAll("button").forEach(btn => btn.classList.remove("active-tab"));
    tab.classList.add("active-tab");

    const targetId = tab.dataset.target;
    document.querySelectorAll("webview").forEach(v => v.classList.add("hidden"));

    const targetView = document.getElementById(targetId);
    if (targetView) {
      targetView.classList.remove("hidden");
      setActiveWebview(targetView);
    }
  });

  console.log("✅ タブ機能 初期化完了（自動編集クリック・record_staff設定復元）");
}
