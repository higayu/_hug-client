// src/utils/configUtils.js
// 設定ファイル（config.json）の読み書きユーティリティ

import { MESSAGES, ELEMENT_IDS } from './constants.js'
import { getDateString, getTodayWeekdayId } from './dateUtils.js'

/**
 * config.jsonを保存
 * @param {Object} configData - 保存する設定データ
 * @returns {Promise<boolean>} 保存に成功した場合true
 */
export async function saveConfig(configData) {
  try {
    const result = await window.electronAPI.saveConfig(configData)
    if (!result.success) {
      console.error('❌ config.json保存エラー:', result.error)
      return false
    }

    console.log(MESSAGES.SUCCESS.CONFIG_SAVED)
    return true
  } catch (err) {
    console.error(MESSAGES.ERROR.CONFIG_SAVE, err)
    return false
  }
}

/**
 * config.jsonを読み込み
 * @returns {Promise<Object|null>} 読み込んだ設定データ、失敗時はnull
 */
export async function loadConfig() {
  const output = document.getElementById(ELEMENT_IDS.CONFIG_OUTPUT)

  try {
    console.log('🔄 [CONFIG] config.json読み込み開始')
    const result = await window.electronAPI.readConfig()
    console.log('🔍 [CONFIG] readConfig結果:', result)

    if (!result.success) {
      console.error('❌ [CONFIG] 読み込みエラー:', result.error)
      if (output) output.textContent = '❌ 読み込みエラー: ' + result.error
      return null
    }

    const data = result.data ?? {}
    console.log('🔍 [CONFIG] 読み込んだデータ:', data)

    // =============================================================
    // ✅ CURRENT_DATE を自動セット（新仕様）
    // =============================================================
    const dateStr = getDateString()
    const weekdayId = getTodayWeekdayId()

    data.CURRENT_DATE = {
      dateStr,
      weekdayId,
    }

    // 旧キーがあれば削除（事故防止）
    delete data.DATE_STR
    delete data.WEEK_DAY

    console.log('✅ [CONFIG] config.json読み込み成功:', data)
    if (output) output.textContent = JSON.stringify(data, null, 2)

    return data
  } catch (err) {
    console.error('❌ [CONFIG] config.json読み込みエラー:', err)
    if (output) output.textContent = '❌ エラー: ' + err.message
    return null
  }
}
