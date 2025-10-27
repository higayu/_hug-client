// modules/toast/toast.js
// トースト通知システム

/**
 * トースト通知を表示する
 * @param {string} message - 表示するメッセージ
 * @param {string} type - トーストの種類 ('success', 'error', 'info', 'warning')
 * @param {number} duration - 表示時間（ミリ秒、デフォルト: 3000）
 */
export function showToast(message, type = 'info', duration = 3000) {
  // 既存のトーストを削除
  const existingToast = document.querySelector('.toast');
  if (existingToast) {
    existingToast.remove();
  }

  // トースト要素を作成
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  // 改行を<br>タグに変換
  const formattedMessage = message.replace(/\n/g, '<br>');
  toast.innerHTML = formattedMessage;

  // スタイルを設定
  const colors = {
    success: '#28a745',
    error: '#dc3545',
    warning: '#ffc107',
    info: '#007bff'
  };

  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${colors[type] || colors.info};
    color: ${type === 'warning' ? '#000' : '#fff'};
    padding: 12px 20px;
    border-radius: 6px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10000;
    font-size: 14px;
    font-weight: 500;
    max-width: 300px;
    word-wrap: break-word;
    opacity: 0;
    transform: translateX(100%);
    transition: all 0.3s ease;
    cursor: pointer;
  `;

  // DOMに追加
  document.body.appendChild(toast);

  // アニメーション
  setTimeout(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(0)';
  }, 100);

  // クリックで閉じる機能
  toast.addEventListener('click', () => {
    hideToast(toast);
  });

  // 指定時間後に自動削除
  setTimeout(() => {
    hideToast(toast);
  }, duration);
}

/**
 * トーストを非表示にする
 * @param {HTMLElement} toast - 非表示にするトースト要素
 */
function hideToast(toast) {
  if (!toast || !toast.parentNode) return;
  
  toast.style.opacity = '0';
  toast.style.transform = 'translateX(100%)';
  setTimeout(() => {
    if (toast.parentNode) {
      toast.parentNode.removeChild(toast);
    }
  }, 300);
}

/**
 * 成功メッセージのトースト
 * @param {string} message - メッセージ
 * @param {number} duration - 表示時間
 */
export function showSuccessToast(message, duration = 3000) {
  showToast(message, 'success', duration);
}

/**
 * エラーメッセージのトースト
 * @param {string} message - メッセージ
 * @param {number} duration - 表示時間
 */
export function showErrorToast(message, duration = 4000) {
  showToast(message, 'error', duration);
}

/**
 * 警告メッセージのトースト
 * @param {string} message - メッセージ
 * @param {number} duration - 表示時間
 */
export function showWarningToast(message, duration = 3500) {
  showToast(message, 'warning', duration);
}

/**
 * 情報メッセージのトースト
 * @param {string} message - メッセージ
 * @param {number} duration - 表示時間
 */
export function showInfoToast(message, duration = 3000) {
  showToast(message, 'info', duration);
}

/**
 * 複数のトーストを順次表示する
 * @param {Array} messages - メッセージの配列 [{message, type, duration}]
 * @param {number} interval - メッセージ間の間隔（ミリ秒）
 */
export function showMultipleToasts(messages, interval = 500) {
  messages.forEach((msg, index) => {
    setTimeout(() => {
      showToast(msg.message, msg.type, msg.duration);
    }, index * interval);
  });
}

/**
 * すべてのトーストをクリアする
 */
export function clearAllToasts() {
  const toasts = document.querySelectorAll('.toast');
  toasts.forEach(toast => {
    if (toast.parentNode) {
      toast.parentNode.removeChild(toast);
    }
  });
}
