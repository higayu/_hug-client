// renderer/src/hooks/useToDayWorkList.js
import { useAppState } from "../contexts/AppStateContext.jsx";
import { fetchAttendanceTableData } from "../utils/attendanceTable.js";
import { fetchAndExtractAttendanceData } from "../store/slices/attendanceSlice.js";
import { 
  ELEMENT_IDS, 
  MESSAGES, 
  EVENTS
} from "../utils/constants.js";

/**
 * 児童の出勤データを取得（コンソール出力のみ）
 * @param {string} childId - 児童ID
 * @param {string} childName - 児童名
 */
/**
 * 児童の出勤データを取得（Redux版）
 */
async function handleFetchAttendanceForChild(appState, updateAppState, dispatch) {
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

    // Reduxの非同期アクションを実行
    const result = await dispatch(fetchAndExtractAttendanceData({
      facility_id,
      date_str,
      options: { showToast: false }
    }))

    if (fetchAndExtractAttendanceData.fulfilled.match(result)) {
      const { tableData, extractedData } = result.payload
      
      console.log("✅ [ATTENDANCE] 出勤データ取得成功")
      console.log("📊 [ATTENDANCE] 取得結果:", {
        施設ID: facility_id,
        日付: date_str,
        テーブル行数: tableData.rowCount,
        ページタイトル: tableData.pageTitle,
        ページURL: tableData.pageUrl,
        テーブルクラス: tableData.className
      })
      
      if (extractedData) {
        console.log("✅ [ATTENDANCE] 列データ抽出成功:", {
          抽出行数: extractedData.rowCount,
          サンプルデータ: extractedData.data.slice(0, 3)
        })
        
        // グローバル変数として保存（window.AppStateとAppStateContext）- 後方互換性のため
        const attendanceData = {
          facilityId: facility_id,
          dateStr: date_str,
          extractedAt: new Date().toISOString(),
          rowCount: extractedData.rowCount,
          data: extractedData.data
        }
        
        // AppStateContextに保存（後方互換性のため）
        updateAppState({ attendanceData: attendanceData })
        
        // window.AppStateにも保存（後方互換性のため）
        if (window.AppState) {
          window.AppState.attendanceData = attendanceData
        }
        
        console.log("✅ [ATTENDANCE] グローバル変数に保存完了:", {
          facilityId: facility_id,
          dateStr: date_str,
          rowCount: extractedData.rowCount
        })
        
        // ファイルにも保存
        try {
          const saveResult = await window.electronAPI.saveAttendanceColumnData({
            facilityId: facility_id,
            dateStr: date_str,
            extractedData: extractedData.data
          })
          
          if (saveResult && saveResult.success) {
            console.log("✅ [ATTENDANCE] 列データファイル保存成功", saveResult.filePath)
          } else {
            console.error("❌ [ATTENDANCE] 列データファイル保存失敗:", saveResult?.error)
          }
        } catch (saveError) {
          console.error("❌ [ATTENDANCE] 列データファイル保存エラー:", saveError)
        }
      } else {
        console.warn("⚠️ [ATTENDANCE] 列データ抽出がスキップされました")
      }
    } else {
      const error = result.payload || result.error || '予期しないエラー'
      console.error("❌ [ATTENDANCE] 出勤データ取得失敗")
      console.error("❌ [ATTENDANCE] エラー:", error)
    }
  } catch (error) {
    console.error("❌ [ATTENDANCE] 出勤データ取得エラー:", error)
    console.error("❌ [ATTENDANCE] エラー詳細:", {
      message: error.message,
      stack: error.stack
    })
  }
}

export { handleFetchAttendanceForChild };