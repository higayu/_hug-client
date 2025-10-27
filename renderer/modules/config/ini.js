// modules/config/ini.js
import { COLORS, DEFAULTS, FEATURES, MESSAGES } from "./const.js";

export const IniState = {
  // デフォルト設定
  appSettings: {
    autoLogin: {
      enabled: true,
      username: "",
      password: ""
    },
    ui: DEFAULTS.UI,
    features: FEATURES,
    customButtons: [],
    window: DEFAULTS.WINDOW,
    notifications: DEFAULTS.NOTIFICATIONS
  },
  userPreferences: {
    lastLoginDate: "",
    rememberWindowState: true,
    showWelcomeMessage: true
  }
};

// ini.json読み込み
export async function loadIni() {
  try {
    console.log("🔄 [INI] ini.json読み込み開始");
    const result = await window.electronAPI.readIni();

    if (!result.success) {
      console.error(MESSAGES.ERROR.INI_LOAD, result.error);
      return false;
    }

    const data = result.data;
    console.log("🔍 [INI] 読み込んだデータ:", data);
    console.log("🔍 [INI] customButtons:", data.appSettings?.customButtons);
    
    // 設定をマージ（デフォルト値と組み合わせ）
    IniState.appSettings = { ...IniState.appSettings, ...data.appSettings };
    IniState.userPreferences = { ...IniState.userPreferences, ...data.userPreferences };

    console.log("✅ [INI] マージ後のIniState:", IniState);
    console.log("✅ [INI] マージ後のcustomButtons:", IniState.appSettings.customButtons);
    console.log(MESSAGES.SUCCESS.INI_LOADED, IniState);
    return true;
  } catch (err) {
    console.error(MESSAGES.ERROR.INI_LOAD, err);
    return false;
  }
}

// ini.json保存
export async function saveIni() {
  try {
    const data = {
      version: "1.0.0",
      appSettings: IniState.appSettings,
      userPreferences: IniState.userPreferences
    };

    const result = await window.electronAPI.saveIni(data);
    
    if (!result.success) {
      console.error(MESSAGES.ERROR.INI_SAVE, result.error);
      return false;
    }

    console.log(MESSAGES.SUCCESS.INI_SAVED);
    return true;
  } catch (err) {
    console.error(MESSAGES.ERROR.INI_SAVE, err);
    return false;
  }
}

// 設定項目の更新
export async function updateIniSetting(path, value) {
  try {
    const result = await window.electronAPI.updateIniSetting(path, value);
    
    if (!result.success) {
      console.error("❌ 設定更新エラー:", result.error);
      return false;
    }

    // ローカルの状態も更新
    const pathArray = path.split('.');
    let current = IniState;
    for (let i = 0; i < pathArray.length - 1; i++) {
      if (!current[pathArray[i]]) {
        current[pathArray[i]] = {};
      }
      current = current[pathArray[i]];
    }
    current[pathArray[pathArray.length - 1]] = value;

    console.log(`✅ 設定更新成功: ${path} = ${JSON.stringify(value)}`);
    return true;
  } catch (err) {
    console.error("❌ 設定更新中にエラー:", err);
    return false;
  }
}

// 機能の有効/無効をチェック
export function isFeatureEnabled(featureName) {
  return IniState.appSettings.features[featureName]?.enabled ?? false;
}

// ボタンの設定を取得
export function getButtonConfig(buttonName) {
  return IniState.appSettings.features[buttonName] || {};
}

// カスタムボタンの設定を取得
export function getCustomButtons() {
  console.log("🔍 [INI] getCustomButtons呼び出し");
  console.log("🔍 [INI] IniState.appSettings.customButtons:", IniState.appSettings.customButtons);
  
  const enabledButtons = IniState.appSettings.customButtons.filter(btn => btn.enabled);
  console.log("🔍 [INI] 有効なカスタムボタン:", enabledButtons);
  
  return enabledButtons;
}

// UI設定を取得
export function getUISettings() {
  return IniState.appSettings.ui;
}

// ウィンドウ設定を取得
export function getWindowSettings() {
  return IniState.appSettings.window;
}
