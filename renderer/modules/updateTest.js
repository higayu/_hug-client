// modules/updateTest.js
import { updateDebugger } from './updateDebug.js';

// アップデートテスト機能
export class UpdateTester {
  constructor() {
    this.isInitialized = false;
  }

  // 初期化
  async init() {
    if (this.isInitialized) return;
    
    console.log("🔧 [UPDATE TEST] アップデートテスト機能を初期化中...");
    
    // デバッグ情報を取得
    await updateDebugger.getDebugInfo();
    updateDebugger.displayDebugInfo();
    
    // 手動チェックボタンを追加
    this.addTestButtons();
    
    this.isInitialized = true;
    console.log("✅ [UPDATE TEST] アップデートテスト機能初期化完了");
  }

  // テストボタンを追加
  addTestButtons() {
    // 既存のボタンがあるかチェック
    if (document.getElementById('updateTestButtons')) return;

    const testContainer = document.createElement('div');
    testContainer.id = 'updateTestButtons';
    testContainer.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 10px;
      border-radius: 5px;
      font-family: monospace;
      font-size: 12px;
      z-index: 10000;
      max-width: 300px;
    `;

    testContainer.innerHTML = `
      <div style="margin-bottom: 10px;">
        <strong>🔧 アップデートテスト</strong>
      </div>
      <div id="updateDebugInfo" style="margin-bottom: 10px; font-size: 10px;">
        読み込み中...
      </div>
      <div>
        <button id="checkUpdatesBtn" style="margin-right: 5px; padding: 3px 6px; font-size: 10px;">
          🔄 チェック
        </button>
        <button id="showDebugInfoBtn" style="margin-right: 5px; padding: 3px 6px; font-size: 10px;">
          📊 情報表示
        </button>
        <button id="toggleAutoUpdateBtn" style="padding: 3px 6px; font-size: 10px;">
          ⏰ 自動監視
        </button>
      </div>
    `;

    document.body.appendChild(testContainer);
    
    // イベントリスナーを設定
    this.setupEventListeners();
    
    console.log("✅ [UPDATE TEST] テストボタンを追加しました");
  }

  // イベントリスナーを設定
  setupEventListeners() {
    const checkBtn = document.getElementById('checkUpdatesBtn');
    const debugBtn = document.getElementById('showDebugInfoBtn');
    const autoBtn = document.getElementById('toggleAutoUpdateBtn');

    if (checkBtn) {
      checkBtn.addEventListener('click', () => this.checkUpdates());
    }
    if (debugBtn) {
      debugBtn.addEventListener('click', () => this.showDebugInfo());
    }
    if (autoBtn) {
      autoBtn.addEventListener('click', () => this.toggleAutoUpdate());
    }

    console.log("✅ [UPDATE TEST] イベントリスナーを設定しました");
  }

  // アップデートチェック
  async checkUpdates() {
    console.log("🔧 [UPDATE TEST] 手動アップデートチェック開始");
    try {
      const result = await updateDebugger.checkForUpdates();
      if (result) {
        console.log("✅ [UPDATE TEST] 手動チェック成功:", result);
      } else {
        console.log("⚠️ [UPDATE TEST] 手動チェック結果なし");
      }
    } catch (err) {
      console.error("❌ [UPDATE TEST] 手動チェックエラー:", err);
    }
    
    // 情報を更新
    await this.updateDebugDisplay();
  }

  // デバッグ情報を表示
  async showDebugInfo() {
    console.log("🔧 [UPDATE TEST] デバッグ情報表示");
    await updateDebugger.getDebugInfo();
    updateDebugger.displayDebugInfo();
    await this.updateDebugDisplay();
  }

  // 自動監視の切り替え
  toggleAutoUpdate() {
    if (updateDebugger.updateInterval) {
      updateDebugger.stopAutoUpdate();
      console.log("⏹️ [UPDATE TEST] 自動監視を停止しました");
    } else {
      updateDebugger.startAutoUpdate();
      console.log("▶️ [UPDATE TEST] 自動監視を開始しました");
    }
  }

  // デバッグ表示を更新
  async updateDebugDisplay() {
    const container = document.getElementById('updateDebugInfo');
    if (!container) return;

    await updateDebugger.getDebugInfo();
    const info = updateDebugger.debugInfo;
    
    if (!info) {
      container.innerHTML = "❌ 情報取得失敗";
      return;
    }

    container.innerHTML = `
      <div>📊 バージョン: ${info.currentVersion}</div>
      <div>🔍 チェック中: ${info.isChecking ? "はい" : "いいえ"}</div>
      <div>📅 最終チェック: ${info.lastCheckTime ? new Date(info.lastCheckTime).toLocaleTimeString() : "未実行"}</div>
      <div>🔢 チェック回数: ${info.checkCount}</div>
      <div>✅ アップデート: ${info.updateAvailable ? "利用可能" : "なし"}</div>
      <div>📥 進捗: ${info.downloadProgress}%</div>
      ${info.lastError ? `<div style="color: #ff6b6b;">❌ エラー: ${info.lastError}</div>` : ""}
    `;
  }
}

// グローバルインスタンスを作成
export const updateTester = new UpdateTester();

// グローバルスコープに設定（HTMLのonclickからアクセス可能にする）
window.updateTester = updateTester;

// 自動初期化
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    updateTester.init();
  }, 2000); // 2秒後に初期化
});
