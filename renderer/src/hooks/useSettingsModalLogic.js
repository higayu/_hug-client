// renderer/src/hooks/useSettingsModalLogic.js
import { useEffect, useRef, useCallback, useState } from 'react'
import { useAppState } from '@/contexts/appState'
import { useCustomButtons } from '@/components/common/CustomButtonsContext.jsx'
// AppState は window.AppState または useAppState() フック経由でアクセス可能
import { saveConfig } from '@/utils/configUtils.js'
import { useToast } from  '@/components/common/ToastContext.jsx'
import { loadAllReload } from '@/utils/reloadSettings.js'
import { updateButtonVisibility } from '@/utils/buttonVisibility.js'
import { useCustomButtonManager } from './useCustomButtonManager.js'
// buttonVisibilityManager は削除されました（機能が空のため）
import { getActiveWebview } from '@/utils/webviewState.js'
import { getJoinedStaffFacilityData } from "@/sql/staff_facility_v/staffDispatcher.js";
import { sqliteApi } from "@/sql/sqliteApi.js";
import { mariadbApi } from "@/sql/mariadbApi.js";

// 設定モーダルの初期化と設定の保存
export function useSettingsModalLogic(isOpen) {
  const { showSuccessToast, showErrorToast } = useToast()

  const {
    appState,
    updateAppState,

    // ini 関連（AppStateContext から）
    iniState,
    loadIni,
    saveIni,
    updateIniSetting,
    setIniState
  } = useAppState()
  const { saveCustomButtons: saveCustomButtonsContext } = useCustomButtons()
  const { reloadCustomButtons } = useCustomButtonManager()
  const originalSettingsRef = useRef(null)
  // モーダルが開かれた時に元の設定をバックアップ
  useEffect(() => {
    if (isOpen && !originalSettingsRef.current) {
      originalSettingsRef.current = JSON.parse(JSON.stringify(iniState))
      console.log('✅ [SettingsModal] 元の設定をバックアップしました')
    }
  }, [isOpen, iniState])

  // フォームに値を設定
  const populateForm = useCallback(() => {
    console.log('🔍 [SettingsModal] フォームに値を設定中...')

    // 機能の有効/無効
    const features = iniState.appSettings.features
    Object.keys(features).forEach(featureName => {
      const checkbox = document.getElementById(`feature-${featureName}`)
      if (checkbox) {
        checkbox.checked = features[featureName].enabled
      }
    })

    // ボタンテキスト
    Object.keys(features).forEach(featureName => {
      const textInput = document.getElementById(`text-${featureName}`)
      if (textInput) {
        textInput.value = features[featureName].buttonText || ''
      }
    })

    // ボタンカラー
    Object.keys(features).forEach(featureName => {
      const colorInput = document.getElementById(`color-${featureName}`)
      if (colorInput) {
        colorInput.value = features[featureName].buttonColor || '#007bff'
      }
    })

    // UI設定
    const ui = iniState.appSettings.ui
    const themeSelect = document.getElementById('theme-select')
    if (themeSelect) themeSelect.value = ui.theme || 'light'

    const languageSelect = document.getElementById('language-select')
    if (languageSelect) languageSelect.value = ui.language || 'ja'

    const showCloseButtons = document.getElementById('show-close-buttons')
    if (showCloseButtons) showCloseButtons.checked = ui.showCloseButtons || false

    const autoRefresh = document.getElementById('auto-refresh')
    if (autoRefresh) autoRefresh.checked = ui.autoRefresh?.enabled || false

    const refreshInterval = document.getElementById('refresh-interval')
    if (refreshInterval) refreshInterval.value = ui.autoRefresh?.interval || 30000

    const confirmOnClose = document.getElementById('confirm-on-close')
    if (confirmOnClose) {
      confirmOnClose.checked = ui.confirmOnClose !== undefined ? ui.confirmOnClose : true
    }

    // ウィンドウ設定
    const window = iniState.appSettings.window
    const windowWidth = document.getElementById('window-width')
    if (windowWidth) windowWidth.value = window.width || 1200

    const windowHeight = document.getElementById('window-height')
    if (windowHeight) windowHeight.value = window.height || 800

    const windowMaximized = document.getElementById('window-maximized')
    if (windowMaximized) windowMaximized.checked = window.maximized || false

    const windowAlwaysOnTop = document.getElementById('window-always-on-top')
    if (windowAlwaysOnTop) windowAlwaysOnTop.checked = window.alwaysOnTop || false

    // 現在のURL表示: 表示/値の制御はReact側(FeaturesTab)に委譲

    // Config.json設定
    const configUsername = document.getElementById('config-username')
    if (configUsername) configUsername.value = appState.HUG_USERNAME || ''

    const configPassword = document.getElementById('config-password')
    if (configPassword) configPassword.value = appState.HUG_PASSWORD || ''

    const configGemini = document.getElementById('config-gemini')
    if (configGemini) configGemini.value = appState.GEMINI_API_KEY || ''

    // API設定 (ini.json)
    const apiBaseUrl = document.getElementById('api-base-url')
    if (apiBaseUrl) apiBaseUrl.value = iniState?.apiSettings?.baseURL || ''

    const apiStaffId = document.getElementById('api-staff-id')
    if (apiStaffId) apiStaffId.value = iniState?.apiSettings?.staffId || ''

    const apiFacilityId = document.getElementById('api-facility-id')
    if (apiFacilityId) apiFacilityId.value = iniState?.apiSettings?.facilityId || ''

    const apiDatabaseType = document.getElementById('api-database-type')
    if (apiDatabaseType) apiDatabaseType.value = iniState?.apiSettings?.databaseType || 'sqlite'

    const apiAiType = document.getElementById('api-ai-type')
    if (apiAiType) {
      apiAiType.value = iniState?.apiSettings?.useAI || 'gemini'
      console.log('🔍 [SettingsModal] apiAiType:', apiAiType.value)
    } else {
      console.warn('⚠️ [SettingsModal] api-ai-type 要素が見つかりません')
    }
    
    console.log('✅ [SettingsModal] フォームに値を設定しました')
  }, [appState, iniState])

  // フォームの値をIniStateに反映
  const updateIniStateFromForm = useCallback(() => {
    // 新しい状態オブジェクトを作成
    const newIniState = JSON.parse(JSON.stringify(iniState)) // ディープコピー
    
    // 機能の有効/無効
    const features = newIniState.appSettings.features
    Object.keys(features).forEach(featureName => {
      const checkbox = document.getElementById(`feature-${featureName}`)
      if (checkbox) {
        features[featureName].enabled = checkbox.checked
      }
    })

    // ボタンテキスト
    Object.keys(features).forEach(featureName => {
      const textInput = document.getElementById(`text-${featureName}`)
      if (textInput) {
        features[featureName].buttonText = textInput.value
      }
    })

    // ボタンカラー
    Object.keys(features).forEach(featureName => {
      const colorInput = document.getElementById(`color-${featureName}`)
      if (colorInput) {
        features[featureName].buttonColor = colorInput.value
      }
    })

    // UI設定
    const themeSelect = document.getElementById('theme-select')
    if (themeSelect) newIniState.appSettings.ui.theme = themeSelect.value

    const languageSelect = document.getElementById('language-select')
    if (languageSelect) newIniState.appSettings.ui.language = languageSelect.value

    const showCloseButtons = document.getElementById('show-close-buttons')
    if (showCloseButtons) newIniState.appSettings.ui.showCloseButtons = showCloseButtons.checked

    const autoRefresh = document.getElementById('auto-refresh')
    if (autoRefresh) newIniState.appSettings.ui.autoRefresh.enabled = autoRefresh.checked

    const refreshInterval = document.getElementById('refresh-interval')
    if (refreshInterval) {
      newIniState.appSettings.ui.autoRefresh.interval = parseInt(refreshInterval.value)
    }

    const confirmOnClose = document.getElementById('confirm-on-close')
    if (confirmOnClose) newIniState.appSettings.ui.confirmOnClose = confirmOnClose.checked

    // ウィンドウ設定
    const windowWidth = document.getElementById('window-width')
    if (windowWidth) newIniState.appSettings.window.width = parseInt(windowWidth.value)

    const windowHeight = document.getElementById('window-height')
    if (windowHeight) newIniState.appSettings.window.height = parseInt(windowHeight.value)

    const windowMaximized = document.getElementById('window-maximized')
    if (windowMaximized) newIniState.appSettings.window.maximized = windowMaximized.checked

    const windowAlwaysOnTop = document.getElementById('window-always-on-top')
    if (windowAlwaysOnTop) newIniState.appSettings.window.alwaysOnTop = windowAlwaysOnTop.checked
    
    // API設定 (ini.json)
    if (!newIniState.apiSettings) {
      newIniState.apiSettings = {}
    }
    
    const apiBaseUrl = document.getElementById('api-base-url')
    if (apiBaseUrl) newIniState.apiSettings.baseURL = apiBaseUrl.value || ''
    
    const apiStaffId = document.getElementById('api-staff-id')
    if (apiStaffId) newIniState.apiSettings.staffId = apiStaffId.value || ''
    
    const apiFacilityId = document.getElementById('api-facility-id')
    if (apiFacilityId) newIniState.apiSettings.facilityId = apiFacilityId.value || ''
    
    const apiDatabaseType = document.getElementById('api-database-type')
    if (apiDatabaseType) newIniState.apiSettings.databaseType = apiDatabaseType.value || 'sqlite'
    
    const apiAiType = document.getElementById('api-ai-type')
    if (apiAiType) newIniState.apiSettings.useAI = apiAiType.value || 'gemini'
    
    // 状態を更新
    setIniState(newIniState)
    return newIniState
  }, [iniState, setIniState])

  // 設定を保存
  const saveSettings = useCallback(async () => {
    try {
      // フォームの値をIniStateに反映（保存用に新状態を受け取る）
      const newState = updateIniStateFromForm()

      // ini.jsonに保存（非同期setStateの反映待ち不要のため新状態を直接保存）
      const iniSuccess = await saveIni(newState)

      // カスタムボタンを保存
      const customButtonsSuccess = await saveCustomButtonsContext()

      if (iniSuccess && customButtonsSuccess) {
        showSuccessToast('✅ 設定を保存しました')

        // 🔄 全設定をリロードし、UIを最新化
        try {
          const reloadOk = await loadAllReload()
          if (reloadOk) {
            updateButtonVisibility()
            await reloadCustomButtons()
          }
        } catch (e) {
          console.error('❌ 全設定リロード中にエラー:', e)
        }

        // 他UIへ設定更新を通知
        try {
          document.dispatchEvent(new CustomEvent('app-settings-updated', { detail: { IniState: iniState } }))
        } catch (e) {
          // 通知失敗は無視
        }

        return true
      } else {
        showErrorToast('❌ 設定の保存に失敗しました')
        return false
      }
    } catch (error) {
      console.error('設定保存エラー:', error)
      showErrorToast('❌ 設定の保存中にエラーが発生しました')
      return false
    }
  }, [updateIniStateFromForm, saveIni, saveCustomButtonsContext, iniState, showSuccessToast, showErrorToast])

  // 編集前に戻す（元のリセット機能をリネーム）
  const resetToOriginal = useCallback(() => {
    if (confirm('編集前の状態に戻しますか？')) {
      // バックアップから復元
      if (originalSettingsRef.current) {
        setIniState(JSON.parse(JSON.stringify(originalSettingsRef.current)))
        populateForm()
        console.log('✅ [SettingsModal] 編集前の状態に戻しました')
      }
    }
  }, [populateForm, setIniState])

  // デフォルト値にリセット
  const resetToDefault = useCallback(async () => {
    if (confirm('設定をデフォルト値にリセットしますか？\nこの操作は保存しない限り反映されません。')) {
      try {
        // デフォルト設定を構築（iniHandler.jsのdefaultIniと同じ構造）
        const defaultIniState = {
          version: "1.0.0",
          appSettings: {
            autoLogin: {
              enabled: true,
              username: "",
              password: "",
            },
            ui: {
              theme: "light",
              language: "ja",
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
                buttonText: "URL取得",
                buttonColor: "#17a2b8",
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
            lastLoginDate: "",
            rememberWindowState: true,
            showWelcomeMessage: true,
          },
          apiSettings: {
            baseURL: "http://192.168.1.229",
            staffId: "",
            facilityId: "3",
            databaseType: "mariadb",
            useAI: "chatGPT",
          },
        }

        // 状態を更新
        setIniState(defaultIniState)
        // フォームに値を設定（少し遅延させてDOMが更新されるのを待つ）
        setTimeout(() => {
          populateForm()
          // セレクトボックスも初期化
          initializeApiSelectBoxes()
        }, 100)
        
        console.log('✅ [SettingsModal] デフォルト値にリセットしました')
        showSuccessToast('✅ デフォルト値にリセットしました（保存ボタンを押して確定してください）')
      } catch (error) {
        console.error('❌ [SettingsModal] リセットエラー:', error)
        showErrorToast('❌ リセット中にエラーが発生しました')
      }
    }
  }, [populateForm, setIniState, showSuccessToast, showErrorToast])

  // パスワード表示切替え
  const togglePasswordVisibility = useCallback(() => {
    const passwordInput = document.getElementById('config-password')
    const toggleBtn = document.getElementById('toggle-password')

    if (passwordInput && toggleBtn) {
      if (passwordInput.type === 'password') {
        passwordInput.type = 'text'
        toggleBtn.textContent = '🙈'
        toggleBtn.title = 'パスワードを隠す'
      } else {
        passwordInput.type = 'password'
        toggleBtn.textContent = '👁️'
        toggleBtn.title = 'パスワードを表示'
      }
    }
  }, [])

  // Config.jsonを保存
  const saveConfigFromForm = useCallback(async () => {
    try {
      const configData = {
        HUG_USERNAME: document.getElementById('config-username')?.value || '',
        HUG_PASSWORD: document.getElementById('config-password')?.value || '',
        GEMINI_API_KEY: document.getElementById('config-gemini')?.value || ''
      }

      // AppStateを更新（Context APIとwindow.AppStateの両方を更新）
      updateAppState(configData)
      if (window.AppState) {
        Object.assign(window.AppState, configData)
      }

      // ファイルに保存
      const success = await saveConfig(configData)
      if (success) {
        showSuccessToast('✅ Config.jsonの保存が完了しました')
        return true
      } else {
        showErrorToast('❌ Config.jsonの保存に失敗しました')
        return false
      }
    } catch (error) {
      console.error('❌ Config.json保存エラー:', error)
      showErrorToast('❌ エラーが発生しました: ' + error.message)
      return false
    }
  }, [updateAppState, showSuccessToast, showErrorToast])

  // セレクトボックスを初期化（Config用 - 現在は使用されていない）
  const initializeSelectBoxes = useCallback(async () => {
    // Config.jsonにはスタッフIDと施設IDがなくなったため、空の実装
    console.log('✅ [SettingsModal] Configセレクトボックス初期化（不要）')
  }, [])


  // API設定のセレクトボックスを初期化
  const initializeApiSelectBoxes = useCallback(async () => {
    try {
      console.group("🧩 [SettingsModal] initializeApiSelectBoxes 開始");
  
      const staffSelect = document.getElementById("api-staff-id");
      const facilitySelect = document.getElementById("api-facility-id");
      const aiSelect = document.getElementById("api-ai-type");
    const baseUrlInput = document.getElementById("api-base-url");
      
      // activeApiを取得（appStateから、またはiniStateのdatabaseTypeに基づいて）
      const apiToUse = appState?.activeApi || (iniState?.apiSettings?.databaseType === 'mariadb' ? mariadbApi : sqliteApi);
      console.log("📌 activeApi:", apiToUse === mariadbApi ? 'mariadbApi' : 'sqliteApi');
  
      // まずReduxストアからデータを取得
      let data = getJoinedStaffFacilityData();
      console.log("📊 Reduxストアから取得データ:", data);
  
      // Reduxストアにデータがない場合は、データベースから直接取得
      if (!data || !Array.isArray(data) || data.length === 0) {
        console.log("⚠️ Reduxストアにデータがないため、データベースから直接取得します");
        
        try {
          // activeApiを使ってデータベースから全テーブルを取得
          const tables = await apiToUse.getAllTables();
          console.log("📊 データベースから取得したテーブル:", tables);
          
          if (tables && (tables.staffs || tables.facility_staff || tables.facilitys)) {
            // getJoinedStaffFacilityDataと同じ処理を実行
            const staffs = tables.staffs || [];
            const facilityStaff = tables.facility_staff || [];
            const facilitys = tables.facilitys || [];
            
            console.log("🧾 データ確認:", { staffs, facilityStaff, facilitys });
            
            // スタッフごとの施設情報をまとめる
            data = staffs
              .filter((s) => s.id !== -1 && s.is_delete !== 1)
              .map((s) => {
                const relatedFs = facilityStaff.filter((fs) => fs.staff_id === s.id);
                const relatedFacilities = relatedFs
                  .map((fs) => facilitys.find((f) => f.id === fs.facility_id))
                  .filter(Boolean);
                
                const facility_ids = relatedFacilities.map((f) => f.id).join(",");
                const facility_names = relatedFacilities.map((f) => f.name).join(", ");
                
                return {
                  staff_id: s.id,
                  staff_name: s.name,
                  notes: s.notes,
                  is_delete: s.is_delete,
                  facility_ids,
                  facility_names,
                };
              });
            
            console.log("✅ データベースから結合結果:", data);
          } else {
            console.warn("⚠️ テーブルデータが取得できませんでした");
            console.groupEnd();
            return;
          }
        } catch (error) {
          console.error("❌ データベースからの取得エラー:", error);
          console.groupEnd();
          return;
        }
      }
      
      if (!data || !Array.isArray(data) || data.length === 0) {
        console.warn("⚠️ データが取得できませんでした");
        console.groupEnd();
        return;
      }
  
      // スタッフリストを生成（dataそのものを使用）
      const staffList = data.map((item) => ({
        staff_id: item.staff_id,
        staff_name: item.staff_name,
      }));
  
      // 施設リストを生成（facility_namesを分割して重複を削除）
      const facilityMap = new Map();
      data.forEach((item) => {
        if (item.facility_names && item.facility_ids) {
          const facilityNames = item.facility_names.split(", ").map((name) => name.trim());
          const facilityIds = item.facility_ids.split(",").map((id) => id.trim());
          
          facilityNames.forEach((name, index) => {
            if (name && !facilityMap.has(name)) {
              facilityMap.set(name, facilityIds[index] || "");
            }
          });
        }
      });
      
      const facilityList = Array.from(facilityMap.entries()).map(([name, id]) => ({
        id: id || "",
        name: name,
      }));
  
      // スタッフセレクト初期化
      if (staffSelect) {
        while (staffSelect.children.length > 1) {
          staffSelect.removeChild(staffSelect.lastChild);
        }
        staffList.forEach((staff) => {
          const option = document.createElement("option");
          option.value = staff.staff_id;
          option.textContent = staff.staff_name;
          staffSelect.appendChild(option);
        });
        console.log("✅ [SettingsModal] スタッフセレクト初期化完了");
      } else {
        console.warn("⚠️ staffSelect 要素が見つかりません");
      }
  
      // 施設セレクト初期化
      if (facilitySelect) {
        while (facilitySelect.children.length > 1) {
          facilitySelect.removeChild(facilitySelect.lastChild);
        }
        facilityList.forEach((facility) => {
          const option = document.createElement("option");
          option.value = facility.id;
          option.textContent = facility.name;
          facilitySelect.appendChild(option);
        });
        console.log("✅ [SettingsModal] 施設セレクト初期化完了");
      } else {
        console.warn("⚠️ facilitySelect 要素が見つかりません");
      }
  
      // 現在値の設定
      const selectedStaffId = iniState?.apiSettings?.staffId || "";
      const selectedFacilityId = iniState?.apiSettings?.facilityId || "";
      const selectedAiType = iniState?.apiSettings?.useAI || "gemini";
    const selectedBaseUrl = iniState?.apiSettings?.baseURL || "";
  
      console.log("🎯 iniState.apiSettings:", iniState?.apiSettings);
      console.log("🎯 適用 staffId:", selectedStaffId);
      console.log("🎯 適用 facilityId:", selectedFacilityId);
      console.log("🎯 適用 AI種別:", selectedAiType);
      if (staffSelect) staffSelect.value = selectedStaffId;
      if (facilitySelect) facilitySelect.value = selectedFacilityId;
      if (aiSelect) aiSelect.value = selectedAiType;
    if (baseUrlInput) baseUrlInput.value = selectedBaseUrl;
      console.groupEnd();
    } catch (error) {
      console.error("❌ [SettingsModal] APIセレクトボックス初期化エラー:", error);
      console.groupEnd();
    }
  }, [iniState, appState]);
  


  // API設定を保存
  const saveApiSettingsFromForm = useCallback(async () => {
    try {
      // 新しい状態オブジェクトを作成
      const newIniState = JSON.parse(JSON.stringify(iniState)) // ディープコピー
      
      // apiSettingsが存在しない場合は作成
      if (!newIniState.apiSettings) {
        newIniState.apiSettings = {}
      }

      // フォームから値を取得して設定
      const apiBaseUrl = document.getElementById('api-base-url')
      if (apiBaseUrl) newIniState.apiSettings.baseURL = apiBaseUrl.value || ''

      const apiStaffId = document.getElementById('api-staff-id')
      if (apiStaffId) newIniState.apiSettings.staffId = apiStaffId.value || ''

      const apiFacilityId = document.getElementById('api-facility-id')
      if (apiFacilityId) newIniState.apiSettings.facilityId = apiFacilityId.value || ''

      const apiDatabaseType = document.getElementById('api-database-type')
      if (apiDatabaseType) newIniState.apiSettings.databaseType = apiDatabaseType.value || 'sqlite'

      const apiAiType = document.getElementById('api-ai-type')
      if (apiAiType) newIniState.apiSettings.useAI = apiAiType.value || 'gemini'

      // ini.jsonに保存
      const success = await saveIni(newIniState)
      if (success) {
        // Reactの状態も更新（これが重要！）
        setIniState(newIniState)
        
        // databaseType に基づく activeApi は非シリアライズのため Redux には流さない
        const databaseType = newIniState.apiSettings.databaseType || 'sqlite'
        const newActiveApi = databaseType === 'mariadb' ? mariadbApi : sqliteApi
        const useAI = newIniState.apiSettings.useAI || 'gemini'

        // window.AppState 上で直接更新（Reduxには関数を流さない）
        if (window.AppState) {
          window.AppState.activeApi = newActiveApi
          window.AppState.USE_AI = useAI
          window.AppState.DATABASE_TYPE = databaseType
        }
        if (window.updateAppState) {
          window.updateAppState({ USE_AI: useAI, DATABASE_TYPE: databaseType })
        }

        console.log('🔄 [useSettingsModalLogic] activeApi更新:', { databaseType, activeApi: newActiveApi === mariadbApi ? 'mariadbApi' : 'sqliteApi' })
        console.log('🔄 [useSettingsModalLogic] useAI更新:', { useAI })
        
        showSuccessToast('✅ API設定の保存が完了しました')
        return true
      } else {
        showErrorToast('❌ API設定の保存に失敗しました')
        return false
      }
    } catch (error) {
      console.error('❌ API設定保存エラー:', error)
      showErrorToast('❌ エラーが発生しました: ' + error.message)
      return false
    }
  }, [iniState, saveIni, setIniState, showSuccessToast, showErrorToast])

  return {
    populateForm,
    saveSettings,
    resetToOriginal,
    resetToDefault,
    togglePasswordVisibility,
    saveConfigFromForm,
    initializeSelectBoxes,
    saveApiSettingsFromForm,
    initializeApiSelectBoxes
  }
}

