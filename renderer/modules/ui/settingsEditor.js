// renderer/modules/ui/settingsEditor.js
import { IniState, saveIni, updateIniSetting } from "../config/ini.js";
import { AppState, saveConfig } from "../config/config.js";
import { 
  CustomButtonsState, 
  loadCustomButtons, 
  loadAvailableActions, 
  saveCustomButtons,
  getCustomButtons,
  getAvailableActions,
  getActionsByCategory,
  addCustomButton,
  updateCustomButton,
  removeCustomButton
} from "../config/customButtons.js";
import { showSuccessToast, showErrorToast, showInfoToast } from "./toast/toast.js";
import { UpdateTabHandler } from "../update/updateTabHandler.js";

export class SettingsEditor {
  constructor() {
    this.modal = null;
    this.originalSettings = null;
    this.modalLoaded = false;
    this.updateTabHandler = null;
    this.init();
  }

  async init() {
    console.log('🔄 [SETTINGS] 設定エディターを初期化中...');
    
    try {
      // 設定を再読み込みして確実に最新の状態にする
      console.log('🔄 [SETTINGS] 設定を再読み込み中...');
      const { loadIni } = await import('../config/ini.js');
      const { loadConfig } = await import('../config/config.js');
      
      await loadIni();
      await loadConfig();
      
      // カスタムボタンと利用可能なアクションを読み込み
      console.log('🔄 [SETTINGS] カスタムボタンを読み込み中...');
      await loadCustomButtons();
      await loadAvailableActions();
      
      console.log('🔍 [SETTINGS] IniState確認:', IniState);
      console.log('🔍 [SETTINGS] AppState確認:', AppState);
      console.log('🔍 [SETTINGS] CustomButtonsState確認:', CustomButtonsState);
      
      // まずイベントリスナーを設定（モーダルは後で読み込む）
      this.setupEventListeners();
      console.log('✅ [SETTINGS] イベントリスナーを設定しました');
      
      // モーダルは初回開く時に読み込む
      console.log('✅ [SETTINGS] 設定エディターの初期化完了');
    } catch (error) {
      console.error('❌ [SETTINGS] 初期化エラー:', error);
      console.error('❌ [SETTINGS] エラーの詳細:', error.stack);
    }
  }

  async loadModal() {
    if (this.modalLoaded) {
      console.log('✅ [SETTINGS] モーダルは既に読み込み済みです');
      return this.modal;
    }

    try {
      console.log('🔄 [SETTINGS] 設定モーダルのHTMLを読み込み中...');
      // 設定モーダルのHTMLを読み込み
      const modalPath = './settings/modal.html';
      console.log('🔍 [SETTINGS] 読み込みパス:', modalPath);
      const response = await fetch(modalPath);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const html = await response.text();
      console.log('✅ [SETTINGS] HTMLファイルを読み込みました');
      
      // モーダル用のコンテナを作成
      const modalContainer = document.createElement('div');
      modalContainer.innerHTML = html;
      
      // モーダルをbodyに追加
      const modalElement = modalContainer.querySelector('#settingsModal');
      if (modalElement) {
        document.body.appendChild(modalElement);
        this.modal = modalElement;
        console.log('✅ [SETTINGS] モーダル要素をDOMに追加しました');
        
        // CSSを読み込み
        const cssPath = './settings/modal.css';
        console.log('🔍 [SETTINGS] CSS読み込みパス:', cssPath);
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = cssPath;
        document.head.appendChild(link);
        console.log('✅ [SETTINGS] CSSファイルを読み込みました');
        
        this.modalLoaded = true;
        console.log('✅ [SETTINGS] 設定モーダルの読み込み完了');
        return this.modal;
      } else {
        console.error('❌ [SETTINGS] #settingsModal要素が見つかりません');
        return null;
      }
    } catch (error) {
      console.error('❌ [SETTINGS] 設定モーダルの読み込みに失敗:', error);
      return null;
    }
  }

  setupEventListeners() {
    // モーダル開閉
    const editSettingsBtn = document.getElementById('Edit-Settings');
    if (editSettingsBtn) {
      console.log('✅ [SETTINGS] Edit-Settingsボタンが見つかりました');
      editSettingsBtn.addEventListener('click', () => {
        console.log('🔘 [SETTINGS] Edit-Settingsボタンがクリックされました');
        this.openModal();
      });
    } else {
      console.error('❌ [SETTINGS] Edit-Settingsボタンが見つかりません');
    }

    // モーダルが読み込まれた後にイベントリスナーを設定
    if (this.modal) {
      this.modal.querySelector('.close').addEventListener('click', () => {
        this.closeModal();
      });

      this.modal.querySelector('#cancel-settings').addEventListener('click', () => {
        this.closeModal();
      });

      // 保存・リセット
      this.modal.querySelector('#save-settings').addEventListener('click', () => {
        this.saveSettings();
      });

      this.modal.querySelector('#reset-settings').addEventListener('click', () => {
        this.resetSettings();
      });

      // カスタムボタン追加
      this.modal.querySelector('#add-custom-button').addEventListener('click', () => {
        this.addCustomButton();
      });

      // Config.json設定のイベントリスナー
      const reloadConfigBtn = this.modal.querySelector('#reload-config');
      if (reloadConfigBtn) {
        reloadConfigBtn.addEventListener('click', async () => {
          await this.reloadConfig();
        });
      }

      const saveConfigBtn = this.modal.querySelector('#save-config');
      if (saveConfigBtn) {
        saveConfigBtn.addEventListener('click', async () => {
          await this.saveConfig();
        });
      }

      // テキスト入力フィールドのイベントリスナー
      this.setupTextInputListeners();

      // パスワード表示切替え
      const togglePasswordBtn = this.modal.querySelector('#toggle-password');
      if (togglePasswordBtn) {
        togglePasswordBtn.addEventListener('click', () => {
          this.togglePasswordVisibility();
        });
      }

      // 施設セレクトボックスの変更イベント
      const facilitySelect = this.modal.querySelector('#config-facility-id');
      if (facilitySelect) {
        facilitySelect.addEventListener('change', async () => {
          await this.filterStaffByFacility();
        });
      }

      // モーダル外クリックで閉じる
      this.modal.addEventListener('click', (e) => {
        if (e.target === this.modal) {
          this.closeModal();
        }
      });

      // アップデートタブのイベントリスナー
      this.updateTabHandler = new UpdateTabHandler(this.modal);
      this.updateTabHandler.setupUpdateTabListeners();
    }
  }

  setupTabs() {
    if (!this.modal) {
      console.warn("⚠️ [SETTINGS] モーダルが存在しないため、タブを設定できません");
      return;
    }

    const tabButtons = this.modal.querySelectorAll('.tab-button');
    const tabContents = this.modal.querySelectorAll('.tab-content');

    console.log(`🔧 [SETTINGS] タブボタン数: ${tabButtons.length}, タブコンテンツ数: ${tabContents.length}`);

    tabButtons.forEach((button, index) => {
      console.log(`🔧 [SETTINGS] タブボタン${index}を設定:`, button.textContent);
      button.addEventListener('click', () => {
        const targetTab = button.getAttribute('data-tab');
        console.log(`🔘 [SETTINGS] タブクリック: ${targetTab}`);
        
        // アクティブタブを切り替え
        tabButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        // タブコンテンツを切り替え
        tabContents.forEach(content => content.classList.remove('active'));
        const targetContent = this.modal.querySelector(`#${targetTab}-tab`);
        if (targetContent) {
          targetContent.classList.add('active');
          console.log(`✅ [SETTINGS] タブ切り替え完了: ${targetTab}`);
        } else {
          console.error(`❌ [SETTINGS] タブコンテンツが見つかりません: #${targetTab}-tab`);
        }
      });
    });
  }

  async openModal() {
    console.log('🔄 [SETTINGS] 設定モーダルを開こうとしています...');
    
    // 設定の状態を確認
    console.log('🔍 [SETTINGS] 現在のIniState:', IniState);
    console.log('🔍 [SETTINGS] 現在のAppState:', AppState);
    console.log('🔍 [SETTINGS] customButtons:', IniState.appSettings.customButtons);
    
    // モーダルが読み込まれていない場合は読み込み
    if (!this.modalLoaded) {
      console.log('🔄 [SETTINGS] モーダルを読み込み中...');
      await this.loadModal();
      this.setupEventListeners();
      this.setupTabs();
    }

    // フォームに現在の値を設定
    console.log('🔄 [SETTINGS] フォームに値を設定中...');
    await this.populateForm();
    
    // セレクトボックスを初期化
    console.log('🔄 [SETTINGS] セレクトボックスを初期化中...');
    await this.initializeSelectBoxes();
    
    // カスタムボタンリストを更新
    console.log('🔄 [SETTINGS] カスタムボタンリストを更新中...');
    this.updateCustomButtonsList();
    
    // カスタムボタンを表示
    console.log('🔄 [SETTINGS] カスタムボタンを表示中...');
    this.applyCustomButtons();
    
    // 新しいカスタムボタン作成UIを初期化
    this.initializeNewButtonUI();
    
    // モーダルを表示
    if (this.modal) {
      this.modal.style.display = 'block';
      console.log('✅ [SETTINGS] 設定モーダルを表示しました');
    } else {
      console.error('❌ [SETTINGS] モーダル要素が見つかりません');
    }
  }

  closeModal() {
    if (this.modal) {
      this.modal.style.display = 'none';
    }
  }

  async populateForm() {
    if (!this.modal) {
      console.error("❌ [SETTINGS] モーダルが存在しません");
      return;
    }

    console.log("🔍 [SETTINGS] フォームに値を設定中...");

    // AppStateは既にインポート済み
    console.log("🔍 [SETTINGS] AppState:", AppState);
    console.log("🔍 [SETTINGS] AppState.HUG_USERNAME:", AppState.HUG_USERNAME);
    console.log("🔍 [SETTINGS] AppState.FACILITY_ID:", AppState.FACILITY_ID);

    // 機能の有効/無効
    const features = IniState.appSettings.features;
    Object.keys(features).forEach(featureName => {
      const checkbox = this.modal.querySelector(`#feature-${featureName}`);
      if (checkbox) {
        checkbox.checked = features[featureName].enabled;
      }
    });

    // ボタンテキスト
    Object.keys(features).forEach(featureName => {
      const textInput = this.modal.querySelector(`#text-${featureName}`);
      if (textInput) {
        textInput.value = features[featureName].buttonText || '';
      }
    });

    // ボタンカラー
    Object.keys(features).forEach(featureName => {
      const colorInput = this.modal.querySelector(`#color-${featureName}`);
      if (colorInput) {
        colorInput.value = features[featureName].buttonColor || '#007bff';
      }
    });

    // UI設定
    const ui = IniState.appSettings.ui;
    const themeSelect = this.modal.querySelector('#theme-select');
    if (themeSelect) {
      themeSelect.value = ui.theme || 'light';
    }
    
    const languageSelect = this.modal.querySelector('#language-select');
    if (languageSelect) {
      languageSelect.value = ui.language || 'ja';
    }
    
    const showCloseButtons = this.modal.querySelector('#show-close-buttons');
    if (showCloseButtons) {
      showCloseButtons.checked = ui.showCloseButtons || false;
    }
    
    const autoRefresh = this.modal.querySelector('#auto-refresh');
    if (autoRefresh) {
      autoRefresh.checked = ui.autoRefresh?.enabled || false;
    }
    
    const refreshInterval = this.modal.querySelector('#refresh-interval');
    if (refreshInterval) {
      refreshInterval.value = ui.autoRefresh?.interval || 30000;
    }

    // ウィンドウ設定
    const window = IniState.appSettings.window;
    const windowWidth = this.modal.querySelector('#window-width');
    if (windowWidth) {
      windowWidth.value = window.width || 1200;
    }
    
    const windowHeight = this.modal.querySelector('#window-height');
    if (windowHeight) {
      windowHeight.value = window.height || 800;
    }
    
    const windowMaximized = this.modal.querySelector('#window-maximized');
    if (windowMaximized) {
      windowMaximized.checked = window.maximized || false;
    }
    
    const windowAlwaysOnTop = this.modal.querySelector('#window-always-on-top');
    if (windowAlwaysOnTop) {
      windowAlwaysOnTop.checked = window.alwaysOnTop || false;
    }

    // Config.json設定
    console.log("🔄 [SETTINGS] Config.json設定をフォームに設定中...");
    console.log("🔍 [SETTINGS] AppState全体:", AppState);
    console.log("🔍 [SETTINGS] HUG_USERNAME:", AppState.HUG_USERNAME);
    console.log("🔍 [SETTINGS] HUG_PASSWORD:", AppState.HUG_PASSWORD ? "***" : "空");
    console.log("🔍 [SETTINGS] VITE_API_BASE_URL:", AppState.VITE_API_BASE_URL);
    console.log("🔍 [SETTINGS] STAFF_ID:", AppState.STAFF_ID);
    console.log("🔍 [SETTINGS] FACILITY_ID:", AppState.FACILITY_ID);
    
    const configUsername = this.modal.querySelector('#config-username');
    if (configUsername) {
      configUsername.value = AppState.HUG_USERNAME || '';
      console.log("🔍 [SETTINGS] HUG_USERNAME設定:", configUsername.value);
    } else {
      console.warn("⚠️ [SETTINGS] config-username要素が見つかりません");
    }
    
    const configPassword = this.modal.querySelector('#config-password');
    if (configPassword) {
      configPassword.value = AppState.HUG_PASSWORD || '';
      console.log("🔍 [SETTINGS] HUG_PASSWORD設定:", configPassword.value ? "***" : "空");
    } else {
      console.warn("⚠️ [SETTINGS] config-password要素が見つかりません");
    }
    
    const configApiUrl = this.modal.querySelector('#config-api-url');
    if (configApiUrl) {
      configApiUrl.value = AppState.VITE_API_BASE_URL || '';
      console.log("🔍 [SETTINGS] VITE_API_BASE_URL設定:", configApiUrl.value);
    } else {
      console.warn("⚠️ [SETTINGS] config-api-url要素が見つかりません");
    }
    
    const configStaffId = this.modal.querySelector('#config-staff-id');
    if (configStaffId) {
      configStaffId.value = AppState.STAFF_ID || '';
      console.log("🔍 [SETTINGS] STAFF_ID設定:", configStaffId.value);
    } else {
      console.warn("⚠️ [SETTINGS] config-staff-id要素が見つかりません");
    }
    
    const configFacilityId = this.modal.querySelector('#config-facility-id');
    if (configFacilityId) {
      configFacilityId.value = AppState.FACILITY_ID || '';
      console.log("🔍 [SETTINGS] FACILITY_ID設定:", configFacilityId.value);
    } else {
      console.warn("⚠️ [SETTINGS] config-facility-id要素が見つかりません");
    }
  }

  updateCustomButtonsList() {
    if (!this.modal) return;

    console.log("🔍 [SETTINGS] カスタムボタンリストを更新中...");
    console.log("🔍 [SETTINGS] CustomButtonsState.customButtons:", CustomButtonsState.customButtons);

    const container = this.modal.querySelector('#custom-buttons-list');
    if (!container) {
      console.error("❌ [SETTINGS] custom-buttons-listコンテナが見つかりません");
      return;
    }
    container.innerHTML = '';

    // カスタムボタンを順番でソート
    const sortedButtons = [...CustomButtonsState.customButtons].sort((a, b) => (a.order || 0) - (b.order || 0));

    // 各ボタンの詳細を確認
    sortedButtons.forEach((button, index) => {
      console.log(`🔍 [SETTINGS] ボタン${index}詳細:`, {
        id: button.id,
        enabled: button.enabled,
        text: button.text,
        action: button.action,
        color: button.color,
        order: button.order
      });

      // アクション情報を取得
      const action = CustomButtonsState.availableActions.find(a => a.id === button.action);
      const actionName = action ? action.name : button.action;
      const actionDescription = action ? action.description : '';
      const actionIcon = action ? action.icon : '🔧';

       const buttonDiv = document.createElement('div');
       buttonDiv.className = 'custom-button-item';
       buttonDiv.style.marginBottom = '15px';
       buttonDiv.style.padding = '15px';
       buttonDiv.style.border = '1px solid #ddd';
       buttonDiv.style.borderRadius = '8px';
       buttonDiv.style.backgroundColor = '#f9f9f9';
       buttonDiv.innerHTML = `
         <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
           <h4 style="margin: 0; color: #333;">${actionIcon} ${button.text || 'カスタムボタン'}</h4>
           <button class="btn-danger remove-custom-button" data-index="${index}" style="padding: 5px 10px; font-size: 12px;">削除</button>
         </div>
         <div class="setting-item" style="margin-bottom: 10px;">
           <label style="display: flex; align-items: center; gap: 8px;">
             <input type="checkbox" class="custom-button-enabled" data-index="${index}" ${button.enabled ? 'checked' : ''}>
             <span>有効</span>
           </label>
         </div>
         <div class="setting-item" style="margin-bottom: 10px;">
           <label style="display: block; margin-bottom: 5px; font-weight: bold;">テキスト:</label>
           <input type="text" class="custom-button-text" data-index="${index}" value="${button.text || ''}" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
         </div>
         <div class="setting-item" style="margin-bottom: 10px;">
           <label style="display: block; margin-bottom: 5px; font-weight: bold;">カラー:</label>
           <input type="color" class="custom-button-color" data-index="${index}" value="${button.color || '#007bff'}" style="width: 60px; height: 40px; border: 1px solid #ccc; border-radius: 4px;">
         </div>
         <div class="setting-item" style="margin-bottom: 10px;">
           <label style="display: block; margin-bottom: 5px; font-weight: bold;">順番:</label>
           <input type="number" class="custom-button-order" data-index="${index}" value="${button.order || index + 1}" min="1" style="width: 80px; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
         </div>
         <div class="setting-item" style="margin-bottom: 10px;">
           <label style="display: block; margin-bottom: 5px; font-weight: bold;">アクション:</label>
           <div style="display: flex; align-items: center; gap: 10px; padding: 8px; border: 1px solid #ccc; border-radius: 4px; background-color: #f5f5f5;">
             <span style="font-size: 18px;">${actionIcon}</span>
             <div>
               <div style="font-weight: bold; color: #333;">${actionName}</div>
               <div style="font-size: 12px; color: #666;">${actionDescription}</div>
             </div>
           </div>
         </div>
       `;
      container.appendChild(buttonDiv);
    });

     // イベントリスナーを追加
     const handleInputChange = (e) => {
       console.log("🔍 [SETTINGS] 入力変更検出:", e.target.className, e.target.value);
       
       if (e.target.classList.contains('custom-button-enabled')) {
         const index = parseInt(e.target.getAttribute('data-index'));
         updateCustomButton(index, { enabled: e.target.checked });
         console.log(`✅ [SETTINGS] ボタン${index}の有効状態を更新:`, e.target.checked);
       } else if (e.target.classList.contains('custom-button-text')) {
         const index = parseInt(e.target.getAttribute('data-index'));
         updateCustomButton(index, { text: e.target.value });
         console.log(`✅ [SETTINGS] ボタン${index}のテキストを更新:`, e.target.value);
       } else if (e.target.classList.contains('custom-button-color')) {
         const index = parseInt(e.target.getAttribute('data-index'));
         updateCustomButton(index, { color: e.target.value });
         console.log(`✅ [SETTINGS] ボタン${index}のカラーを更新:`, e.target.value);
       } else if (e.target.classList.contains('custom-button-order')) {
         const index = parseInt(e.target.getAttribute('data-index'));
         updateCustomButton(index, { order: parseInt(e.target.value) });
         console.log(`✅ [SETTINGS] ボタン${index}の順番を更新:`, e.target.value);
       }
     };

     // inputとchangeイベントの両方にリスナーを追加
     container.addEventListener('input', handleInputChange);
     container.addEventListener('change', handleInputChange);

    container.addEventListener('click', (e) => {
      if (e.target.classList.contains('remove-custom-button')) {
        const index = parseInt(e.target.getAttribute('data-index'));
        removeCustomButton(index);
        this.updateCustomButtonsList();
      }
    });
  }

  // 新しいカスタムボタン作成UIを初期化
  initializeNewButtonUI() {
    console.log('🔄 [SETTINGS] 新しいカスタムボタン作成UIを初期化中...');
    
    // アクション選択ドロップダウンを初期化
    this.populateActionDropdown();
    
    // イベントリスナーを設定
    this.setupNewButtonEventListeners();
  }

  // アクション選択ドロップダウンを初期化
  populateActionDropdown() {
    const actionSelect = this.modal.querySelector('#new-button-action');
    if (!actionSelect) {
      console.error('❌ [SETTINGS] new-button-action要素が見つかりません');
      return;
    }

    // 既存のオプションをクリア（最初のオプション以外）
    actionSelect.innerHTML = '<option value="">アクションを選択してください</option>';

    // カテゴリ別にアクションをグループ化
    const actionsByCategory = getActionsByCategory();
    
    Object.keys(actionsByCategory).forEach(category => {
      const optgroup = document.createElement('optgroup');
      optgroup.label = category;
      
      actionsByCategory[category].forEach(action => {
        const option = document.createElement('option');
        option.value = action.id;
        option.textContent = `${action.icon} ${action.name}`;
        option.title = action.description;
        optgroup.appendChild(option);
      });
      
      actionSelect.appendChild(optgroup);
    });

    console.log('✅ [SETTINGS] アクション選択ドロップダウンを初期化しました');
  }

  // 新しいボタン作成のイベントリスナーを設定
  setupNewButtonEventListeners() {
    const createButton = this.modal.querySelector('#create-custom-button');
    const actionSelect = this.modal.querySelector('#new-button-action');
    const textInput = this.modal.querySelector('#new-button-text');
    const colorInput = this.modal.querySelector('#new-button-color');

    if (!createButton || !actionSelect || !textInput || !colorInput) {
      console.error('❌ [SETTINGS] 新しいボタン作成UIの要素が見つかりません');
      return;
    }

    // アクション選択時にテキストを自動入力
    actionSelect.addEventListener('change', (e) => {
      const selectedAction = CustomButtonsState.availableActions.find(a => a.id === e.target.value);
      if (selectedAction && !textInput.value) {
        textInput.value = selectedAction.name;
      }
    });

    // 作成ボタンのクリックイベント
    createButton.addEventListener('click', () => {
      const actionId = actionSelect.value;
      const text = textInput.value.trim();
      const color = colorInput.value;

      if (!actionId) {
        showErrorToast('アクションを選択してください');
        return;
      }

      if (!text) {
        showErrorToast('ボタンのテキストを入力してください');
        return;
      }

      // カスタムボタンを追加
      const success = addCustomButton(actionId, text, color);
      if (success) {
        this.updateCustomButtonsList();
        showSuccessToast('カスタムボタンを作成しました');
        
        // フォームをリセット
        actionSelect.value = '';
        textInput.value = '';
        colorInput.value = '#007bff';
      } else {
        showErrorToast('カスタムボタンの作成に失敗しました');
      }
    });
  }

  addCustomButton() {
    // デフォルトのアクションを選択（最初の利用可能なアクション）
    const defaultAction = CustomButtonsState.availableActions[0];
    if (!defaultAction) {
      console.error('❌ [SETTINGS] 利用可能なアクションがありません');
      showErrorToast('利用可能なアクションがありません');
      return;
    }

    addCustomButton(defaultAction.id, '新しいボタン', '#007bff');
    this.updateCustomButtonsList();
  }

  async saveSettings() {
    try {
      // フォームの値をIniStateに反映
      this.updateIniStateFromForm();
      
      // ini.jsonに保存
      const iniSuccess = await saveIni();
      
      // カスタムボタンを保存
      const customButtonsSuccess = await saveCustomButtons();
      
      if (iniSuccess && customButtonsSuccess) {
        showSuccessToast('✅ 設定を保存しました');
        this.closeModal();
        
        // UIに反映
        this.applyAllSettings();
      } else {
        showErrorToast('❌ 設定の保存に失敗しました');
      }
    } catch (error) {
      console.error('設定保存エラー:', error);
      showErrorToast('❌ 設定の保存中にエラーが発生しました');
    }
  }

  updateIniStateFromForm() {
    if (!this.modal) return;

    // 機能の有効/無効
    const features = IniState.appSettings.features;
    Object.keys(features).forEach(featureName => {
      const checkbox = this.modal.querySelector(`#feature-${featureName}`);
      if (checkbox) {
        features[featureName].enabled = checkbox.checked;
      }
    });

    // ボタンテキスト
    Object.keys(features).forEach(featureName => {
      const textInput = this.modal.querySelector(`#text-${featureName}`);
      if (textInput) {
        features[featureName].buttonText = textInput.value;
      }
    });

    // ボタンカラー
    Object.keys(features).forEach(featureName => {
      const colorInput = this.modal.querySelector(`#color-${featureName}`);
      if (colorInput) {
        features[featureName].buttonColor = colorInput.value;
      }
    });

    // UI設定
    IniState.appSettings.ui.theme = this.modal.querySelector('#theme-select').value;
    IniState.appSettings.ui.language = this.modal.querySelector('#language-select').value;
    IniState.appSettings.ui.showCloseButtons = this.modal.querySelector('#show-close-buttons').checked;
    IniState.appSettings.ui.autoRefresh.enabled = this.modal.querySelector('#auto-refresh').checked;
    IniState.appSettings.ui.autoRefresh.interval = parseInt(this.modal.querySelector('#refresh-interval').value);

    // ウィンドウ設定
    IniState.appSettings.window.width = parseInt(this.modal.querySelector('#window-width').value);
    IniState.appSettings.window.height = parseInt(this.modal.querySelector('#window-height').value);
    IniState.appSettings.window.maximized = this.modal.querySelector('#window-maximized').checked;
    IniState.appSettings.window.alwaysOnTop = this.modal.querySelector('#window-always-on-top').checked;
  }

  // 統合された設定反映関数
  applyAllSettings() {
    console.log('🔄 [SETTINGS] 全設定を適用中...');
    
    try {
      // 1. UI設定の適用
      this.applyUISettings();
      
      // 2. ボタンの表示/非表示とスタイル更新
      this.applyButtonSettings();
      
      // 3. カスタムボタンの適用
      this.applyCustomButtons();
      
      console.log('✅ [SETTINGS] 全設定の適用完了');
    } catch (error) {
      console.error('❌ [SETTINGS] 設定適用エラー:', error);
    }
  }

  // UI設定の適用
  applyUISettings() {
    const ui = IniState.appSettings.ui;
    
    // 閉じるボタンの表示/非表示
    const showCloseButtons = ui.showCloseButtons;
    document.querySelectorAll('.close-btn').forEach(btn => {
      btn.style.display = showCloseButtons ? 'inline' : 'none';
    });

    // テーマの適用
    const theme = ui.theme;
    document.body.className = theme === 'dark' ? 'dark-theme' : '';
    
    console.log('✅ [SETTINGS] UI設定を適用しました');
  }

  // ボタン設定の適用
  applyButtonSettings() {
    const features = IniState.appSettings.features;
    
    // ボタンIDのマッピング
    const buttonMappings = {
      'individualSupportPlan': 'Individual_Support_Button',
      'specializedSupportPlan': 'Specialized-Support-Plan',
      'importSetting': 'Import-Setting',
      'getUrl': 'Get-Url',
      'loadIni': 'Load-Ini'
    };
    
    // 各ボタンの表示/非表示とスタイルを制御
    Object.keys(buttonMappings).forEach(featureName => {
      const buttonId = buttonMappings[featureName];
      const button = document.getElementById(buttonId);
      
      if (button) {
        const feature = features[featureName];
        if (feature) {
          // ボタンの表示/非表示を制御
          button.style.display = feature.enabled ? 'inline-block' : 'none';
          
          // ボタンテキストとカラーを更新
          if (feature.buttonText) {
            button.textContent = feature.buttonText;
          }
          if (feature.buttonColor) {
            button.style.backgroundColor = feature.buttonColor;
          }
          
          console.log(`🔧 [SETTINGS] ボタン設定適用: ${buttonId}, 有効: ${feature.enabled}`);
        }
      } else {
        console.warn(`⚠️ [SETTINGS] ボタンが見つかりません: ${buttonId}`);
      }
    });
    
    console.log('✅ [SETTINGS] ボタン設定を適用しました');
  }

  // カスタムボタンの適用
  applyCustomButtons() {
    console.log("🔍 [SETTINGS] カスタムボタン適用開始");
    console.log("🔍 [SETTINGS] CustomButtonsState.customButtons:", CustomButtonsState.customButtons);
    
    // 新しいシステムからカスタムボタンを取得
    const customButtons = getCustomButtons();
    console.log("🔍 [SETTINGS] 有効なカスタムボタン:", customButtons);
    console.log("🔍 [SETTINGS] 有効なボタン数:", customButtons.length);
    
    // カスタムボタンのコンテナを取得（設定モーダル用）
    const customButtonsList = document.getElementById('custom-buttons-list');
    
    if (!customButtonsList) {
      console.error("❌ [SETTINGS] custom-buttons-listコンテナが見つかりません");
      return;
    }
    
    // 既存のカスタムボタンをクリア
    customButtonsList.innerHTML = '';
    
    // カスタムボタンを生成
    customButtons.forEach((button, index) => {
      console.log(`🔍 [SETTINGS] ボタン${index}を生成:`, button);
      
      const buttonContainer = document.createElement('div');
      buttonContainer.className = 'custom-button-item';
      buttonContainer.style.marginBottom = '10px';
      buttonContainer.style.padding = '10px';
      buttonContainer.style.border = '1px solid #ddd';
      buttonContainer.style.borderRadius = '4px';
      buttonContainer.style.backgroundColor = '#f9f9f9';
      
      const buttonElement = document.createElement('button');
      buttonElement.className = 'custom-button';
      buttonElement.textContent = button.text || 'カスタムボタン';
      buttonElement.style.backgroundColor = button.color || '#007bff';
      buttonElement.style.color = '#ffffff';
      buttonElement.style.border = 'none';
      buttonElement.style.padding = '8px 16px';
      buttonElement.style.margin = '4px';
      buttonElement.style.borderRadius = '4px';
      buttonElement.style.cursor = 'pointer';
      
      // ボタン情報を表示
      const buttonInfo = document.createElement('div');
      buttonInfo.style.fontSize = '12px';
      buttonInfo.style.color = '#666';
      buttonInfo.style.marginTop = '5px';
      buttonInfo.innerHTML = `
        <strong>ID:</strong> ${button.id}<br>
        <strong>アクション:</strong> ${button.action}<br>
        <strong>位置:</strong> ${button.position}
      `;
      
      // アクション設定
      if (button.action) {
        buttonElement.addEventListener('click', () => {
          console.log(`🔘 [SETTINGS] カスタムボタンクリック: ${button.action}`);
          this.executeCustomAction(button.action);
        });
      }
      
      buttonContainer.appendChild(buttonElement);
      buttonContainer.appendChild(buttonInfo);
      customButtonsList.appendChild(buttonContainer);
    });
    
    console.log(`✅ [SETTINGS] カスタムボタン${customButtons.length}個を適用しました`);
  }

  // カスタムアクションの実行
  executeCustomAction(action) {
    try {
      // カスタムアクションの実行ロジック
      console.log(`🚀 [SETTINGS] カスタムアクション実行: ${action}`);
      
      // 特定のアクションに応じた処理
      switch (action) {
        case 'additionCompare':
          console.log("🔘 [SETTINGS] 加算比較ボタンがクリックされました");
          this.handleAdditionCompare();
          break;
        case 'customAction1':
          showInfoToast('カスタムアクション1が実行されました');
          break;
        case 'customAction2':
          showInfoToast('カスタムアクション2が実行されました');
          break;
        default:
          showInfoToast(`カスタムアクション: ${action}`);
          break;
      }
    } catch (error) {
      console.error('❌ [SETTINGS] カスタムアクション実行エラー:', error);
      showErrorToast('カスタムアクションの実行に失敗しました');
    }
  }

  // 加算比較ボタンの処理
  handleAdditionCompare() {
    console.log("🔘 [SETTINGS] 加算比較ボタンがクリックされました");
    
    // AppStateをインポート
    import('../config/config.js').then(({ AppState }) => {
      console.log("🔍 [SETTINGS] AppState:", { 
        FACILITY_ID: AppState.FACILITY_ID, 
        DATE_STR: AppState.DATE_STR 
      });
      
      try {
        if (window.electronAPI && window.electronAPI.open_addition_compare_btn) {
          console.log("📤 [SETTINGS] electronAPI.open_addition_compare_btn を呼び出します");
          console.log("📤 [SETTINGS] 引数:", AppState.FACILITY_ID, AppState.DATE_STR);
          window.electronAPI.open_addition_compare_btn(AppState.FACILITY_ID, AppState.DATE_STR);
          showInfoToast('加算比較ウィンドウを開いています...');
        } else {
          console.error("❌ [SETTINGS] window.electronAPI.open_addition_compare_btn が見つかりません");
          console.log("🔍 [SETTINGS] window.electronAPI:", window.electronAPI);
          showErrorToast('加算比較機能が利用できません');
        }
      } catch (error) {
        console.error("❌ [SETTINGS] 加算比較ボタンクリック処理でエラー:", error);
        showErrorToast('加算比較の実行に失敗しました');
      }
    }).catch(error => {
      console.error("❌ [SETTINGS] AppStateの読み込みエラー:", error);
      showErrorToast('設定の読み込みに失敗しました');
    });
  }

  resetSettings() {
    if (confirm('設定をデフォルトにリセットしますか？')) {
      // バックアップから復元
      if (this.originalSettings) {
        Object.assign(IniState, this.originalSettings);
        this.populateForm();
        this.updateCustomButtonsList();
      }
    }
  }

  // Config.json設定の処理
  async reloadConfig() {
    try {
      console.log('🔄 [SETTINGS] Config.jsonを再読み込み中...');
      // 設定の再読み込みは mainRenderer.js で処理される
      showSuccessToast('✅ Config.jsonの再読み込みが完了しました');
    } catch (error) {
      console.error('❌ [SETTINGS] Config.json再読み込みエラー:', error);
      showErrorToast('❌ エラーが発生しました: ' + error.message);
    }
  }

  async saveConfig() {
    try {
      console.log('🔄 [SETTINGS] Config.jsonを保存中...');
      
      // フォームから値を取得
      const configData = {
        HUG_USERNAME: this.modal.querySelector('#config-username').value,
        HUG_PASSWORD: this.modal.querySelector('#config-password').value,
        VITE_API_BASE_URL: this.modal.querySelector('#config-api-url').value,
        STAFF_ID: this.modal.querySelector('#config-staff-id').value,
        FACILITY_ID: this.modal.querySelector('#config-facility-id').value
      };

      // AppStateを更新
      Object.assign(AppState, configData);

      // ファイルに保存
             const success = await saveConfig();
             if (success) {
               showSuccessToast('✅ Config.jsonの保存が完了しました');
               console.log('✅ [SETTINGS] Config.json保存成功');
             } else {
               showErrorToast('❌ Config.jsonの保存に失敗しました');
               console.error('❌ [SETTINGS] Config.json保存失敗');
             }
    } catch (error) {
      console.error('❌ [SETTINGS] Config.json保存エラー:', error);
      showErrorToast('❌ エラーが発生しました: ' + error.message);
    }
  }

  // セレクトボックスの初期化
  async initializeSelectBoxes() {
    if (!this.modal) return;

    try {
      // スタッフと施設のデータを取得
      const data = await window.electronAPI.getStaffAndFacility();
      
      // スタッフセレクトボックスを初期化
      const staffSelect = this.modal.querySelector('#config-staff-id');
      if (staffSelect && data.staffs) {
        // 既存のオプションをクリア（最初の「選択してください」以外）
        while (staffSelect.children.length > 1) {
          staffSelect.removeChild(staffSelect.lastChild);
        }
        
        // スタッフデータを追加
        data.staffs.forEach(staff => {
          const option = document.createElement('option');
          option.value = staff.staff_id;
          option.textContent = staff.staff_name;
          staffSelect.appendChild(option);
        });
        
        console.log('✅ [SETTINGS] スタッフセレクトボックスを初期化しました');
      }
      
      // 施設セレクトボックスを初期化
      const facilitySelect = this.modal.querySelector('#config-facility-id');
      if (facilitySelect && data.facilitys) {
        // 既存のオプションをクリア（最初の「選択してください」以外）
        while (facilitySelect.children.length > 1) {
          facilitySelect.removeChild(facilitySelect.lastChild);
        }
        
        // 施設データを追加
        data.facilitys.forEach(facility => {
          const option = document.createElement('option');
          option.value = facility.id;
          option.textContent = facility.name;
          facilitySelect.appendChild(option);
        });
        
        console.log('✅ [SETTINGS] 施設セレクトボックスを初期化しました');
      }
      
      // 現在の値を設定
      this.populateSelectBoxes();
      
    } catch (error) {
      console.error('❌ [SETTINGS] セレクトボックス初期化エラー:', error);
    }
  }

  // セレクトボックスの値を設定
  populateSelectBoxes() {
    if (!this.modal) return;

    // スタッフIDの設定
    const staffSelect = this.modal.querySelector('#config-staff-id');
    if (staffSelect) {
      const currentStaffId = AppState.STAFF_ID;
      if (currentStaffId) {
        staffSelect.value = currentStaffId;
      }
    }
    
    // 施設IDの設定
    const facilitySelect = this.modal.querySelector('#config-facility-id');
    if (facilitySelect) {
      const currentFacilityId = AppState.FACILITY_ID;
      if (currentFacilityId) {
        facilitySelect.value = currentFacilityId;
      }
    }
  }

  // パスワード表示切替え
  togglePasswordVisibility() {
    const passwordInput = this.modal.querySelector('#config-password');
    const toggleBtn = this.modal.querySelector('#toggle-password');
    
    if (passwordInput && toggleBtn) {
      if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleBtn.textContent = '🙈';
        toggleBtn.title = 'パスワードを隠す';
      } else {
        passwordInput.type = 'password';
        toggleBtn.textContent = '👁️';
        toggleBtn.title = 'パスワードを表示';
      }
    }
  }

  // 施設IDに基づいてスタッフをフィルタリング
  async filterStaffByFacility() {
    if (!this.modal) return;

    const facilitySelect = this.modal.querySelector('#config-facility-id');
    const staffSelect = this.modal.querySelector('#config-staff-id');
    
    if (!facilitySelect || !staffSelect) return;

    const selectedFacilityId = facilitySelect.value;
    console.log('🔍 [SETTINGS] 選択された施設ID:', selectedFacilityId);

    // 施設が選択されていない場合は全てのスタッフを表示
    if (!selectedFacilityId || selectedFacilityId === '') {
      this.showAllStaff();
      return;
    }

    // スタッフデータを取得（AppStateから、またはAPIから直接取得）
    let staffData = AppState.STAFF_DATA || [];
    console.log('👥 [SETTINGS] AppState.STAFF_DATA:', staffData);
    console.log('🔍 [SETTINGS] AppState.STAFF_DATA の長さ:', staffData.length);
    
    // スタッフデータが空の場合はAPIから再取得
    if (staffData.length === 0) {
      console.log('🔄 [SETTINGS] スタッフデータが空のため、APIから再取得します');
      try {
        const data = await window.electronAPI.getStaffAndFacility();
        staffData = data.staffs || [];
        AppState.STAFF_DATA = staffData;
        console.log('✅ [SETTINGS] APIからスタッフデータを再取得しました:', staffData);
      } catch (error) {
        console.error('❌ [SETTINGS] スタッフデータの再取得に失敗:', error);
        return;
      }
    }

    // 選択された施設IDに基づいてスタッフをフィルタリング
    const filteredStaff = staffData.filter(staff => {
      if (!staff.facility_ids) return false;
      
      // facility_idsをカンマ区切りで分割して配列に変換
      const facilityIds = staff.facility_ids.split(',').map(id => id.trim());
      console.log(`👤 [SETTINGS] スタッフ ${staff.staff_name} の施設ID:`, facilityIds);
      
      // 選択された施設IDが含まれているかチェック
      const isIncluded = facilityIds.includes(selectedFacilityId);
      console.log(`✅ [SETTINGS] スタッフ ${staff.staff_name} は施設 ${selectedFacilityId} に所属:`, isIncluded);
      
      return isIncluded;
    });

    console.log('🔍 [SETTINGS] フィルタリング後のスタッフ:', filteredStaff);

    // スタッフセレクトボックスの選択肢を更新
    this.updateStaffSelectOptions(filteredStaff);
  }

  // 全てのスタッフを表示
  async showAllStaff() {
    if (!this.modal) return;

    let staffData = AppState.STAFF_DATA || [];
    
    // スタッフデータが空の場合はAPIから再取得
    if (staffData.length === 0) {
      console.log('🔄 [SETTINGS] スタッフデータが空のため、APIから再取得します');
      try {
        const data = await window.electronAPI.getStaffAndFacility();
        staffData = data.staffs || [];
        AppState.STAFF_DATA = staffData;
        console.log('✅ [SETTINGS] APIからスタッフデータを再取得しました:', staffData);
      } catch (error) {
        console.error('❌ [SETTINGS] スタッフデータの再取得に失敗:', error);
        return;
      }
    }
    
    this.updateStaffSelectOptions(staffData);
    console.log('👥 [SETTINGS] 全てのスタッフを表示しました');
  }

  // スタッフセレクトボックスの選択肢を更新
  updateStaffSelectOptions(staffList) {
    if (!this.modal) return;

    const staffSelect = this.modal.querySelector('#config-staff-id');
    if (!staffSelect) return;

    // 現在の選択値を保存
    const currentValue = staffSelect.value;

    // 既存のオプションをクリア（最初の「選択してください」以外）
    while (staffSelect.children.length > 1) {
      staffSelect.removeChild(staffSelect.lastChild);
    }

    // フィルタリングされたスタッフデータを追加
    staffList.forEach(staff => {
      const option = document.createElement('option');
      option.value = staff.staff_id;
      option.textContent = staff.staff_name;
      staffSelect.appendChild(option);
    });

    // 現在の選択値が新しいリストに含まれている場合は復元
    if (currentValue && staffList.some(staff => staff.staff_id === currentValue)) {
      staffSelect.value = currentValue;
    } else {
      // 含まれていない場合は最初のオプションを選択
      staffSelect.selectedIndex = 0;
    }

    console.log(`✅ [SETTINGS] スタッフセレクトボックスを更新しました (${staffList.length}件)`);
  }

  // テキスト入力フィールドのイベントリスナーを設定
  setupTextInputListeners() {
    if (!this.modal) return;

    // ボタンテキスト入力フィールド
    const features = IniState.appSettings.features;
    Object.keys(features).forEach(featureName => {
      const textInput = this.modal.querySelector(`#text-${featureName}`);
      if (textInput) {
        textInput.addEventListener('input', (e) => {
          const newValue = e.target.value;
          console.log(`🔧 [SETTINGS] ${featureName}のテキストを変更: ${newValue}`);
          
          // リアルタイムで設定を更新
          this.updateFeatureSetting(featureName, 'buttonText', newValue);
        });
      }
    });

    // ボタンカラー入力フィールド
    Object.keys(features).forEach(featureName => {
      const colorInput = this.modal.querySelector(`#color-${featureName}`);
      if (colorInput) {
        colorInput.addEventListener('change', (e) => {
          const newValue = e.target.value;
          console.log(`🔧 [SETTINGS] ${featureName}のカラーを変更: ${newValue}`);
          
          // リアルタイムで設定を更新
          this.updateFeatureSetting(featureName, 'buttonColor', newValue);
        });
      }
    });
  }

  // 機能設定を更新
  updateFeatureSetting(featureName, property, value) {
    if (IniState.appSettings.features[featureName]) {
      IniState.appSettings.features[featureName][property] = value;
      console.log(`✅ [SETTINGS] ${featureName}.${property}を更新: ${value}`);
    }
  }
}

export function initSettingsEditor() {
  return new SettingsEditor();
}

// 統合された設定反映関数をエクスポート（他のファイルからも使用可能）
export function applyAllSettings() {
  // グローバルな設定エディターインスタンスが存在する場合
  if (window.settingsEditor && typeof window.settingsEditor.applyAllSettings === 'function') {
    window.settingsEditor.applyAllSettings();
  } else {
    console.warn('⚠️ [SETTINGS] 設定エディターインスタンスが見つかりません');
  }
}
