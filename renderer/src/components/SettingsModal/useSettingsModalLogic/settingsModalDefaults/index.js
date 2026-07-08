// renderer/src/components/SettingsModal/useSettingsModalLogic/settingsModalDefaults/index.js

export const defaultIniState = {
    version: '1.0.0',
    appSettings: {
      autoLogin: {
        enabled: true,
        username: '',
        password: '',
      },
      ui: {
        theme: 'light',
        language: 'ja',
        showCloseButtons: true,
        confirmOnClose: true,
        autoRefresh: {
          enabled: false,
          interval: 30000,
        },
      },
      features: {
        getUrl: {
          enabled: true,
          buttonText: 'URL取得',
          buttonColor: '#17a2b8',
        },
      },
      window: {
        width: 1200,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        maximized: false,
        alwaysOnTop: false,
      },
      notifications: {
        enabled: true,
        sound: true,
        desktop: true,
      },
    },
    userPreferences: {
      lastLoginDate: '',
      rememberWindowState: true,
      showWelcomeMessage: true,
    },
    apiSettings: {
      baseURL: 'http://192.168.1.229',
      staffId: '',
      facilityId: '3',
      databaseType: 'mariadb',
      useAI: 'chatGPT',
      autoSynchronization: 'true',
      autoSwitching: 'true',
    },
  }