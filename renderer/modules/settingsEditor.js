// renderer/modules/settingsEditor.js
import { IniState, loadIni, saveIni, updateIniSetting } from "./ini.js";

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

    // 現在の設定を読み込み
    console.log('🔄 [SETTINGS] ini.jsonを読み込み中...');
    await loadIni();
    
    // バックアップを作成
    this.originalSettings = JSON.parse(JSON.stringify(IniState));
    console.log('✅ [SETTINGS] 設定のバックアップを作成しました');
    
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
        this.applySettingsToUI();
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

  applySettingsToUI() {
    // 閉じるボタンの表示/非表示
    const showCloseButtons = IniState.appSettings.ui.showCloseButtons;
    document.querySelectorAll('.close-btn').forEach(btn => {
      btn.style.display = showCloseButtons ? 'inline' : 'none';
    });

    // テーマの適用
    const theme = IniState.appSettings.ui.theme;
    document.body.className = theme === 'dark' ? 'dark-theme' : '';

    // ボタンの表示/非表示とスタイル更新
    this.updateButtonVisibility();
  }

  updateButtonVisibility() {
    const features = IniState.appSettings.features;
    
    // 各ボタンの表示/非表示を制御
    Object.keys(features).forEach(featureName => {
      const button = document.getElementById(featureName === 'testDoubleGet' ? 'test-double-get' : 
                                          featureName === 'importSetting' ? 'Import-Setting' :
                                          featureName === 'getUrl' ? 'Get-Url' : 
                                          featureName === 'individualSupportPlan' ? 'Individual_Support_Button' :
                                          featureName === 'specializedSupportPlan' ? 'Specialized-Support-Plan' : null);
      
      if (button) {
        button.style.display = features[featureName].enabled ? 'inline-block' : 'none';
        
        // ボタンテキストとカラーを更新
        if (features[featureName].buttonText) {
          button.textContent = features[featureName].buttonText;
        }
        if (features[featureName].buttonColor) {
          button.style.backgroundColor = features[featureName].buttonColor;
        }
      }
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
}

// 設定エディターを初期化
export function initSettingsEditor() {
  return new SettingsEditor();
}
