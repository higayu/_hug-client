// src/utils/buttonVisibility.js
// ボタンの表示/非表示を制御するユーティリティ関数

/**
 * ボタンの表示/非表示を制御する関数
 * customButtons.jsonの設定を優先
 */
export function updateButtonVisibility() {
  console.log('🔄 [BUTTON_VISIBILITY] ボタン表示制御を実行中...');
  
  // customButtons.jsonの設定を取得
  function getButtonConfig(buttonId) {
    // グローバル設定から取得（Contextで設定される）
    if (window.__customButtonsConfig) {
      const config = window.__customButtonsConfig[buttonId];
      if (config) {
        return config;
      }
    }
    
    // フォールバック: CustomButtonsStateを使用
    if (window.CustomButtonsState?.getButtonConfig) {
      return window.CustomButtonsState.getButtonConfig(buttonId);
    }
    
    console.warn(`⚠️ [BUTTON_VISIBILITY] ボタン設定が見つかりません: ${buttonId}`);
    return { enabled: false };
  }

  // 各ボタンの表示/非表示を制御
  const buttonMappings = {
    'individualSupportPlan': 'individual-support-plan-btn',
    'specializedSupportPlan': 'specialized-support-plan-btn',
    'importSetting': 'import-setting-btn',
    'getUrl': 'get-url-btn',
    'loadIni': 'load-ini-btn',
  };

  Object.entries(buttonMappings).forEach(([featureName, buttonId]) => {
    const button = document.getElementById(buttonId);
    
    if (button) {
      const config = getButtonConfig(featureName);
      const isEnabled = config.enabled || false;
      
      console.log(`🔧 [BUTTON_VISIBILITY] ボタン更新: ${buttonId}, 有効: ${isEnabled}`);
      
      // ボタンの表示/非表示を制御
      button.style.display = isEnabled ? 'inline-block' : 'none';
      
      // ボタンテキストを更新
      if (config.text) {
        const textNode = button.querySelector('.button-text') || button;
        if (textNode) {
          textNode.textContent = config.text;
          console.log(`📝 [BUTTON_VISIBILITY] ボタンテキスト更新: ${buttonId} -> ${config.text}`);
        }
      }
      
      // ボタンカラーを更新
      if (config.color) {
        button.style.backgroundColor = config.color;
        console.log(`🎨 [BUTTON_VISIBILITY] ボタンカラー更新: ${buttonId} -> ${config.color}`);
      }
    } else {
      console.warn(`⚠️ [BUTTON_VISIBILITY] ボタンが見つかりません: ${buttonId}`);
    }
  });
  
  console.log('✅ [BUTTON_VISIBILITY] ボタン表示制御完了');
}