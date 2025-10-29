// modules/actions/customButtons.js
import { getCustomButtons, loadCustomButtons } from '../config/customButtons.js';
import { AppState } from '../config/config.js';
import { getActiveWebview, setActiveWebview } from '../data/webviewState.js';

export class CustomButtonManager {
  constructor() {
    this.customButtons = [];
    this.isInitialized = false;
  }

  // 初期化
  async init() {
    if (this.isInitialized) return;
    
    console.log("🔧 カスタムボタンマネージャーを初期化中...");
    
    // カスタムボタンを読み込み
    await loadCustomButtons();
    
    // カスタムボタンを取得
    this.customButtons = getCustomButtons();
    console.log("📋 カスタムボタン設定:", this.customButtons);
    
    // カスタムボタンを生成
    this.generateCustomButtons();
    
    this.isInitialized = true;
    console.log("✅ カスタムボタンマネージャー初期化完了");
  }

  // カスタムボタンを生成
  generateCustomButtons() {
    const customPanel = document.getElementById('custom-panel');
    if (!customPanel) {
      console.error("❌ カスタムパネルが見つかりません");
      return;
    }

    console.log("🔍 [CUSTOM_BUTTONS] カスタムボタン生成開始");
    console.log("🔍 [CUSTOM_BUTTONS] customPanel:", customPanel);
    console.log("🔍 [CUSTOM_BUTTONS] this.customButtons:", this.customButtons);

    // 既存のカスタムボタンをクリア（テストボタン以外）
    const existingButtons = customPanel.querySelectorAll('li:not(:first-child)');
    console.log("🔍 [CUSTOM_BUTTONS] 既存ボタン数:", existingButtons.length);
    existingButtons.forEach(btn => btn.remove());

    // 有効なカスタムボタンを生成
    this.customButtons.forEach((buttonConfig, index) => {
      console.log(`🔍 [CUSTOM_BUTTONS] ボタン${index}:`, buttonConfig);
      if (buttonConfig.enabled) {
        console.log(`✅ [CUSTOM_BUTTONS] ボタン${index}を生成:`, buttonConfig.text);
        this.createCustomButton(buttonConfig);
      } else {
        console.log(`⏭️ [CUSTOM_BUTTONS] ボタン${index}は無効:`, buttonConfig.text);
      }
    });

    console.log(`✅ ${this.customButtons.filter(btn => btn.enabled).length}個のカスタムボタンを生成しました`);
  }

  // 個別のカスタムボタンを作成
  createCustomButton(buttonConfig) {
    const customPanel = document.getElementById('custom-panel');
    if (!customPanel) {
      console.error("❌ [CUSTOM_BUTTONS] customPanelが見つかりません");
      return;
    }

    console.log("🔍 [CUSTOM_BUTTONS] ボタン作成開始:", buttonConfig);

    const listItem = document.createElement('li');
    const button = document.createElement('button');
    
    button.id = buttonConfig.id;
    button.textContent = buttonConfig.text;
    button.style.backgroundColor = buttonConfig.color;
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.padding = '8px 12px';
    button.style.borderRadius = '4px';
    button.style.cursor = 'pointer';
    button.style.width = '100%';
    button.style.marginBottom = '4px';
    
    // ホバー効果
    button.addEventListener('mouseenter', () => {
      button.style.opacity = '0.8';
    });
    button.addEventListener('mouseleave', () => {
      button.style.opacity = '1';
    });

    // クリックイベント
    button.addEventListener('click', () => {
      console.log("🔘 [CUSTOM_BUTTONS] ボタンクリック:", buttonConfig.id, buttonConfig.action);
      this.handleCustomButtonClick(buttonConfig);
    });

    listItem.appendChild(button);
    customPanel.appendChild(listItem);

    console.log(`✅ [CUSTOM_BUTTONS] カスタムボタンを作成: ${buttonConfig.text} (${buttonConfig.id})`);
    console.log("🔍 [CUSTOM_BUTTONS] customPanelの子要素数:", customPanel.children.length);
  }

  // 加算比較ボタンの処理
  handleAdditionCompare(buttonConfig) {
    console.log("🔘 [CUSTOM_BUTTONS] 加算比較ボタンがクリックされました");
    console.log("🔍 [CUSTOM_BUTTONS] buttonConfig:", buttonConfig);
    console.log("🔍 [CUSTOM_BUTTONS] AppState:", { 
      FACILITY_ID: AppState.FACILITY_ID, 
      DATE_STR: AppState.DATE_STR 
    });
    try {
      if (window.electronAPI && window.electronAPI.open_addition_compare_btn) {
        console.log("📤 [CUSTOM_BUTTONS] electronAPI.open_addition_compare_btn を呼び出します");
        console.log("📤 [CUSTOM_BUTTONS] 引数:", AppState.FACILITY_ID, AppState.DATE_STR);
        window.electronAPI.open_addition_compare_btn(AppState.FACILITY_ID, AppState.DATE_STR);
      } else {
        console.error("❌ [CUSTOM_BUTTONS] window.electronAPI.open_addition_compare_btn が見つかりません");
        console.log("🔍 [CUSTOM_BUTTONS] window.electronAPI:", window.electronAPI);
      }
    } catch (error) {
      console.error("❌ [CUSTOM_BUTTONS] 加算比較ボタンクリック処理でエラー:", error);
    }
  }

    // カスタムアクション1の処理
  async handleCustomAction1(buttonConfig) {
    console.log("🔧 カスタムアクション1を実行");
    console.log("🔍 [CUSTOM_BUTTONS] AppState:", { 
      FACILITY_ID: AppState.FACILITY_ID, 
      DATE_STR: AppState.DATE_STR 
    });

    // 新しいwebviewを作成
    const content = document.getElementById("content");
    const tabsContainer = document.getElementById("tabs");
    const addTabBtn = tabsContainer.querySelector("button:last-child");

    const newId = `hugview-${Date.now()}-${document.querySelectorAll("webview").length}`;
    const newWebview = document.createElement("webview");
    newWebview.id = newId;
    console.log("🔍 日付指定", AppState.DATE_STR);
    // 指定されたURLを設定
    const targetUrl = `https://www.hug-ayumu.link/hug/wm/attendance.php?mode=add&date=${AppState.DATE_STR}&f_id=${AppState.FACILITY_ID}`;
    newWebview.src = targetUrl;
    newWebview.allowpopups = true;
    newWebview.webSecurity = false; // セキュリティ制限を無効化
    newWebview.nodeintegration = false;
    newWebview.style.cssText = "position:absolute;top:0;left:0;width:100%;height:100%;";
    newWebview.classList.add("hidden");
    content.appendChild(newWebview);

    // タブボタンを作成
    const tabButton = document.createElement("button");
    tabButton.innerHTML = `
      ${buttonConfig.text}
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

    // webviewの読み込み完了を待つ
    newWebview.addEventListener("did-finish-load", () => {
      console.log("🔍 [CUSTOM_BUTTONS] webview読み込み完了、select要素を設定中...");
      
      // 少し遅延を入れてからselect要素にアクセス
      setTimeout(() => {
        try {
          if (AppState.SELECT_CHILD) {
            // webview内でJavaScriptを実行してselect要素と備考欄を設定
            const script = `
              (function() {
                let success = true;
                
                // select要素を設定
                const selectElement = document.getElementById("name_list");
                if (selectElement) {
                  selectElement.value = "${AppState.SELECT_CHILD}";
                  console.log("✅ select要素を設定:", "${AppState.SELECT_CHILD}");
                  
                  // onchangeイベントを手動で発火
                  const changeEvent = new Event('change', { bubbles: true });
                  selectElement.dispatchEvent(changeEvent);
                  console.log("✅ onchangeイベントを発火しました");
                } else {
                  console.warn("⚠️ select要素が見つかりません");
                  success = false;
                }
                
                // 備考欄のinput要素を設定
                const noteInput = document.querySelector('input[name="note"]');
                if (noteInput) {
                  noteInput.value = "${AppState.SELECT_PC_NAME || ''}";
                  console.log("✅ 備考欄を設定:", "${AppState.SELECT_PC_NAME || ''}");
                } else {
                  console.warn("⚠️ 備考欄のinput要素が見つかりません");
                  success = false;
                }
                
                return success;
              })();
            `;
            
            newWebview.executeJavaScript(script).then((result) => {
              if (result) {
                console.log(`✅ [CUSTOM_BUTTONS] 設定完了 - 子ども: ${AppState.SELECT_CHILD}, 備考: ${AppState.SELECT_PC_NAME || ''}`);
              } else {
                console.warn("⚠️ [CUSTOM_BUTTONS] 一部の要素の設定に失敗しました");
              }
            }).catch((error) => {
              console.error("❌ [CUSTOM_BUTTONS] executeJavaScriptでエラー:", error);
            });
          } else {
            console.warn("⚠️ [CUSTOM_BUTTONS] SELECT_CHILDが設定されていません");
          }
        } catch (error) {
          console.error("❌ [CUSTOM_BUTTONS] select要素の設定でエラー:", error);
        }
      }, 1000); // 1秒遅延
    });

    // 新しいタブをアクティブにする
    tabButton.click();
    
    console.log(`✅ [CUSTOM_BUTTONS] カスタムアクション1完了: ${targetUrl}`);
  }

  // カスタムボタンのクリック処理
  handleCustomButtonClick(buttonConfig) {
    console.log(`🔧 カスタムボタンがクリックされました: ${buttonConfig.text}`);
    console.log(`📋 ボタン設定:`, buttonConfig);

    // アクションに応じた処理
    switch (buttonConfig.action) {
      case 'customAction1':
        this.handleCustomAction1(buttonConfig);
        break;
      case 'customAction2':
        this.handleCustomAction2(buttonConfig);
        break;
      case 'additionCompare':
        this.handleAdditionCompare(buttonConfig);
        break;
      default:
        this.handleDefaultAction(buttonConfig);
        break;
    }
  }


  // カスタムアクション2の処理
  handleCustomAction2(buttonConfig) {
    console.log("🔧 カスタムアクション2を実行");
    alert(`カスタムアクション2が実行されました！\nボタン: ${buttonConfig.text}\nID: ${buttonConfig.id}`);
    
    // ここに実際の処理を追加
  }


  // デフォルトアクションの処理
  handleDefaultAction(buttonConfig) {
    console.log("🔧 デフォルトアクションを実行");
    alert(`カスタムボタンがクリックされました！\nボタン: ${buttonConfig.text}\nアクション: ${buttonConfig.action}`);
    
    // ここに実際の処理を追加
  }

  // カスタムボタンを再読み込み
  async reloadCustomButtons() {
    console.log("🔄 カスタムボタンを再読み込み中...");
    await loadCustomButtons();
    this.customButtons = getCustomButtons();
    this.generateCustomButtons();
    console.log("✅ カスタムボタンの再読み込み完了");
  }
}

// グローバルインスタンスを作成
export const customButtonManager = new CustomButtonManager();
