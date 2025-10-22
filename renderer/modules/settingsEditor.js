// renderer/modules/settingsEditor.js
import { IniState, saveIni, updateIniSetting } from "./ini.js";
import { AppState, loadAllReload, saveConfig } from "./config.js";
import { showSuccessToast, showErrorToast, showInfoToast } from "./toast/toast.js";

export class SettingsEditor {
  constructor() {
    this.modal = null;
    this.originalSettings = null;
    this.modalLoaded = false;
    this.init();
  }

  async init() {
    console.log('🔄 [SETTINGS] 設定エディターを初期化中...');
    
    try {
      // まずイベントリスナーを設定（モーダルは後で読み込む）
      this.setupEventListeners();
      console.log('✅ [SETTINGS] イベントリスナーを設定しました');
      
      // モーダルは初回開く時に読み込む
      console.log('✅ [SETTINGS] 設定エディターの初期化完了');
    } catch (error) {
      console.error('❌ [SETTINGS] 初期化エラー:', error);
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

      // パスワード表示切替え
      const togglePasswordBtn = this.modal.querySelector('#toggle-password');
      if (togglePasswordBtn) {
        togglePasswordBtn.addEventListener('click', () => {
          this.togglePasswordVisibility();
        });
      }

      // モーダル外クリックで閉じる
      this.modal.addEventListener('click', (e) => {
        if (e.target === this.modal) {
          this.closeModal();
        }
      });
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
    
    // モーダルが読み込まれていない場合は読み込み
    if (!this.modalLoaded) {
      console.log('🔄 [SETTINGS] モーダルを読み込み中...');
      await this.loadModal();
      this.setupEventListeners();
      this.setupTabs();
    }


    
    // フォームに現在の値を設定
    console.log('🔄 [SETTINGS] フォームに値を設定中...');
    this.populateForm();
    
    // カスタムボタンリストを更新
    console.log('🔄 [SETTINGS] カスタムボタンリストを更新中...');
    this.updateCustomButtonsList();
    
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

  populateForm() {
    if (!this.modal) return;

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
    const configUsername = this.modal.querySelector('#config-username');
    if (configUsername) {
      configUsername.value = AppState.HUG_USERNAME || '';
    }
    
    const configPassword = this.modal.querySelector('#config-password');
    if (configPassword) {
      configPassword.value = AppState.HUG_PASSWORD || '';
    }
    
    const configApiUrl = this.modal.querySelector('#config-api-url');
    if (configApiUrl) {
      configApiUrl.value = AppState.VITE_API_BASE_URL || '';
    }
    
    const configStaffId = this.modal.querySelector('#config-staff-id');
    if (configStaffId) {
      configStaffId.value = AppState.STAFF_ID || '';
    }
    
    const configFacilityId = this.modal.querySelector('#config-facility-id');
    if (configFacilityId) {
      configFacilityId.value = AppState.FACILITY_ID || '';
    }
  }

  updateCustomButtonsList() {
    if (!this.modal) return;

    const container = this.modal.querySelector('#custom-buttons-list');
    container.innerHTML = '';

    IniState.appSettings.customButtons.forEach((button, index) => {
      const buttonDiv = document.createElement('div');
      buttonDiv.className = 'custom-button-item';
      buttonDiv.innerHTML = `
        <div class="setting-item">
          <label>
            <input type="checkbox" class="custom-button-enabled" data-index="${index}" ${button.enabled ? 'checked' : ''}>
            <span>有効</span>
          </label>
        </div>
        <div class="setting-item">
          <label>テキスト:</label>
          <input type="text" class="custom-button-text" data-index="${index}" value="${button.text || ''}">
        </div>
        <div class="setting-item">
          <label>カラー:</label>
          <input type="color" class="custom-button-color" data-index="${index}" value="${button.color || '#007bff'}">
        </div>
        <div class="setting-item">
          <label>アクション:</label>
          <input type="text" class="custom-button-action" data-index="${index}" value="${button.action || ''}">
        </div>
        <div class="setting-item">
          <label>位置:</label>
          <select class="custom-button-position" data-index="${index}">
            <option value="top" ${button.position === 'top' ? 'selected' : ''}>上部</option>
            <option value="bottom" ${button.position === 'bottom' ? 'selected' : ''}>下部</option>
          </select>
        </div>
        <button class="btn-danger remove-custom-button" data-index="${index}">削除</button>
      `;
      container.appendChild(buttonDiv);
    });

    // イベントリスナーを追加
    container.addEventListener('change', (e) => {
      if (e.target.classList.contains('custom-button-enabled')) {
        const index = parseInt(e.target.getAttribute('data-index'));
        IniState.appSettings.customButtons[index].enabled = e.target.checked;
      } else if (e.target.classList.contains('custom-button-text')) {
        const index = parseInt(e.target.getAttribute('data-index'));
        IniState.appSettings.customButtons[index].text = e.target.value;
      } else if (e.target.classList.contains('custom-button-color')) {
        const index = parseInt(e.target.getAttribute('data-index'));
        IniState.appSettings.customButtons[index].color = e.target.value;
      } else if (e.target.classList.contains('custom-button-action')) {
        const index = parseInt(e.target.getAttribute('data-index'));
        IniState.appSettings.customButtons[index].action = e.target.value;
      } else if (e.target.classList.contains('custom-button-position')) {
        const index = parseInt(e.target.getAttribute('data-index'));
        IniState.appSettings.customButtons[index].position = e.target.value;
      }
    });

    container.addEventListener('click', (e) => {
      if (e.target.classList.contains('remove-custom-button')) {
        const index = parseInt(e.target.getAttribute('data-index'));
        IniState.appSettings.customButtons.splice(index, 1);
        this.updateCustomButtonsList();
      }
    });
  }

  addCustomButton() {
    const newButton = {
      id: `custom${Date.now()}`,
      enabled: true,
      text: '新しいボタン',
      color: '#007bff',
      action: 'customAction',
      position: 'top'
    };
    
    IniState.appSettings.customButtons.push(newButton);
    this.updateCustomButtonsList();
  }

  async saveSettings() {
    try {
      // フォームの値をIniStateに反映
      this.updateIniStateFromForm();
      
      // ini.jsonに保存
      const success = await saveIni();
      
      if (success) {
        alert('✅ 設定を保存しました');
        this.closeModal();
        
        // UIに反映
        this.applyAllSettings();
      } else {
        alert('❌ 設定の保存に失敗しました');
      }
    } catch (error) {
      console.error('設定保存エラー:', error);
      alert('❌ 設定の保存中にエラーが発生しました');
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
      'testDoubleGet': 'test-double-get',
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
          // テストボタンの場合は常に表示（デバッグ用）
          if (buttonId === 'test-double-get') {
            button.style.display = 'inline-block';
          } else {
            button.style.display = feature.enabled ? 'inline-block' : 'none';
          }
          
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
    const customButtons = IniState.appSettings.customButtons.filter(btn => btn.enabled);
    
    // カスタムボタンのコンテナを取得
    const topContainer = document.getElementById('custom-buttons-top');
    const bottomContainer = document.getElementById('custom-buttons-bottom');
    
    // 既存のカスタムボタンをクリア
    if (topContainer) topContainer.innerHTML = '';
    if (bottomContainer) bottomContainer.innerHTML = '';
    
    // カスタムボタンを生成
    customButtons.forEach(button => {
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
      
      // アクション設定
      if (button.action) {
        buttonElement.addEventListener('click', () => {
          console.log(`🔘 [SETTINGS] カスタムボタンクリック: ${button.action}`);
          // ここでカスタムアクションを実行
          this.executeCustomAction(button.action);
        });
      }
      
      // 位置に応じてコンテナに追加
      const targetContainer = button.position === 'bottom' ? bottomContainer : topContainer;
      if (targetContainer) {
        targetContainer.appendChild(buttonElement);
      }
    });
    
    console.log(`✅ [SETTINGS] カスタムボタン${customButtons.length}個を適用しました`);
  }

  // カスタムアクションの実行
  executeCustomAction(action) {
    try {
      // カスタムアクションの実行ロジック
      console.log(`🚀 [SETTINGS] カスタムアクション実行: ${action}`);
      
      // 例: 特定のアクションに応じた処理
      switch (action) {
        case 'customAction':
          showInfoToast('カスタムアクションが実行されました');
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
             const ok = await loadAllReload();
             if (ok) {
               showSuccessToast('✅ Config.jsonの再読み込みが完了しました');
             } else {
               showErrorToast('❌ Config.jsonの再読み込みに失敗しました');
             }
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
}

// 設定エディターを初期化
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
