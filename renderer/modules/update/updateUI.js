// modules/update/updateUI.js
import { updateManager } from './updateManager.js';

// アップデートUI機能
export class UpdateUI {
  constructor() {
    this.isInitialized = false;
  }

  // 初期化
  async init() {
    if (this.isInitialized) return;
    
    console.log("🔄 アップデートUI機能を初期化中...");
    
    // 起動時に1回だけアップデートチェック
    await updateManager.checkForUpdates();
    await updateManager.getUpdateInfo();
    updateManager.displayUpdateInfo();
    console.log("🔄 起動時: アップデートチェック完了");
    
    this.isInitialized = true;
    console.log("✅ アップデートUI機能初期化完了");
  }

  // アップデートUIボタンを追加
  addUpdateButtons() {
    // 既存のボタンがあるかチェック
    if (document.getElementById('updateButtons')) return;

    const updateContainer = document.createElement('div');
    updateContainer.id = 'updateButtons';
    updateContainer.style.cssText = `
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

    updateContainer.innerHTML = `
      <div style="margin-bottom: 10px;">
        <strong>🔄 アップデート管理</strong>
      </div>
      <div id="updateInfo" style="margin-bottom: 10px; font-size: 10px;">
        読み込み中...
      </div>
      <div>
        <button id="checkUpdatesBtn" style="margin-right: 5px; padding: 3px 6px; font-size: 10px;">
          🔄 手動チェック
        </button>
        <button id="showUpdateInfoBtn" style="padding: 3px 6px; font-size: 10px;">
          📊 情報表示
        </button>
      </div>
    `;

    document.body.appendChild(updateContainer);
    
    // イベントリスナーを設定
    this.setupEventListeners();
    
    console.log("✅ アップデートUIボタンを追加しました");
  }

  // イベントリスナーを設定
  setupEventListeners() {
    const checkBtn = document.getElementById('checkUpdatesBtn');
    const infoBtn = document.getElementById('showUpdateInfoBtn');

    if (checkBtn) {
      checkBtn.addEventListener('click', () => this.checkUpdates());
    }
    if (infoBtn) {
      infoBtn.addEventListener('click', () => this.showUpdateInfo());
    }

    console.log("✅ アップデートUIイベントリスナーを設定しました");
  }

  // アップデートチェック
  async checkUpdates() {
    console.log("🔄 手動アップデートチェック開始");
    try {
      const result = await updateManager.checkForUpdates();
      if (result) {
        console.log("✅ 手動チェック成功:", result);
      } else {
        console.log("⚠️ 手動チェック結果なし");
      }
    } catch (err) {
      console.error("❌ 手動チェックエラー:", err);
    }
    
    // 情報を更新
    await this.updateInfoDisplay();
  }

  // アップデート情報を表示
  async showUpdateInfo() {
    console.log("🔄 アップデート情報表示");
    await updateManager.getUpdateInfo();
    updateManager.displayUpdateInfo();
    await this.updateInfoDisplay();
  }


  // アップデート情報表示を更新
  async updateInfoDisplay() {
    const container = document.getElementById('updateInfo');
    if (!container) return;

    await updateManager.getUpdateInfo();
    const info = updateManager.debugInfo;
    
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
export const updateUI = new UpdateUI();

// グローバルスコープに設定（HTMLのonclickからアクセス可能にする）
window.updateUI = updateUI;

// 自動初期化（本番用）
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    updateUI.init();
  }, 2000); // 2秒後に初期化
});
