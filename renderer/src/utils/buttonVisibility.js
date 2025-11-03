// src/utils/buttonVisibility.js
// ボタンの表示/非表示を制御するユーティリティ関数

/**
 * ボタンの表示/非表示を制御する関数
 * React Context経由でIniStateにアクセス
 */
export function updateButtonVisibility() {
  console.log('🔄 [BUTTON_VISIBILITY] ボタン表示制御を実行中...');
  
  // React Contextから関数を取得（window経由でアクセス可能）
  function isFeatureEnabled(featureName) {
    if (window.IniState?.isFeatureEnabled) {
      return window.IniState.isFeatureEnabled(featureName);
    }
    console.warn(`⚠️ window.IniState.isFeatureEnabled が見つかりません。IniStateProviderが初期化されるまで待ってください。`);
    return false;
  }

  function getButtonConfig(buttonName) {
    if (window.IniState?.getButtonConfig) {
      return window.IniState.getButtonConfig(buttonName);
    }
    console.warn(`⚠️ window.IniState.getButtonConfig が見つかりません。IniStateProviderが初期化されるまで待ってください。`);
    return {};
  }

  // 各ボタンの表示/非表示を制御
  const buttonMappings = {
    'individualSupportPlan': 'Individual_Support_Button',
    'specializedSupportPlan': 'Specialized-Support-Plan',
    'importSetting': 'Import-Setting',
    'getUrl': 'Get-Url',
    'loadIni': 'Load-Ini',
  };

  Object.keys(buttonMappings).forEach(featureName => {
    const buttonId = buttonMappings[featureName];
    const button = document.getElementById(buttonId);
    
    if (button) {
      const isEnabled = isFeatureEnabled(featureName);
      console.log(`🔧 [BUTTON_VISIBILITY] ボタン更新: ${buttonId}, 有効: ${isEnabled}`);
      
      // ボタンの表示/非表示を制御
      button.style.display = isEnabled ? 'inline-block' : 'none';
      
      // ボタンテキストとカラーを更新
      const config = getButtonConfig(featureName);
      if (config.buttonText) {
        button.textContent = config.buttonText;
        console.log(`📝 [BUTTON_VISIBILITY] ボタンテキスト更新: ${buttonId} -> ${config.buttonText}`);
      }
      if (config.buttonColor) {
        button.style.backgroundColor = config.buttonColor;
        console.log(`🎨 [BUTTON_VISIBILITY] ボタンカラー更新: ${buttonId} -> ${config.buttonColor}`);
      }
    } else {
      console.warn(`⚠️ [BUTTON_VISIBILITY] ボタンが見つかりません: ${buttonId}`);
    }
  });
  
  console.log('✅ [BUTTON_VISIBILITY] ボタン表示制御完了');
}

