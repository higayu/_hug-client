// modules/customButtons.js
import { getCustomButtons, loadIni } from './ini.js';

export class CustomButtonManager {
  constructor() {
    this.customButtons = [];
    this.isInitialized = false;
  }

  // 初期化
  async init() {
    if (this.isInitialized) return;
    
    console.log("🔧 カスタムボタンマネージャーを初期化中...");
    
    // ini.jsonを読み込み
    await loadIni();
    
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

    // 既存のカスタムボタンをクリア（テストボタン以外）
    const existingButtons = customPanel.querySelectorAll('li:not(:first-child)');
    existingButtons.forEach(btn => btn.remove());

    // 有効なカスタムボタンを生成
    this.customButtons.forEach(buttonConfig => {
      if (buttonConfig.enabled) {
        this.createCustomButton(buttonConfig);
      }
    });

    console.log(`✅ ${this.customButtons.filter(btn => btn.enabled).length}個のカスタムボタンを生成しました`);
  }

  // 個別のカスタムボタンを作成
  createCustomButton(buttonConfig) {
    const customPanel = document.getElementById('custom-panel');
    if (!customPanel) return;

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
      this.handleCustomButtonClick(buttonConfig);
    });

    listItem.appendChild(button);
    customPanel.appendChild(listItem);

    console.log(`✅ カスタムボタンを作成: ${buttonConfig.text} (${buttonConfig.id})`);
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
      default:
        this.handleDefaultAction(buttonConfig);
        break;
    }
  }

  // カスタムアクション1の処理
  async handleCustomAction1(buttonConfig) {
    console.log("🔧 カスタムアクション1を実行");
    alert(`カスタムアクション1が実行されました！\nボタン: ${buttonConfig.text}\nID: ${buttonConfig.id}`);
    const vw = getActiveWebview();
    if (!vw) return alert("Webview が見つかりません");

    await new Promise((resolve) => {
      if (vw.isLoading()) {
        vw.addEventListener("did-finish-load", resolve, { once: true });
      } else {
        resolve();
      }
    });


    console.log("🚀 自動ログイン開始...");
    try {
      await vw.executeJavaScript(`
        document.querySelector('input[name="username"]').value = ${JSON.stringify(AppState.HUG_USERNAME)};
        document.querySelector('input[name="password"]').value = ${JSON.stringify(AppState.HUG_PASSWORD)};
        const checkbox = document.querySelector('input[name="setexpire"]');
        if (checkbox && !checkbox.checked) checkbox.click();
        document.querySelector("input.btn-login")?.click();
      `);
    } catch (err) {
      console.error("❌ ログインスクリプト実行エラー:", err);
      alert("ログインスクリプト実行に失敗しました");
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
    await loadIni();
    this.customButtons = getCustomButtons();
    this.generateCustomButtons();
    console.log("✅ カスタムボタンの再読み込み完了");
  }
}

// グローバルインスタンスを作成
export const customButtonManager = new CustomButtonManager();
