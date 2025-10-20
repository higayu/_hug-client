// modules/ini.js
export const IniState = {
  // デフォルト設定
  appSettings: {
    autoLogin: {
      enabled: true,
      username: "",
      password: ""
    },
    ui: {
      theme: "light",
      language: "ja",
      showCloseButtons: true,
      autoRefresh: {
        enabled: false,
        interval: 30000
      }
    },
    features: {
      individualSupportPlan: {
        enabled: true,
        buttonText: "個別支援計画",
        buttonColor: "#007bff"
      },
      specializedSupportPlan: {
        enabled: true,
        buttonText: "専門的支援計画",
        buttonColor: "#28a745"
      },
      testDoubleGet: {
        enabled: false,
        buttonText: "テスト取得",
        buttonColor: "#ffc107"
      },
      importSetting: {
        enabled: true,
        buttonText: "設定ファイル取得",
        buttonColor: "#6c757d"
      },
      getUrl: {
        enabled: true,
        buttonText: "URL取得",
        buttonColor: "#17a2b8"
      }
    },
    customButtons: [],
    window: {
      width: 1200,
      height: 800,
      minWidth: 800,
      minHeight: 600,
      maximized: false,
      alwaysOnTop: false
    },
    notifications: {
      enabled: true,
      sound: true,
      desktop: true
    }
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
    const result = await window.electronAPI.readIni();

    if (!result.success) {
      console.error("❌ ini.json読み込みエラー:", result.error);
      return false;
    }

    const data = result.data;
    
    // 設定をマージ（デフォルト値と組み合わせ）
    IniState.appSettings = { ...IniState.appSettings, ...data.appSettings };
    IniState.userPreferences = { ...IniState.userPreferences, ...data.userPreferences };

    console.log("✅ ini.json読み込み成功:", IniState);
    return true;
  } catch (err) {
    console.error("❌ ini.json読み込み中にエラー:", err);
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
      console.error("❌ ini.json保存エラー:", result.error);
      return false;
    }

    console.log("✅ ini.json保存成功");
    return true;
  } catch (err) {
    console.error("❌ ini.json保存中にエラー:", err);
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
  return IniState.appSettings.customButtons.filter(btn => btn.enabled);
}

// UI設定を取得
export function getUISettings() {
  return IniState.appSettings.ui;
}

// ウィンドウ設定を取得
export function getWindowSettings() {
  return IniState.appSettings.window;
}
