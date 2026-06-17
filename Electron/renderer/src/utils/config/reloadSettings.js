// src/utils/reloadSettings.js
// config.json と ini.json の両方を再読み込みしてUIに反映

import { loadConfig } from './configUtils.js'
import { loadIni as loadIniFromUtils,loadPrompt } from './iniUtils.js'
import { sqliteApi } from '../../sql/sqliteApi.js'
import { mariadbApi } from '../../sql/mariadbApi.js'
import { store } from '@/store/store.js'
import { setPrompts } from '@/store/slices/appStateSlice.js'
/**
 * config.json と ini.json の両方を再読み込みしてUIに反映
 * @returns {Promise<boolean>} 成功なら true
 */
export async function loadAllReload() {
  try {
    console.log('🔄 全設定リロード開始...')

    // config.json
    const configData = await loadConfig()
    const prompt = await loadPrompt()
    store.dispatch(setPrompts(prompt || {}))
    console.log('AIのprompt', prompt)

    if (!configData) {
      console.warn('⚠️ config.json の読み込みに失敗しました')
      return false
    }

    // ini.json（Context経由）
    if (window.IniState?.loadIni) {
      await window.IniState.loadIni()
      console.log('✅ ini.json の読み込み成功')
    } else {
      console.warn('⚠️ window.IniState.loadIni が未初期化')
    }

    // databaseType → activeApi 切替（★ここが本命）
    const iniData = await loadIniFromUtils()

    if (iniData?.apiSettings?.databaseType) {
      const databaseType = iniData.apiSettings.databaseType
      const newActiveApi =
        databaseType === 'mariadb' ? mariadbApi : sqliteApi

      if (window.AppState?.setActiveApi) {
        window.AppState.setActiveApi(newActiveApi)
        console.log(
          '🔄 [reloadSettings] activeApi switched:',
          databaseType
        )
      } else {
        console.warn('⚠️ window.AppState.setActiveApi が存在しません')
      }
    }

    console.log('✅ 全設定リロード完了')
    return true
  } catch (err) {
    console.error('❌ 全設定リロード中にエラー:', err)
    return false
  }
}
