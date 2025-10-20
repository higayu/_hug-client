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
    await this.loadModal();
    this.setupEventListeners();
  }

  async loadModal() {
    if (this.modalLoaded) return;

    try {
      // 設定モーダルのHTMLを読み込み
      const response = await fetch('./settings/modal.html');
      const html = await response.text();
      
      // モーダル用のコンテナを作成
      const modalContainer = document.createElement('div');
      modalContainer.innerHTML = html;
      
      // モーダルをbodyに追加
      const modalElement = modalContainer.querySelector('#settingsModal');
      if (modalElement) {
        document.body.appendChild(modalElement);
        this.modal = modalElement;
        
        // CSSを読み込み
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = './settings/modal.css';
        document.head.appendChild(link);
        
        this.modalLoaded = true;
        console.log('✅ 設定モーダルを読み込みました');
      }
    } catch (error) {
      console.error('❌ 設定モーダルの読み込みに失敗:', error);
    }
  }

  setupEventListeners() {
    // モーダル開閉
    document.getElementById('Edit-Settings').addEventListener('click', () => {
      this.openModal();
    });

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
    if (!this.modal) return;

    const tabButtons = this.modal.querySelectorAll('.tab-button');
    const tabContents = this.modal.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        const targetTab = button.getAttribute('data-tab');
        
        // アクティブタブを切り替え
        tabButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        // タブコンテンツを切り替え
        tabContents.forEach(content => content.classList.remove('active'));
        this.modal.querySelector(`#${targetTab}-tab`).classList.add('active');
      });
    });
  }

  async openModal() {
    // モーダルが読み込まれていない場合は読み込み
    if (!this.modalLoaded) {
      await this.loadModal();
      this.setupEventListeners();
      this.setupTabs();
    }

    // 現在の設定を読み込み
    await loadIni();
    
    // バックアップを作成
    this.originalSettings = JSON.parse(JSON.stringify(IniState));
    
    // フォームに現在の値を設定
    this.populateForm();
    
    // カスタムボタンリストを更新
    this.updateCustomButtonsList();
    
    // モーダルを表示
    if (this.modal) {
      this.modal.style.display = 'block';
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
    this.modal.querySelector('#theme-select').value = ui.theme || 'light';
    this.modal.querySelector('#language-select').value = ui.language || 'ja';
    this.modal.querySelector('#show-close-buttons').checked = ui.showCloseButtons || false;
    this.modal.querySelector('#auto-refresh').checked = ui.autoRefresh?.enabled || false;
    this.modal.querySelector('#refresh-interval').value = ui.autoRefresh?.interval || 30000;

    // ウィンドウ設定
    const window = IniState.appSettings.window;
    this.modal.querySelector('#window-width').value = window.width || 1200;
    this.modal.querySelector('#window-height').value = window.height || 800;
    this.modal.querySelector('#window-maximized').checked = window.maximized || false;
    this.modal.querySelector('#window-always-on-top').checked = window.alwaysOnTop || false;
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
