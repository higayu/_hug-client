// src/utils/reloadSettings.js
// config.json と ini.json の両方を再読み込みしてUIに反映

import { loadConfig } from './configUtils.js'
import { loadIni as loadIniFromUtils,loadPrompt } from './iniUtils.js'
import { sqliteApi } from '../sql/sqliteApi.js'
import { mariadbApi } from '../sql/mariadbApi.js'

/**
 * config.json と ini.json の両方を再読み込みしてUIに反映
 * @returns {Promise<boolean>} 成功なら true
 */
export async function loadAllReload() {
  try {
    console.log("🔄 全設定リロード開始...")

    // ✅ config.json の読み込み
    const configData = await loadConfig()
    const prompt = await loadPrompt()
    console.log("AIのprompt",prompt)

    if (!configData) {
      console.warn("⚠️ config.json の読み込みに失敗しました")
      return false
    }

    // ✅ ini.json の読み込み
    // React Context経由で読み込み（window.IniState経由でアクセス）
    let iniOk = false
    if (window.IniState?.loadIni) {
      iniOk = await window.IniState.loadIni()
    } else {
      console.warn("⚠️ window.IniState.loadIni が見つかりません。IniStateProviderが初期化されるまで待ってください。")
    }
    if (iniOk) {
      console.log("✅ ini.json の読み込み成功")
      // updateButtonVisibility() は呼び出し側で実行される
    } else {
      console.warn("⚠️ ini.json の読み込みに失敗しました")
    }

    // ✅ databaseTypeに基づいてactiveApiを更新
    try {
      const iniData = await loadIniFromUtils()

      if (iniData?.apiSettings?.databaseType) {
        const databaseType = iniData.apiSettings.databaseType
        const newActiveApi = databaseType === 'mariadb' ? mariadbApi : sqliteApi
        
        // window.AppStateとupdateAppStateを更新
        if (window.AppState && window.updateAppState) {
          window.updateAppState({ activeApi: newActiveApi })
          console.log('🔄 [reloadSettings] activeApi更新:', { databaseType, activeApi: newActiveApi === mariadbApi ? 'mariadbApi' : 'sqliteApi' })
        }
      }
    } catch (error) {
      console.error('❌ [reloadSettings] activeApi更新エラー:', error)
    }

    // AppStateを更新（後方互換性のため）
    // AppState は window.AppState 経由でアクセス可能
    if (window.AppState) {
      Object.assign(window.AppState, configData)
    }

    console.log("✅ 全設定リロード完了")
    return true

  } catch (err) {
    console.error("❌ 全設定リロード中にエラー:", err)
    return false
  }
}

