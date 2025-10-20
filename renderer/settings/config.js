// renderer/settings/config.js
// 設定モーダル用の設定ファイル

export const SettingsConfig = {
  // モーダルのデフォルト設定
  modal: {
    width: '90%',
    maxWidth: '800px',
    maxHeight: '90vh',
    animation: 'modalSlideIn 0.3s ease-out'
  },

  // タブ設定
  tabs: [
    { id: 'features', name: '機能設定', icon: '⚙️' },
    { id: 'ui', name: 'UI設定', icon: '🎨' },
    { id: 'window', name: 'ウィンドウ設定', icon: '🖥️' },
    { id: 'custom', name: 'カスタムボタン', icon: '🔧' }
  ],

  // 機能設定の項目
  features: [
    {
      id: 'individualSupportPlan',
      name: '個別支援計画',
      type: 'checkbox',
      path: 'appSettings.features.individualSupportPlan.enabled'
    },
    {
      id: 'specializedSupportPlan',
      name: '専門的支援計画',
      type: 'checkbox',
      path: 'appSettings.features.specializedSupportPlan.enabled'
    },
    {
      id: 'testDoubleGet',
      name: 'テスト取得',
      type: 'checkbox',
      path: 'appSettings.features.testDoubleGet.enabled'
    },
    {
      id: 'importSetting',
      name: '設定ファイル取得',
      type: 'checkbox',
      path: 'appSettings.features.importSetting.enabled'
    },
    {
      id: 'getUrl',
      name: 'URL取得',
      type: 'checkbox',
      path: 'appSettings.features.getUrl.enabled'
    }
  ],

  // UI設定の項目
  ui: [
    {
      id: 'theme',
      name: 'テーマ',
      type: 'select',
      options: [
        { value: 'light', label: 'ライト' },
        { value: 'dark', label: 'ダーク' }
      ],
      path: 'appSettings.ui.theme'
    },
    {
      id: 'language',
      name: '言語',
      type: 'select',
      options: [
        { value: 'ja', label: '日本語' },
        { value: 'en', label: 'English' }
      ],
      path: 'appSettings.ui.language'
    },
    {
      id: 'showCloseButtons',
      name: '閉じるボタンを表示',
      type: 'checkbox',
      path: 'appSettings.ui.showCloseButtons'
    },
    {
      id: 'autoRefresh',
      name: '自動リフレッシュ',
      type: 'checkbox',
      path: 'appSettings.ui.autoRefresh.enabled'
    },
    {
      id: 'refreshInterval',
      name: 'リフレッシュ間隔 (秒)',
      type: 'number',
      min: 10,
      max: 300,
      path: 'appSettings.ui.autoRefresh.interval'
    }
  ],

  // ウィンドウ設定の項目
  window: [
    {
      id: 'width',
      name: '幅',
      type: 'number',
      min: 800,
      path: 'appSettings.window.width'
    },
    {
      id: 'height',
      name: '高さ',
      type: 'number',
      min: 600,
      path: 'appSettings.window.height'
    },
    {
      id: 'maximized',
      name: '最大化で起動',
      type: 'checkbox',
      path: 'appSettings.window.maximized'
    },
    {
      id: 'alwaysOnTop',
      name: '常に最前面',
      type: 'checkbox',
      path: 'appSettings.window.alwaysOnTop'
    }
  ],

  // ボタン設定
  buttons: {
    save: {
      text: '保存',
      class: 'btn-primary',
      icon: '💾'
    },
    cancel: {
      text: 'キャンセル',
      class: 'btn-secondary',
      icon: '❌'
    },
    reset: {
      text: 'リセット',
      class: 'btn-danger',
      icon: '🔄'
    },
    addCustom: {
      text: '+ カスタムボタンを追加',
      class: 'btn-primary',
      icon: '➕'
    }
  }
};
