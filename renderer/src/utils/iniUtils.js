// src/utils/iniUtils.js
// ini.json の読み書きユーティリティ

/**
 * ini.jsonを読み込み
 * @returns {Promise<Object|null>} 読み込んだ設定データ、失敗時はnull
 */
export async function loadIni() {
  try {
    console.log('🔄 [INI] ini.json読み込み開始')
    const result = await window.electronAPI.readIni()
    console.log('🔍 [INI] readIni結果:', result)
    
    if (!result.success) {
      console.error('❌ [INI] 読み込みエラー:', result.error)
      return null
    }

    const data = result.data
    console.log('🔍 [INI] 読み込んだデータ:', data)
    console.log('✅ [INI] ini.json読み込み成功:', data)
    return data
  } catch (err) {
    console.error('❌ [INI] ini.json読み込みエラー:', err)
    return null
  }
}

