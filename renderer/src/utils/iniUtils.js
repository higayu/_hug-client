// src/utils/iniUtils.js
// ini.json の読み書きユーティリティ

/**
 * ini.jsonを読み込み
 * @returns {Promise<Object|null>} 読み込んだ設定データ、失敗時はnull
 */
const DEFAULT_API_SETTINGS = {
  baseURL: 'http://192.168.1.229',
  staffId: '',
  facilityId: '',
  databaseType: 'sqlite',
  useAI: 'gemini',
}

// 必須キーが欠けている場合にデフォルトで補完
function normalizeIni(data) {
  const next = data ? { ...data } : {}
  if (!next.apiSettings || typeof next.apiSettings !== 'object') {
    next.apiSettings = { ...DEFAULT_API_SETTINGS }
  } else {
    next.apiSettings = {
      ...DEFAULT_API_SETTINGS,
      ...next.apiSettings,
    }
  }
  return next
}

export async function loadIni() {
  try {
    console.log('🔄 [INI] ini.json読み込み開始')
    const result = await window.electronAPI.readIni()

    console.log('🔍 [INI] readIni結果:', result)
    
    if (!result.success) {
      console.error('❌ [INI] 読み込みエラー:', result.error)
      return null
    }

    const data = normalizeIni(result.data)
    console.log('🔍 [INI] 読み込んだデータ(normalized):', data)
    console.log('✅ [INI] ini.json読み込み成功:', data)
    return data
  } catch (err) {
    console.error('❌ [INI] ini.json読み込みエラー:', err)
    return null
  }
}

/**
 * ini.jsonを読み込み
 * @returns {Promise<Object|null>} 読み込んだ設定データ、失敗時はnull
 */
export async function loadPrompt() {
  try {

    const res = await window.electronAPI.loadPrompts();
    return res.data
  } catch (err) {
    console.error('❌ [INI] ini.json読み込みエラー:', err)
    return null
  }
}

/**
 * ini.json を保存（全体上書き）
 * @param {Object} data
 * @returns {Promise<boolean>}
 */
export async function saveIni(data) {
  try {
    const payload = normalizeIni(data)
    const res = await window.electronAPI.saveIni(payload)
    if (!res?.success) {
      console.error('❌ [INI] 保存エラー:', res?.error)
      return false
    }
    return true
  } catch (err) {
    console.error('❌ [INI] 保存エラー:', err)
    return false
  }
}