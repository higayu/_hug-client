// modules/ui/buttonVisibility.js
import { isFeatureEnabled, getButtonConfig, loadIni } from '../config/ini.js';

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
    
    // 他のボタンも同様に制御可能
    // this.updateOtherButtons();
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
