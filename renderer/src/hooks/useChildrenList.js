// src/hooks/useChildrenList.js
// 子どもリスト管理のフック

import { useEffect, useState, useCallback } from 'react'
import { useAppState } from '../contexts/AppStateContext.jsx'
import { ELEMENT_IDS, MESSAGES, EVENTS } from '../utils/constants.js'
import { fetchAttendanceTableData, extractColumnData } from '../utils/attendanceTable.js'

/**
 * 児童の出勤データを取得
 */
async function handleFetchAttendanceForChild(appState) {
  try {
    console.log(`📊 [ATTENDANCE] 出勤データ取得開始`)
    
    // 施設IDと日付を取得
    const facilitySelect = document.getElementById(ELEMENT_IDS.FACILITY_SELECT)
    const dateInput = document.getElementById(ELEMENT_IDS.DATE_SELECT)
    
    const facility_id = facilitySelect?.value || appState.FACILITY_ID
    const date_str = dateInput?.value || appState.DATE_STR

    if (!facility_id || !date_str) {
      console.error("❌ [ATTENDANCE] 施設IDまたは日付が設定されていません")
      return
    }

    const result = await fetchAttendanceTableData(facility_id, date_str, {
      showToast: false
    })

    if (result.success) {
      console.log("✅ [ATTENDANCE] 出勤データ取得成功")
      console.log("📊 [ATTENDANCE] 取得結果:", {
        施設ID: facility_id,
        日付: date_str,
        テーブル行数: result.rowCount,
        ページタイトル: result.pageTitle,
        ページURL: result.pageUrl,
        テーブルクラス: result.className
      })
      
      // テーブルから1列目と5列目を抽出
      if (result.html) {
        console.log("📋 [ATTENDANCE] 列データ抽出開始...")
        const extractedResult = await extractColumnData(result.html)
        
        if (extractedResult.success) {
          console.log("✅ [ATTENDANCE] 列データ抽出成功:", {
            抽出行数: extractedResult.rowCount,
            サンプルデータ: extractedResult.data.slice(0, 3)
          })
          
          // 抽出したデータを保存
          try {
            const saveResult = await window.electronAPI.saveAttendanceColumnData({
              facilityId: facility_id,
              dateStr: date_str,
              extractedData: extractedResult.data
            })
            
            if (saveResult && saveResult.success) {
              console.log("✅ [ATTENDANCE] 列データ保存成功")
            } else {
              console.error("❌ [ATTENDANCE] 列データ保存失敗:", saveResult?.error)
            }
          } catch (saveError) {
            console.error("❌ [ATTENDANCE] 列データ保存エラー:", saveError)
          }
        } else {
          console.error("❌ [ATTENDANCE] 列データ抽出失敗:", extractedResult.error)
        }
      }
    } else {
      console.error("❌ [ATTENDANCE] 出勤データ取得失敗")
      console.error("❌ [ATTENDANCE] エラー:", result.error)
      if (result.debugInfo) {
        console.error("❌ [ATTENDANCE] デバッグ情報:", result.debugInfo)
      }
    }
  } catch (error) {
    console.error("❌ [ATTENDANCE] 出勤データ取得エラー:", error)
    console.error("❌ [ATTENDANCE] エラー詳細:", {
      message: error.message,
      stack: error.stack
    })
  }
}

/**
 * 一時メモの保存
 */
async function saveTempNote(childId, enterTime, exitTime, memo, appState) {
  try {
    const result = await window.electronAPI.saveTempNote({
      childId,
      staffId: appState.STAFF_ID,
      dateStr: appState.DATE_STR,
      weekDay: appState.WEEK_DAY,
      enterTime,
      exitTime,
      memo
    })
    
    if (result.success) {
      console.log(`${MESSAGES.SUCCESS.TEMP_NOTE_SAVED}: ${childId} - ${enterTime} ～ ${exitTime}`)
    } else {
      console.error(`❌ 一時メモ保存失敗: ${result.error}`)
    }
  } catch (error) {
    console.error(`${MESSAGES.ERROR.TEMP_NOTE_SAVE}:`, error)
  }
}

/**
 * 一時メモの読み込み
 */
async function loadTempNote(childId, enterTimeInput, exitTimeInput, memoTextarea, appState) {
  try {
    console.log('🔍 一時メモ読み込み開始:', {
      childId,
      staffId: appState.STAFF_ID,
      dateStr: appState.DATE_STR,
      weekDay: appState.WEEK_DAY
    })
    
    const result = await window.electronAPI.getTempNote({
      childId,
      staffId: appState.STAFF_ID,
      dateStr: appState.DATE_STR,
      weekDay: appState.WEEK_DAY
    })
    
    console.log('📥 一時メモ取得結果:', result)
    
    if (result && result.success && result.data) {
      enterTimeInput.value = result.data.enter_time || ""
      exitTimeInput.value = result.data.exit_time || ""
      memoTextarea.value = result.data.memo || ""
      console.log(`${MESSAGES.SUCCESS.TEMP_NOTE_LOADED}: ${childId} - ${result.data.enter_time} ～ ${result.data.exit_time}`)
    } else {
      console.log(`${MESSAGES.INFO.TEMP_NOTE_NONE}: ${childId} (${appState.WEEK_DAY})`)
    }
  } catch (error) {
    console.error(`${MESSAGES.ERROR.TEMP_NOTE_LOAD}:`, error)
    console.error(`❌ エラー詳細:`, error.message || error)
    console.error(`❌ エラースタック:`, error.stack)
  }
}

/**
 * 子どもリスト管理のフック
 */
export function useChildrenList() {
  const { appState, setSelectedChild, setSelectedPcName, setChildrenData, updateAppState, SELECT_CHILD } = useAppState()
  const [childrenData, setLocalChildrenData] = useState([])
  const [waitingChildrenData, setWaitingChildrenData] = useState([])
  const [experienceChildrenData, setExperienceChildrenData] = useState([])

  // 子どもデータを読み込む
  const loadChildren = useCallback(async () => {
    try {
      const facilitySelect = document.getElementById(ELEMENT_IDS.FACILITY_SELECT)
      const facility_id = facilitySelect ? facilitySelect.value : null
      
      const data = await window.electronAPI.GetChildrenByStaffAndDay(appState.STAFF_ID, appState.WEEK_DAY, facility_id)
      
      // React Contextを使用して更新
      setChildrenData(data.week_children || [])
      updateAppState({
        waiting_childrenData: data.waiting_children || [],
        Experience_childrenData: data.Experience_children || []
      })
      
      // ローカル状態も更新
      setLocalChildrenData(data.week_children || [])
      setWaitingChildrenData(data.waiting_children || [])
      setExperienceChildrenData(data.Experience_children || [])
      
      // window.AppStateも更新（後方互換性のため）
      if (window.AppState) {
        window.AppState.childrenData = data.week_children || []
        window.AppState.waiting_childrenData = data.waiting_children || []
        window.AppState.Experience_childrenData = data.Experience_children || []
      }
      
      console.log(MESSAGES.INFO.API_DATA, data)
    } catch (error) {
      console.error('❌ 子どもデータ読み込みエラー:', error)
    }
  }, [appState.STAFF_ID, appState.WEEK_DAY, setChildrenData, updateAppState])

  // 曜日変更イベントをリッスン
  useEffect(() => {
    const handleWeekdayChanged = async () => {
      // 選択をクリア
      setSelectedChild("", "")
      
      // window.AppStateも更新（後方互換性のため）
      if (window.AppState) {
        window.AppState.SELECT_CHILD = ""
        window.AppState.SELECT_CHILD_NAME = ""
      }
      
      await loadChildren()
    }

    window.addEventListener('weekday-changed', handleWeekdayChanged)
    
    return () => {
      window.removeEventListener('weekday-changed', handleWeekdayChanged)
    }
  }, [loadChildren, setSelectedChild])

  // WEEK_DAYが変更されたときに再読み込み
  useEffect(() => {
    if (appState.WEEK_DAY) {
      loadChildren()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appState.WEEK_DAY])

  // 最初の子どもを自動選択
  useEffect(() => {
    if (childrenData.length > 0 && !SELECT_CHILD) {
      const firstChild = childrenData[0]
      setSelectedChild(firstChild.children_id, firstChild.children_name)
      if (firstChild.pc_name) {
        setSelectedPcName(firstChild.pc_name)
      }
      
      // window.AppStateも更新（後方互換性のため）
      if (window.AppState) {
        window.AppState.SELECT_CHILD = firstChild.children_id
        window.AppState.SELECT_CHILD_NAME = firstChild.children_name
        window.AppState.SELECT_PC_NAME = firstChild.pc_name || ''
      }
      
      console.log(`選択状態を変更する: ${firstChild.children_name}:${firstChild.pc_name || ''}`)
    }
  }, [childrenData, SELECT_CHILD, setSelectedChild, setSelectedPcName])

  return {
    childrenData,
    waitingChildrenData: waitingChildrenData,
    experienceChildrenData: experienceChildrenData,
    loadChildren,
    handleFetchAttendanceForChild: useCallback((childId, childName) => {
      handleFetchAttendanceForChild(childId, childName, appState)
    }, [appState]),
    saveTempNote: useCallback(async (childId, enterTime, exitTime, memo) => {
      await saveTempNote(childId, enterTime, exitTime, memo, appState)
    }, [appState]),
    loadTempNote: useCallback((childId, enterTimeInput, exitTimeInput, memoTextarea) => {
      loadTempNote(childId, enterTimeInput, exitTimeInput, memoTextarea, appState)
    }, [appState]),
    SELECT_CHILD: appState.SELECT_CHILD
  }
}

