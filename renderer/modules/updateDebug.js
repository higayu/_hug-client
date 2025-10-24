// modules/updateDebug.js
export class UpdateDebugger {
  constructor() {
    this.debugInfo = null;
    this.updateInterval = null;
  }

  // デバッグ情報を取得
  async getDebugInfo() {
    try {
      const result = await window.electronAPI.getUpdateDebugInfo();
      if (result.success) {
        this.debugInfo = result.data;
        return this.debugInfo;
      } else {
        console.error("❌ アップデートデバッグ情報取得エラー:", result.error);
        return null;
      }
    } catch (err) {
      console.error("❌ アップデートデバッグ情報取得中にエラー:", err);
      return null;
    }
  }

  // 手動でアップデートチェック
  async checkForUpdates() {
    try {
      console.log("🔧 手動アップデートチェック開始");
      const result = await window.electronAPI.checkForUpdates();
      if (result.success) {
        console.log("✅ 手動アップデートチェック成功:", result.data);
        return result.data;
      } else {
        console.error("❌ 手動アップデートチェックエラー:", result.error);
        return null;
      }
    } catch (err) {
      console.error("❌ 手動アップデートチェック中にエラー:", err);
      return null;
    }
  }

  // デバッグ情報を表示
  displayDebugInfo() {
    if (!this.debugInfo) {
      console.log("⚠️ デバッグ情報が取得されていません");
      return;
    }

    console.log("🔧 ===== アップデートデバッグ情報 =====");
    console.log("📊 現在のバージョン:", this.debugInfo.currentVersion);
    console.log("🔍 チェック中:", this.debugInfo.isChecking ? "はい" : "いいえ");
    console.log("📅 最終チェック時刻:", this.debugInfo.lastCheckTime || "未実行");
    console.log("🔢 チェック回数:", this.debugInfo.checkCount);
    console.log("✅ アップデート利用可能:", this.debugInfo.updateAvailable ? "はい" : "いいえ");
    if (this.debugInfo.newVersion) {
      console.log("🆕 新しいバージョン:", this.debugInfo.newVersion);
    }
    console.log("📥 ダウンロード進捗:", this.debugInfo.downloadProgress + "%");
    if (this.debugInfo.lastError) {
      console.log("❌ 最後のエラー:", this.debugInfo.lastError);
    }
    console.log("🔧 =================================");
  }

  // 自動更新でデバッグ情報を監視
  startAutoUpdate() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    this.updateInterval = setInterval(async () => {
      await this.getDebugInfo();
      this.displayDebugInfo();
    }, 5000); // 5秒ごとに更新

    console.log("🔧 アップデートデバッグ監視開始");
  }

  // 自動更新を停止
  stopAutoUpdate() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
      console.log("🔧 アップデートデバッグ監視停止");
    }
  }

  // デバッグ情報をHTMLに表示
  displayInHTML(containerId = "updateDebugInfo") {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error("❌ コンテナが見つかりません:", containerId);
      return;
    }

    if (!this.debugInfo) {
      container.innerHTML = "<p>⚠️ デバッグ情報が取得されていません</p>";
      return;
    }

    const html = `
      <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; font-family: monospace;">
        <h3>🔧 アップデートデバッグ情報</h3>
        <div style="margin: 10px 0;">
          <strong>📊 現在のバージョン:</strong> ${this.debugInfo.currentVersion}<br>
          <strong>🔍 チェック中:</strong> ${this.debugInfo.isChecking ? "はい" : "いいえ"}<br>
          <strong>📅 最終チェック時刻:</strong> ${this.debugInfo.lastCheckTime || "未実行"}<br>
          <strong>🔢 チェック回数:</strong> ${this.debugInfo.checkCount}<br>
          <strong>✅ アップデート利用可能:</strong> ${this.debugInfo.updateAvailable ? "はい" : "いいえ"}<br>
          ${this.debugInfo.newVersion ? `<strong>🆕 新しいバージョン:</strong> ${this.debugInfo.newVersion}<br>` : ""}
          <strong>📥 ダウンロード進捗:</strong> ${this.debugInfo.downloadProgress}%<br>
          ${this.debugInfo.lastError ? `<strong>❌ 最後のエラー:</strong> ${this.debugInfo.lastError}<br>` : ""}
        </div>
        <div style="margin-top: 10px;">
          <button onclick="updateDebugger.checkForUpdates()" style="margin-right: 10px; padding: 5px 10px;">
            🔄 手動チェック
          </button>
          <button onclick="updateDebugger.getDebugInfo().then(() => updateDebugger.displayInHTML())" style="padding: 5px 10px;">
            🔄 情報更新
          </button>
        </div>
      </div>
    `;

    container.innerHTML = html;
  }
}

// グローバルインスタンスを作成
export const updateDebugger = new UpdateDebugger();
