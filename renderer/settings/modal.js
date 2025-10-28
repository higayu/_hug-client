// renderer/settings/modal.js
// 設定モーダル専用のJavaScript機能

export class SettingsModal {
  constructor() {
    this.modal = null;
    this.originalSettings = null;
    this.modalLoaded = false;
  }

  async load() {
    if (this.modalLoaded) return this.modal;

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
        return this.modal;
      }
    } catch (error) {
      console.error('❌ 設定モーダルの読み込みに失敗:', error);
      return null;
    }
  }

  show() {
    if (this.modal) {
      this.modal.style.display = 'block';
    }
  }

  hide() {
    if (this.modal) {
      this.modal.style.display = 'none';
    }
  }

  getElement() {
    return this.modal;
  }

  isLoaded() {
    return this.modalLoaded;
  }
}
