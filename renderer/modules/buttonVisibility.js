// modules/buttonVisibility.js
import { isFeatureEnabled, getButtonConfig, loadIni } from './ini.js';

export class ButtonVisibilityManager {
  constructor() {
    this.isInitialized = false;
  }

  // 初期化
  async init() {
    if (this.isInitialized) return;
    
    console.log("🔧 ボタン表示制御マネージャーを初期化中...");
    
    // ini.jsonを読み込み
    await loadIni();
    
    // ボタンの表示/非表示を制御
    this.updateButtonVisibility();
    
    this.isInitialized = true;
    console.log("✅ ボタン表示制御マネージャー初期化完了");
  }

  // ボタンの表示/非表示を更新
  updateButtonVisibility() {
    console.log("🔄 ボタンの表示/非表示を更新中...");

    // 加算比較ボタンの制御
    this.updateAdditionCompareButton();
    
    // 他のボタンも同様に制御可能
    // this.updateOtherButtons();
  }

  // 加算比較ボタンの表示/非表示を制御
  updateAdditionCompareButton() {
    const button = document.getElementById('addition-compare-btn');
    if (!button) {
      console.warn("⚠️ 加算比較ボタンが見つかりません");
      return;
    }

    const isEnabled = isFeatureEnabled('additionCompare');
    const buttonConfig = getButtonConfig('additionCompare');
    
    console.log("🔧 加算比較ボタン設定:", { isEnabled, buttonConfig });

    if (isEnabled) {
      // ボタンを表示
      button.style.display = 'block';
      button.textContent = buttonConfig.buttonText || '加算比較';
      button.style.backgroundColor = buttonConfig.buttonColor || '#ffc107';
      button.style.color = 'white';
      button.style.border = 'none';
      button.style.padding = '8px 12px';
      button.style.borderRadius = '4px';
      button.style.cursor = 'pointer';
      button.style.width = '100%';
      button.style.marginBottom = '4px';
      
      console.log("✅ 加算比較ボタンを表示しました");
    } else {
      // ボタンを非表示
      button.style.display = 'none';
      console.log("❌ 加算比較ボタンを非表示にしました");
    }
  }

  // ボタンの表示/非表示を再読み込み
  async reloadButtonVisibility() {
    console.log("🔄 ボタンの表示/非表示を再読み込み中...");
    await loadIni();
    this.updateButtonVisibility();
    console.log("✅ ボタンの表示/非表示の再読み込み完了");
  }
}

// グローバルインスタンスを作成
export const buttonVisibilityManager = new ButtonVisibilityManager();
