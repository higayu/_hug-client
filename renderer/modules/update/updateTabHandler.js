// renderer/modules/update/updateTabHandler.js
import { updateManager } from "./updateManager.js";

export class UpdateTabHandler {
  constructor(modal) {
    this.modal = modal;
  }

  // アップデートタブのイベントリスナーを設定
  setupUpdateTabListeners() {
    if (!this.modal) return;

    // 手動チェックボタン
    const manualCheckBtn = this.modal.querySelector('#manual-check-update');
    if (manualCheckBtn) {
      manualCheckBtn.addEventListener('click', async () => {
        await this.manualCheckUpdate();
      });
    }

    // コンソール表示ボタン
    const showDebugBtn = this.modal.querySelector('#show-debug-console');
    if (showDebugBtn) {
      showDebugBtn.addEventListener('click', () => {
        this.showDebugConsole();
      });
    }

    // 自動監視ボタン
    const toggleMonitorBtn = this.modal.querySelector('#toggle-auto-monitor');
    if (toggleMonitorBtn) {
      toggleMonitorBtn.addEventListener('click', () => {
        this.toggleAutoMonitor();
      });
    }

    // 情報更新ボタン
    const refreshBtn = this.modal.querySelector('#refresh-update-info');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', async () => {
        await this.refreshUpdateInfo();
      });
    }

    console.log('✅ [UPDATE TAB] アップデートタブのイベントリスナーを設定しました');
  }

  // 手動アップデートチェック
  async manualCheckUpdate() {
    try {
      console.log('🔧 [UPDATE] 手動アップデートチェック開始');
      this.addLog('🔄 手動アップデートチェックを開始...', 'info');
      
      const result = await updateManager.checkForUpdates();
      if (result) {
        this.addLog('✅ 手動チェック完了: ' + JSON.stringify(result), 'success');
      } else {
        this.addLog('⚠️ 手動チェック結果なし', 'warning');
      }
      
      await this.refreshUpdateInfo();
    } catch (err) {
      console.error('❌ [UPDATE] 手動チェックエラー:', err);
      this.addLog('❌ 手動チェックエラー: ' + err.message, 'error');
    }
  }

  // デバッグ情報をコンソールに表示
  showDebugConsole() {
    console.log('🔧 [UPDATE] デバッグ情報をコンソールに表示');
    updateManager.displayUpdateInfo();
    this.addLog('📊 デバッグ情報をコンソールに表示しました', 'info');
  }

  // 自動監視の切り替え（機能削除済み）
  toggleAutoMonitor() {
    this.addLog('⚠️ 自動監視機能は削除されました', 'warning');
  }

  // アップデート情報を更新
  async refreshUpdateInfo() {
    try {
      await updateManager.getUpdateInfo();
      this.updateUpdateInfoDisplay();
      this.addLog('🔄 アップデート情報を更新しました', 'info');
    } catch (err) {
      console.error('❌ [UPDATE] 情報更新エラー:', err);
      this.addLog('❌ 情報更新エラー: ' + err.message, 'error');
    }
  }

  // アップデート情報表示を更新
  updateUpdateInfoDisplay() {
    if (!this.modal) return;

    const info = updateManager.debugInfo;
    if (!info) return;

    // 各要素を更新
    const elements = {
      'current-version': info.currentVersion || '不明',
      'is-checking': info.isChecking ? 'はい' : 'いいえ',
      'last-check-time': info.lastCheckTime ? new Date(info.lastCheckTime).toLocaleString() : '未実行',
      'check-count': info.checkCount || 0,
      'update-available': info.updateAvailable ? 'はい' : 'いいえ',
      'new-version': info.newVersion || 'なし',
      'download-progress': info.downloadProgress + '%'
    };

    Object.entries(elements).forEach(([id, value]) => {
      const element = this.modal.querySelector(`#${id}`);
      if (element) {
        element.textContent = value;
      }
    });

    // エラー情報の表示
    const errorInfo = this.modal.querySelector('#error-info');
    const lastError = this.modal.querySelector('#last-error');
    if (info.lastError && errorInfo && lastError) {
      lastError.textContent = info.lastError;
      errorInfo.style.display = 'block';
    } else if (errorInfo) {
      errorInfo.style.display = 'none';
    }
  }

  // ログを追加
  addLog(message, type = 'info') {
    if (!this.modal) return;

    const logContainer = this.modal.querySelector('#update-log-container');
    if (!logContainer) return;

    const logItem = document.createElement('div');
    logItem.className = `log-item ${type}`;
    logItem.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;

    logContainer.appendChild(logItem);
    logContainer.scrollTop = logContainer.scrollHeight;

    // ログが多すぎる場合は古いものを削除
    const logItems = logContainer.querySelectorAll('.log-item');
    if (logItems.length > 50) {
      logItems[0].remove();
    }
  }
}
